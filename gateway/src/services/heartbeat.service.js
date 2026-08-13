/*
 * Gateway/API Gateway: punto de entrada unico que enruta peticiones, aplica seguridad basica y oculta al cliente si atiende el primario o el respaldo.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 */

const axios = require("axios");

const config = require("../config");

const { getActiveNode, activateBackup } = require("./node-manager.service");

const heartbeatState = {
  running: false,

  primary: {
    status: "UNKNOWN",
    consecutiveFailures: 0,
    lastCheck: null,
    lastSuccess: null,
    details: null,
  },

  backup: {
    status: "UNKNOWN",
    consecutiveFailures: 0,
    lastCheck: null,
    lastSuccess: null,
    details: null,
  },
};

let heartbeatTimer = null;

let checkInProgress = false;

let failoverInProgress = false;

let recoveryInProgress = false;

// Monitorea nodos y decide a cual enviar trafico cuando ocurre una falla.
// Hace un heartbeat HTTP contra un nodo y clasifica si esta activo o fallo por timeout/error.
async function checkNode(nodeKey, url) {
  const state = heartbeatState[nodeKey];

  state.lastCheck = new Date().toISOString();

  try {
    const response = await axios.get(`${url}/health`, {
      timeout: config.heartbeat.timeoutMs,
    });

    state.status = "ACTIVE";

    state.consecutiveFailures = 0;

    state.lastSuccess = new Date().toISOString();

    state.details = response.data;

    return true;
  } catch (error) {
    state.status = "INACTIVE";

    state.consecutiveFailures += 1;

    state.details = null;

    return false;
  }
}

// Administra el rol del nodo para soportar failover y promocion del respaldo.
// Ejecuta el failover automatico: pide al respaldo que se promueva y cambia el nodo activo del Gateway.
async function promoteBackupAutomatically() {
  if (failoverInProgress) {
    return;
  }

  failoverInProgress = true;

  try {
    console.log("[PARKSAFE GATEWAY] Promoviendo respaldo...");

    const response = await axios.post(
      `${config.services.backup}/promote`,
      {},
      {
        timeout: config.requestTimeoutMs,
      },
    );

    if (response.data && response.data.role === "PRIMARY") {
      activateBackup();

      console.log("[PARKSAFE GATEWAY] FAILOVER COMPLETADO");
    } else {
      console.error("[PARKSAFE GATEWAY] El respaldo no confirmó rol PRIMARY");
    }
  } catch (error) {
    console.error("[PARKSAFE GATEWAY] Falló la promoción:", error.message);
  } finally {
    failoverInProgress = false;
  }
}

/*
 * Recupera el nodo físico 3003 después
 * de que ocurrió un failover.
 *
 * El nodo BACKUP/3004 conserva el rol
 * PRIMARY.
 *
 * 3003 se incorpora nuevamente como
 * STANDBY y recibe una copia actualizada
 * del estado de 3004.
 */
// Cuando el primario original vuelve, intenta degradarlo a STANDBY para evitar dos primarios activos.
async function recoverPrimaryAsStandby() {
  if (recoveryInProgress) {
    return;
  }

  recoveryInProgress = true;

  try {
    console.log(
      "[PARKSAFE GATEWAY] Nodo 3003 recuperado. Iniciando reintegración...",
    );

    /*
     * PRIMERO quitamos el rol PRIMARY
     * a 3003.
     *
     * Esto evita tener dos nodos PRIMARY
     * durante la sincronización.
     */
    const demoteResponse = await axios.post(
      `${config.services.primary}/demote`,
      {},
      {
        timeout: config.requestTimeoutMs,
      },
    );

    if (!demoteResponse.data || demoteResponse.data.role !== "STANDBY") {
      throw new Error("El nodo 3003 no confirmó el rol STANDBY");
    }

    console.log("[PARKSAFE GATEWAY] 3003 cambiado automáticamente a STANDBY");

    /*
     * Obtenemos el snapshot desde el
     * nodo que actualmente es líder:
     * BACKUP/3004.
     */
    const snapshotResponse = await axios.get(
      `${config.services.backup}/snapshot`,
      {
        timeout: config.requestTimeoutMs,
      },
    );

    if (!snapshotResponse.data || !snapshotResponse.data.data) {
      throw new Error("El nodo 3004 no entregó un snapshot válido");
    }

    console.log("[PARKSAFE GATEWAY] Snapshot obtenido desde 3004");

    /*
     * Sincronizamos 3003 utilizando
     * como fuente el snapshot de 3004.
     */
    const syncResponse = await axios.post(
      `${config.services.primary}/sync`,
      snapshotResponse.data.data,
      {
        timeout: config.requestTimeoutMs,

        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Evalua si la respuesta remota fue exitosa antes de confiar en sus datos.
    if (!syncResponse.data || syncResponse.data.success !== true) {
      throw new Error("3003 no confirmó la sincronización");
    }

    console.log(
      "[PARKSAFE GATEWAY] 3003 sincronizado correctamente desde 3004",
    );

    console.log(
      "[PARKSAFE GATEWAY] RECUPERACIÓN COMPLETADA: 3003 = STANDBY, 3004 = PRIMARY",
    );
  } catch (error) {
    console.error(
      "[PARKSAFE GATEWAY] Error durante recuperación de 3003:",
      error.message,
    );
  } finally {
    recoveryInProgress = false;
  }
}

// Monitorea nodos y decide a cual enviar trafico cuando ocurre una falla.
// Ciclo principal de monitoreo: revisa primario/respaldo, acumula fallos y dispara failover si corresponde.
async function executeHeartbeat() {
  if (checkInProgress) {
    return;
  }

  checkInProgress = true;

  try {
    const [primaryAvailable, backupAvailable] = await Promise.all([
      checkNode("primary", config.services.primary),

      checkNode("backup", config.services.backup),
    ]);

    /*
     * CASO 1
     *
     * El nodo activo sigue siendo
     * PRIMARY/3003 y deja de responder.
     */
    if (getActiveNode() === "PRIMARY" && !primaryAvailable) {
      const failures = heartbeatState.primary.consecutiveFailures;

      console.warn(
        `[PARKSAFE GATEWAY] Fallo primario: ` +
          `${failures}/` +
          `${config.heartbeat.failureLimit}`,
      );

      if (failures >= config.heartbeat.failureLimit) {
        if (!backupAvailable) {
          console.error(
            "[PARKSAFE GATEWAY] No se puede hacer failover: respaldo inactivo",
          );

          return;
        }

        await promoteBackupAutomatically();

        return;
      }
    }

    /*
     * CASO 2
     *
     * Ya ocurrió failover.
     *
     * 3004 es el nodo activo y 3003
     * vuelve a estar disponible.
     */
    if (getActiveNode() === "BACKUP" && backupAvailable && primaryAvailable) {
      const backupRole = heartbeatState.backup.details?.role;

      const primaryRole = heartbeatState.primary.details?.role;

      /*
       * 3004 debe seguir siendo PRIMARY.
       */
      if (backupRole !== "PRIMARY") {
        console.error(
          "[PARKSAFE GATEWAY] El nodo activo BACKUP no declara rol PRIMARY",
        );

        return;
      }

      /*
       * Si 3003 vuelve declarando PRIMARY,
       * tenemos riesgo de split-brain.
       *
       * Lo reintegramos automáticamente.
       */
      if (primaryRole === "PRIMARY") {
        console.warn(
          "[PARKSAFE GATEWAY] 3003 regresó como PRIMARY. Corrigiendo posible split-brain...",
        );

        await recoverPrimaryAsStandby();

        return;
      }

      /*
       * Si ya está STANDBY, significa
       * que la recuperación está correcta.
       */
      if (primaryRole === "STANDBY") {
        return;
      }
    }
  } finally {
    checkInProgress = false;
  }
}

// Monitorea nodos y decide a cual enviar trafico cuando ocurre una falla.
// Inicia el intervalo periodico de heartbeat que mantiene viva la deteccion de fallas.
function startHeartbeat() {
  if (heartbeatTimer) {
    return;
  }

  heartbeatState.running = true;

  console.log(
    `[PARKSAFE GATEWAY] Heartbeat cada ` + `${config.heartbeat.intervalMs} ms`,
  );

  executeHeartbeat();

  heartbeatTimer = setInterval(executeHeartbeat, config.heartbeat.intervalMs);
}

// Monitorea nodos y decide a cual enviar trafico cuando ocurre una falla.
// Detiene el intervalo de heartbeat para cerrar ordenadamente el proceso.
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);

    heartbeatTimer = null;
  }

  heartbeatState.running = false;
}

// Monitorea nodos y decide a cual enviar trafico cuando ocurre una falla.
// Devuelve una fotografia del estado del heartbeat para el endpoint /api/system/status.
function getHeartbeatState() {
  return {
    running: heartbeatState.running,

    primary: {
      ...heartbeatState.primary,
    },

    backup: {
      ...heartbeatState.backup,
    },
  };
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  startHeartbeat,
  stopHeartbeat,
  getHeartbeatState,
};

/*
 * Gateway/API Gateway: punto de entrada unico que enruta peticiones, aplica seguridad basica y oculta al cliente si atiende el primario o el respaldo.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 */

const axios = require("axios");

const config = require("../config");

let activeNode = "PRIMARY";

let failoverExecutedAt = null;

// Monitorea nodos y decide a cual enviar trafico cuando ocurre una falla.
// Devuelve el rol logico que actualmente recibe trafico de estacionamiento desde el Gateway.
function getActiveNode() {
  return activeNode;
}

// Monitorea nodos y decide a cual enviar trafico cuando ocurre una falla.
// Traduce el rol activo en una URL fisica concreta para reenviar peticiones.
function getActiveNodeUrl() {
  if (activeNode === "BACKUP") {
    return config.services.backup;
  }

  return config.services.primary;
}

// Monitorea nodos y decide a cual enviar trafico cuando ocurre una falla.
// Actualiza el nodo activo del Gateway despues de deteccion inicial, failover o recuperacion.
function setActiveNode(node) {
  if (node !== "PRIMARY" && node !== "BACKUP") {
    throw new Error(`Nodo activo inválido: ${node}`);
  }

  activeNode = node;

  console.log(`[PARKSAFE GATEWAY] Nodo activo configurado como ${activeNode}`);
}
// Marca al respaldo como destino activo cuando el primario deja de responder.
function activateBackup() {
  activeNode = "BACKUP";

  /*
   * Registramos cuándo ocurrió
   * el failover.
   */
  failoverExecutedAt = new Date().toISOString();

  console.log("[PARKSAFE GATEWAY] Nodo activo cambiado a BACKUP");
}
// Restaura el primario como destino activo cuando corresponde volver al flujo normal.
function activatePrimary() {
  activeNode = "PRIMARY";

  console.log("[PARKSAFE GATEWAY] Nodo activo cambiado a PRIMARY");
}

// Expone salud del proceso para que el Gateway o Docker puedan monitorearlo.
// Consulta la salud de un nodo especifico usando HTTP y devuelve estado, rol y timestamp.
async function getNodeHealth(name, url) {
  try {
    const response = await axios.get(`${url}/health`, {
      timeout: config.heartbeat.timeoutMs,
    });

    return {
      name,

      available: true,

      role: response.data.role,

      data: response.data,
    };
  } catch (error) {
    return {
      name,

      available: false,

      role: null,

      data: null,
    };
  }
}

// Monitorea nodos y decide a cual enviar trafico cuando ocurre una falla.
// Al iniciar el Gateway, pregunta a ambos nodos quien es PRIMARY para no asumir un lider incorrecto.
async function detectActiveNode() {
  console.log("[PARKSAFE GATEWAY] Detectando líder actual...");

  const [primaryNode, backupNode] = await Promise.all([
    getNodeHealth("PRIMARY", config.services.primary),

    getNodeHealth("BACKUP", config.services.backup),
  ]);

  /*
   * CASO NORMAL
   *
   * 3003 es PRIMARY
   * y 3004 no lo es.
   */
  if (
    primaryNode.available &&
    primaryNode.role === "PRIMARY" &&
    (!backupNode.available || backupNode.role !== "PRIMARY")
  ) {
    setActiveNode("PRIMARY");

    console.log("[PARKSAFE GATEWAY] Líder detectado: nodo 3003");

    return {
      detected: true,

      activeNode: "PRIMARY",
    };
  }

  /*
   * CASO POST-FAILOVER
   *
   * 3004 es PRIMARY
   * y 3003 está STANDBY
   * o no está disponible.
   */
  if (
    backupNode.available &&
    backupNode.role === "PRIMARY" &&
    (!primaryNode.available || primaryNode.role !== "PRIMARY")
  ) {
    setActiveNode("BACKUP");

    console.log("[PARKSAFE GATEWAY] Líder detectado: nodo 3004");

    return {
      detected: true,

      activeNode: "BACKUP",
    };
  }

  /*
   * Ningún nodo disponible.
   */
  if (!primaryNode.available && !backupNode.available) {
    console.error("[PARKSAFE GATEWAY] Ningún nodo de negocio está disponible");

    return {
      detected: false,

      activeNode: null,

      reason: "NO_NODES_AVAILABLE",
    };
  }

  /*
   * Solo 3003 disponible.
   */
  if (primaryNode.available && !backupNode.available) {
    if (primaryNode.role === "PRIMARY") {
      setActiveNode("PRIMARY");

      return {
        detected: true,

        activeNode: "PRIMARY",
      };
    }

    console.warn(
      "[PARKSAFE GATEWAY] 3003 está disponible pero no posee rol PRIMARY",
    );

    return {
      detected: false,

      activeNode: null,

      reason: "NO_PRIMARY_ROLE",
    };
  }

  /*
   * Solo 3004 disponible.
   */
  if (backupNode.available && !primaryNode.available) {
    if (backupNode.role === "PRIMARY") {
      setActiveNode("BACKUP");

      return {
        detected: true,

        activeNode: "BACKUP",
      };
    }

    console.warn(
      "[PARKSAFE GATEWAY] 3004 está disponible pero no posee rol PRIMARY",
    );

    return {
      detected: false,

      activeNode: null,

      reason: "NO_PRIMARY_ROLE",
    };
  }

  /*
   * Ambos declaran PRIMARY.
   *
   * Esto es split-brain.
   *
   * No elegimos uno arbitrariamente
   * durante el arranque del Gateway.
   */
  if (primaryNode.role === "PRIMARY" && backupNode.role === "PRIMARY") {
    console.error(
      "[PARKSAFE GATEWAY] ALERTA: ambos nodos declaran rol PRIMARY",
    );

    return {
      detected: false,

      activeNode: null,

      reason: "SPLIT_BRAIN",
    };
  }

  console.error("[PARKSAFE GATEWAY] No existe un nodo con rol PRIMARY");

  return {
    detected: false,

    activeNode: null,

    reason: "NO_PRIMARY_ROLE",
  };
}

// Monitorea nodos y decide a cual enviar trafico cuando ocurre una falla.
// Expone el estado interno del administrador de nodos para diagnostico del sistema.
function getNodeManagerState() {
  return {
    activeNode,

    activeNodeUrl: getActiveNodeUrl(),

    /*
     * Después de que haya ocurrido
     * un failover conservamos esa
     * información para la UI.
     */
    failoverExecuted: failoverExecutedAt !== null || activeNode === "BACKUP",

    failoverExecutedAt,
  };
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  getActiveNode,
  getActiveNodeUrl,

  setActiveNode,

  activateBackup,
  activatePrimary,

  detectActiveNode,

  getNodeManagerState,
};

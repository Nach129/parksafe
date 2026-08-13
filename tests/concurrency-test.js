/*
 * Prueba de concurrencia: dispara varias solicitudes simultaneas para verificar que las transacciones evitan sobreventa de cupos.
 * Este archivo apoya el Escenario B de la pauta de suficiencia.
 * Estos comentarios son explicativos y no modifican la ejecucion del test.
 */

const axios = require("axios");

const GATEWAY_URL = "http://localhost:8080";

const TOKEN = process.env.PARKSAFE_TOKEN;

/*
 * Deben ser vehículos existentes
 * pertenecientes al mismo usuario
 * autenticado.
 */
const VEHICLE_IDS = [21, 22, 23, 24, 25];

/*
 * Estacionamiento de concurrencia.
 *
 * Debe tener exactamente
 * un espacio disponible.
 */
const PARKING_ID = 4;

// Si no viene token JWT, la ruta protegida no puede identificar al usuario.
if (!TOKEN) {
  console.error("Falta la variable PARKSAFE_TOKEN");

  console.error("Ejemplo PowerShell:");

  console.error('$env:PARKSAFE_TOKEN = "TU_TOKEN"');

  process.exit(1);
}

// Funcion principal o auxiliar del test de concurrencia.
// Construye y envia una solicitud de reserva para simular un cliente concurrente.
async function makeReservation(vehicleId) {
  const startedAt = Date.now();

  try {
    const response = await axios.post(
      `${GATEWAY_URL}/api/parking/reservations`,
      {
        vehiculoId: vehicleId,

        estacionamientoId: PARKING_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,

          "Content-Type": "application/json",
        },
      },
    );

    return {
      vehicleId,

      success: true,

      status: response.status,

      space: response.data?.data?.space?.code,

      node: response.data?.routedByGatewayTo,

      message: response.data?.message,

      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      vehicleId,

      success: false,

      status: error.response?.status || "ERROR",

      space: null,

      node: null,

      message: error.response?.data?.message || error.message,

      durationMs: Date.now() - startedAt,
    };
  }
}

// Prepara varias solicitudes simultaneas y muestra si solo una consigue el ultimo cupo.
async function run() {
  console.log("========================================");

  console.log(" PARKSAFE - PRUEBA DE CONCURRENCIA");

  console.log("========================================");

  console.log();

  console.log(`Estacionamiento: ${PARKING_ID}`);

  console.log(`Solicitudes simultáneas: ${VEHICLE_IDS.length}`);

  console.log();

  /*
   * Promise.all dispara todas las
   * solicitudes prácticamente al
   * mismo tiempo.
   */
  const results = await Promise.all(
    VEHICLE_IDS.map((vehicleId) => makeReservation(vehicleId)),
  );

  console.table(results);

  const successful = results.filter((result) => result.success);

  const failed = results.filter((result) => !result.success);

  console.log();

  console.log("Resultados:");

  console.log(`Exitosas: ${successful.length}`);

  console.log(`Fallidas: ${failed.length}`);

  console.log();

  if (successful.length === 1) {
    console.log(" PRUEBA SUPERADA");

    console.log("Solo una solicitud obtuvo el único espacio disponible.");
  } else {
    console.log("PRUEBA FALLIDA");

    console.log(
      `Se esperaban 1 reserva exitosa y se obtuvieron ${successful.length}.`,
    );

    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("Error ejecutando prueba:", error);

  process.exit(1);
});

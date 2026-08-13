/*
 * Nodo respaldo: mantiene una copia sincronizada, recibe replicacion pasiva y puede ser promovido cuando falla el primario.
 * Arranque del microservicio: configura Express, middlewares, rutas y puerto de escucha.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const config = require("./config");

const { testDatabaseConnection } = require("./database");

const healthRoutes = require("./routes/health.routes");

const parkingRoutes = require("./routes/parking.routes");

const parkingReservationsRoutes = require("./routes/parking-reservations.routes");

const promotionRoutes = require("./routes/promotion.routes");

const syncRoutes = require("./routes/sync.routes");

const replicationRoutes = require("./routes/replication.routes");

const snapshotRoutes = require("./routes/snapshot.routes");

const { errorHandler } = require("./middleware/error.middleware");

const { getCurrentRole } = require("./controllers/promotion.controller");

const {
  startReplicationRetry,
  stopReplicationRetry,
} = require("./services/replication-retry.service");

const app = express();

const port = config.port || 3004;

/*
 * CORS
 *
 * Angular utilizará el Gateway,
 * pero mantenemos CORS para pruebas locales.
 */
// USE: Ruta Express del sistema ParkSafe.
app.use(
  cors({
    origin: "http://localhost:4200",
  }),
);
// USE: Ruta Express del sistema ParkSafe.
app.use(
  express.json({
    limit: "5mb",
  }),
);
// USE: Ruta Express del sistema ParkSafe.
app.use(morgan("dev"));

/*
 * =========================
 * RUTAS PARKSAFE BACKUP
 * =========================
 */
// USE: Ruta Express del sistema ParkSafe.
app.use(healthRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use(parkingRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use(parkingReservationsRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use(promotionRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use(syncRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use(replicationRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use(snapshotRoutes);

/*
 * Ruta no encontrada.
 *
 * Debe estar después de todas
 * las rutas válidas.
 */
// USE: Ruta Express del sistema ParkSafe.
app.use((req, res) => {
  // 404 Not Found: informa que el recurso solicitado no existe en la base local.
  return res.status(404).json({
    success: false,

    message: "Ruta no encontrada en el nodo respaldo",
  });
});

/*
 * Middleware global de errores.
 *
 * Siempre debe ir al final.
 */
// USE: Ruta Express del sistema ParkSafe.
app.use(errorHandler);
// Inicializa Express, prueba dependencias criticas y deja el microservicio escuchando en su puerto.
async function startServer() {
  try {
    await testDatabaseConnection();

    const server = app.listen(port, () => {
      console.log(`[BACKUP] Nodo ejecutándose en http://localhost:${port}`);

      console.log(`[BACKUP] Rol inicial: ${getCurrentRole()}`);

      /*
       * Revisa periódicamente las operaciones
       * de replicación que quedaron PENDIENTE.
       *
       * Solo hará trabajo cuando el nodo
       * tenga role = PRIMARY.
       */
      startReplicationRetry();
    });

    /*
     * Cierre ordenado del servicio.
     */
    // shutdown: funcion especifica del modulo; revisa parametros y resultado para explicar su responsabilidad exacta.
    function shutdown(signal) {
      console.log(`[BACKUP] Señal ${signal} recibida. Cerrando nodo...`);

      stopReplicationRetry();

      server.close(() => {
        console.log("[BACKUP] Servidor detenido correctamente");

        process.exit(0);
      });
    }

    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("[BACKUP] No fue posible iniciar el nodo:", error.message);

    process.exit(1);
  }
}

startServer();

/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Arranque del microservicio: configura Express, middlewares, rutas y puerto de escucha.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const config = require("./config");

const { testDatabaseConnection } = require("./database");

const healthRoutes = require("./routes/health.routes");

const parkingRoutes = require("./routes/parking.routes");

const parkingReservationsRoutes = require("./routes/parking-reservations.routes");

const snapshotRoutes = require("./routes/snapshot.routes");

const syncRoutes = require("./routes/sync.routes");

const roleRoutes = require("./routes/role.routes");

const replicationRoutes = require("./routes/replication.routes");

const { errorHandler } = require("./middleware/error.middleware");

const app = express();
// USE: Ruta Express del sistema ParkSafe.
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:4200",
  }),
);
// USE: Ruta Express del sistema ParkSafe.
app.use(express.json());
app.use(morgan("dev"));
app.use(healthRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use(parkingRoutes);
app.use(parkingReservationsRoutes);
app.use(syncRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use(snapshotRoutes);
app.use(roleRoutes);
app.use(replicationRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use((req, res) => {
  // 404 Not Found: informa que el recurso solicitado no existe en la base local.
  return res.status(404).json({
    success: false,
    message: "Ruta no encontrada en el nodo primario",
  });
});
// USE: Ruta Express del sistema ParkSafe.
app.use(errorHandler);
// Inicializa Express, prueba dependencias criticas y deja el microservicio escuchando en su puerto.
async function startServer() {
  try {
    await testDatabaseConnection();

    app.listen(config.port, () => {
      console.log(
        `[PRIMARY] Nodo ejecutándose en http://localhost:${config.port}`,
      );
    });
  } catch (error) {
    console.error("[PRIMARY] No fue posible iniciar el nodo:", error.message);

    process.exit(1);
  }
}

startServer();

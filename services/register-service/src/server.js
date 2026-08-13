/*
 * Microservicio de registro: administra usuarios/vehiculos y valida duplicados antes de guardar datos.
 * Arranque del microservicio: configura Express, middlewares, rutas y puerto de escucha.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { testDatabaseConnection } = require("./database");

const registerRoutes = require("./routes/register.routes");
const { errorHandler } = require("./middleware/error.middleware");

const vehicleRoutes = require("./routes/vehicle.routes");

const app = express();
const port = Number(process.env.PORT || 3001);
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
// GET: Ruta Express del sistema ParkSafe.
app.get("/health", (req, res) => {
  // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
  return res.status(200).json({
    status: "ok",
    service: "register-service",
    timestamp: new Date().toISOString(),
  });
});
// USE: Ruta Express del sistema ParkSafe.
app.use(registerRoutes);
app.use(vehicleRoutes);
app.use((req, res) => {
  // 404 Not Found: informa que el recurso solicitado no existe en la base local.
  return res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});
// USE: Ruta Express del sistema ParkSafe.
app.use(errorHandler);
// Inicializa Express, prueba dependencias criticas y deja el microservicio escuchando en su puerto.
async function startServer() {
  try {
    await testDatabaseConnection();

    app.listen(port, () => {
      console.log(
        `[REGISTRO] Servicio ejecutándose en http://localhost:${port}`,
      );
    });
  } catch (error) {
    console.error(
      "[REGISTRO] No fue posible iniciar el servicio:",
      error.message,
    );

    process.exit(1);
  }
}

startServer();

/*
 * Gateway/API Gateway: punto de entrada unico que enruta peticiones, aplica seguridad basica y oculta al cliente si atiende el primario o el respaldo.
 * Arranque del microservicio: configura Express, middlewares, rutas y puerto de escucha.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const config = require("./config");

const authRoutes = require("./routes/auth.routes");

const vehiclesRoutes = require("./routes/vehicles.routes");

const parkingRoutes = require("./routes/parking.routes");

const systemRoutes = require("./routes/system.routes");

const {
  startHeartbeat,
  stopHeartbeat,
} = require("./services/heartbeat.service");

const { detectActiveNode } = require("./services/node-manager.service");

const { errorHandler } = require("./middleware/error.middleware");

const app = express();

/*
 * =========================
 * MIDDLEWARES GENERALES
 * =========================
 */
// USE: Ruta Express del sistema ParkSafe.
app.use(helmet());
// USE: Ruta Express del sistema ParkSafe.
app.use(
  cors({
    origin: "http://localhost:4200",

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
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
 * HEALTH DEL GATEWAY
 * =========================
 */
// GET: Ruta Express del sistema ParkSafe.
app.get("/health", (req, res) => {
  // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
  return res.status(200).json({
    status: "ok",

    service: "parksafe-api-gateway",

    timestamp: new Date().toISOString(),
  });
});

/*
 * =========================
 * RUTAS PARKSAFE
 * =========================
 */
// USE: Ruta Express del sistema ParkSafe.
app.use("/api/auth", authRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use("/api/vehicles", vehiclesRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use("/api/parking", parkingRoutes);
// USE: Ruta Express del sistema ParkSafe.
app.use("/api/system", systemRoutes);

/*
 * =========================
 * RUTA NO ENCONTRADA
 * =========================
 *
 * Siempre debe ir después
 * de todas las rutas válidas.
 */
// USE: Ruta Express del sistema ParkSafe.
app.use((req, res) => {
  // 404 Not Found: informa que el recurso solicitado no existe en la base local.
  return res.status(404).json({
    success: false,

    message: "Ruta no encontrada en ParkSafe API Gateway",
  });
});

/*
 * =========================
 * MANEJO GLOBAL DE ERRORES
 * =========================
 *
 * Siempre debe ser el último middleware.
 */
// USE: Ruta Express del sistema ParkSafe.
app.use(errorHandler);

/*
 * =========================
 * INICIO DEL GATEWAY
 * =========================
 */
// Inicializa Express, prueba dependencias criticas y deja el microservicio escuchando en su puerto.
async function startServer() {
  try {
    console.log("[PARKSAFE GATEWAY] Iniciando ParkSafe Gateway...");

    /*
     * Antes de aceptar tráfico,
     * consultamos ambos nodos para saber
     * cuál posee actualmente el rol PRIMARY.
     */
    const detection = await detectActiveNode();

    if (!detection.detected) {
      console.warn(
        `[PARKSAFE GATEWAY] No fue posible determinar un líder al iniciar. ` +
          `Motivo: ${detection.reason}`,
      );
    }

    const server = app.listen(config.port, () => {
      console.log(
        `[PARKSAFE GATEWAY] Ejecutándose en http://localhost:${config.port}`,
      );

      console.log(
        `[PARKSAFE GATEWAY] Primario físico: ${config.services.primary}`,
      );

      console.log(
        `[PARKSAFE GATEWAY] Respaldo físico: ${config.services.backup}`,
      );

      console.log(
        `[PARKSAFE GATEWAY] Nodo activo detectado: ` +
          `${detection.activeNode || "NINGUNO"}`,
      );

      /*
       * Una vez determinado el líder,
       * iniciamos el heartbeat periódico.
       */
      startHeartbeat();
    });

    /*
     * =========================
     * CIERRE ORDENADO
     * =========================
     */

    let shuttingDown = false;
    // shutdown: funcion especifica del modulo; revisa parametros y resultado para explicar su responsabilidad exacta.
    function shutdown(signal) {
      if (shuttingDown) {
        return;
      }

      shuttingDown = true;

      console.log(`[PARKSAFE GATEWAY] ${signal} recibido`);

      stopHeartbeat();

      server.close(() => {
        console.log("[PARKSAFE GATEWAY] Servidor detenido correctamente");

        process.exit(0);
      });

      /*
       * Protección por si alguna conexión
       * impide cerrar el servidor normalmente.
       */
      setTimeout(() => {
        console.error("[PARKSAFE GATEWAY] Cierre forzado por timeout");

        process.exit(1);
      }, 5000).unref();
    }

    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("[PARKSAFE GATEWAY] No fue posible iniciar:", error.message);

    process.exit(1);
  }
}

startServer();

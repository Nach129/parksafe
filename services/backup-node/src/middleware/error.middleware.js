/*
 * Nodo respaldo: mantiene una copia sincronizada, recibe replicacion pasiva y puede ser promovido cuando falla el primario.
 * Middleware Express: intercepta la peticion antes o despues de las rutas para validar, autenticar o manejar errores.
 */

// Normaliza errores para que el cliente reciba respuestas JSON consistentes.
// Centraliza los errores de Express y transforma excepciones en respuestas JSON consistentes para el cliente.
function errorHandler(error, req, res, next) {
  console.error("[BACKUP] Error:", error.message);

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Clasifica errores conocidos de base de datos para devolver mensajes mas entendibles.
  if (error.code === "ER_DUP_ENTRY") {
    // 409 Conflict: evita duplicados o sobreasignacion cuando el estado ya no permite la operacion.
    return res.status(409).json({
      success: false,
      message: "La reserva o la operación ya existe",
    });
  }

  // Clasifica errores conocidos de base de datos para devolver mensajes mas entendibles.
  if (
    error.code === "ER_LOCK_DEADLOCK" ||
    error.code === "ER_LOCK_WAIT_TIMEOUT"
  ) {
    // 503 Service Unavailable: nodo/servicio no puede atender, normalmente por standby o caida.
    return res.status(503).json({
      success: false,
      message:
        "La reserva no pudo procesarse por alta concurrencia. Intente nuevamente",
    });
  }

  // 500 Internal Server Error: error no controlado convertido a JSON por seguridad.
  return res.status(500).json({
    success: false,
    message: "Error interno del nodo respaldo",
  });
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  errorHandler,
};

/*
 * Microservicio de registro: administra usuarios/vehiculos y valida duplicados antes de guardar datos.
 * Middleware Express: intercepta la peticion antes o despues de las rutas para validar, autenticar o manejar errores.
 */

// Normaliza errores para que el cliente reciba respuestas JSON consistentes.
// Centraliza los errores de Express y transforma excepciones en respuestas JSON consistentes para el cliente.
function errorHandler(error, req, res, next) {
  console.error("[REGISTRO] Error:", error);

  // Clasifica errores conocidos de base de datos para devolver mensajes mas entendibles.
  if (error.code === "ER_DUP_ENTRY") {
    // 409 Conflict: evita duplicados o sobreasignacion cuando el estado ya no permite la operacion.
    return res.status(409).json({
      success: false,
      message: "El correo o nombre de usuario ya se encuentra registrado",
    });
  }

  // 500 Internal Server Error: error no controlado convertido a JSON por seguridad.
  return res.status(500).json({
    success: false,
    message: "Error interno del servicio de registro",
  });
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  errorHandler,
};

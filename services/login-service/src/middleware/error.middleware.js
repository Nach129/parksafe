/*
 * Microservicio de login: valida credenciales y emite la identidad que el resto del sistema usa para operar.
 * Middleware Express: intercepta la peticion antes o despues de las rutas para validar, autenticar o manejar errores.
 */

// Normaliza errores para que el cliente reciba respuestas JSON consistentes.
// Centraliza los errores de Express y transforma excepciones en respuestas JSON consistentes para el cliente.
function errorHandler(error, req, res, next) {
  console.error("[LOGIN] Error:", error);

  // 500 Internal Server Error: error no controlado convertido a JSON por seguridad.
  return res.status(500).json({
    success: false,
    message: "Error interno del servicio de login",
  });
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  errorHandler,
};

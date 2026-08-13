/*
 * Gateway/API Gateway: punto de entrada unico que enruta peticiones, aplica seguridad basica y oculta al cliente si atiende el primario o el respaldo.
 * Middleware Express: intercepta la peticion antes o despues de las rutas para validar, autenticar o manejar errores.
 */

const jwt = require("jsonwebtoken");

const config = require("../config");

// Valida el JWT recibido en Authorization, decodifica la identidad del usuario y la deja en req.user para las rutas protegidas.
function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  // Revisa que el header Authorization tenga el formato Bearer esperado.
  if (!authorization) {
    // 401 Unauthorized: rechaza credenciales/token invalido antes de acceder a recursos protegidos.
    return res.status(401).json({
      success: false,
      message: "Token de autenticación requerido",
    });
  }

  const [type, token] = authorization.split(" ");

  // Si no viene token JWT, la ruta protegida no puede identificar al usuario.
  if (type !== "Bearer" || !token) {
    // 401 Unauthorized: rechaza credenciales/token invalido antes de acceder a recursos protegidos.
    return res.status(401).json({
      success: false,
      message: "Formato de token inválido",
    });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);

    req.user = payload;

    next();
  } catch (error) {
    // 401 Unauthorized: rechaza credenciales/token invalido antes de acceder a recursos protegidos.
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  authenticateToken,
};

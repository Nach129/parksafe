/*
 * Microservicio de login: valida credenciales y emite la identidad que el resto del sistema usa para operar.
 * Controlador HTTP: recibe la solicitud, llama a la capa de servicio/base de datos y devuelve una respuesta JSON.
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { pool } = require("../database");

// Autentica correo/usuario y password, verifica cuenta activa y devuelve un JWT para el frontend.
async function loginUser(req, res, next) {
  let connection;

  try {
    const { identificador, password } = req.body;

    // Verifica que el login traiga usuario/correo y password antes de consultar la base.
    if (!identificador || !password) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message:
          "El correo o nombre de usuario y la contraseña son obligatorios",
      });
    }

    const cleanIdentifier = identificador.trim().toLowerCase();

    connection = await pool.getConnection();

    // SQL de usuarios: busca credenciales o duplicados en la base de autenticacion.
    const [users] = await connection.execute(
      `
        SELECT
          id,
          nombre,
          nombre_usuario,
          correo,
          password_hash,
          rol,
          activo
        FROM usuarios
        WHERE correo = ? OR nombre_usuario = ?
        LIMIT 1
      `,
      [cleanIdentifier, cleanIdentifier],
    );

    // Si no aparece ningun usuario, se responde credenciales incorrectas sin revelar si falla usuario o password.
    if (users.length === 0) {
      // 401 Unauthorized: rechaza credenciales/token invalido antes de acceder a recursos protegidos.
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const user = users[0];

    // Bloquea cuentas desactivadas aunque las credenciales sean correctas.
    if (!user.activo) {
      // 403 Forbidden: el usuario existe pero no tiene permiso o la cuenta esta desactivada.
      return res.status(403).json({
        success: false,
        message: "La cuenta se encuentra desactivada",
      });
    }

    // Compara password recibido contra hash almacenado usando bcrypt.
    const validPassword = await bcrypt.compare(password, user.password_hash);

    // Si bcrypt no coincide, se rechaza el login manteniendo el mismo mensaje generico de seguridad.
    if (!validPassword) {
      // 401 Unauthorized: rechaza credenciales/token invalido antes de acceder a recursos protegidos.
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    // Firma un JWT con los datos minimos del usuario para autenticar llamadas posteriores sin reenviar password.
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.nombre_usuario,
        email: user.correo,
        role: user.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "2h",
      },
    );

    // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
    return res.status(200).json({
      success: true,
      message: "Inicio de sesión correcto",
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          nombreUsuario: user.nombre_usuario,
          correo: user.correo,
          rol: user.rol,
        },
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) {
      // Libera la conexion al pool para que otras peticiones concurrentes puedan reutilizarla.
      connection.release();
    }
  }
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  loginUser,
};

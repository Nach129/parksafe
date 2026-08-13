/*
 * Microservicio de registro: administra usuarios/vehiculos y valida duplicados antes de guardar datos.
 * Controlador HTTP: recibe la solicitud, llama a la capa de servicio/base de datos y devuelve una respuesta JSON.
 */

const bcrypt = require("bcrypt");
const { pool } = require("../database");

// Crea una cuenta nueva, valida campos obligatorios, evita duplicados y guarda password hasheada.
async function registerUser(req, res, next) {
  let connection;

  try {
    const { nombre, nombreUsuario, correo, password } = req.body;

    if (!nombre || !nombreUsuario || !correo || !password) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message:
          "Nombre, nombre de usuario, correo y contraseña son obligatorios",
      });
    }

    const cleanName = nombre.trim();

    const cleanUsername = nombreUsuario.trim().toLowerCase();

    const cleanEmail = correo.trim().toLowerCase();

    if (cleanName.length < 2) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "El nombre debe contener al menos 2 caracteres",
      });
    }

    if (cleanUsername.length < 3) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario debe contener al menos 3 caracteres",
      });
    }

    if (!cleanEmail.includes("@")) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "El correo electrónico no es válido",
      });
    }

    if (password.length < 6) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "La contraseña debe contener al menos 6 caracteres",
      });
    }

    connection = await pool.getConnection();

    // SQL de usuarios: busca credenciales o duplicados en la base de autenticacion.
    const [existingUsers] = await connection.execute(
      `
          SELECT
            id,
            nombre_usuario,
            correo
          FROM usuarios
          WHERE
            nombre_usuario = ?
            OR correo = ?
          LIMIT 1
        `,
      [cleanUsername, cleanEmail],
    );

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];

      if (existing.correo === cleanEmail) {
        // 409 Conflict: evita duplicados o sobreasignacion cuando el estado ya no permite la operacion.
        return res.status(409).json({
          success: false,
          message: "El correo ya se encuentra registrado",
        });
      }

      // 409 Conflict: evita duplicados o sobreasignacion cuando el estado ya no permite la operacion.
      return res.status(409).json({
        success: false,
        message: "El nombre de usuario ya se encuentra registrado",
      });
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS || 10);

    const passwordHash =
      // Hashea la contrasena antes de guardarla; la base nunca recibe el password en texto plano.
      await bcrypt.hash(password, rounds);

    // SQL de usuario: persiste la cuenta con password ya hasheada por bcrypt.
    const [result] = await connection.execute(
      `
          INSERT INTO usuarios (
            nombre,
            nombre_usuario,
            correo,
            password_hash,
            rol
          )
          VALUES (?, ?, ?, ?, 'CLIENTE')
        `,
      [cleanName, cleanUsername, cleanEmail, passwordHash],
    );

    // 201 Created: confirma que se creo un recurso nuevo, como usuario, vehiculo o reserva.
    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      data: {
        id: result.insertId,
        nombre: cleanName,
        nombreUsuario: cleanUsername,
        correo: cleanEmail,
        rol: "CLIENTE",
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
  registerUser,
};

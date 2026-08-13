/*
 * Microservicio de registro: administra usuarios/vehiculos y valida duplicados antes de guardar datos.
 * Controlador HTTP: recibe la solicitud, llama a la capa de servicio/base de datos y devuelve una respuesta JSON.
 */

const { pool } = require("../database");
// Limpia y estandariza la patente para que duplicados con minusculas/espacios no pasen la validacion.
function normalizePlate(plate) {
  return plate
    .trim()
    .toUpperCase()
    .replace(/[\s.-]/g, "");
}

// Registra un vehiculo para un usuario, verificando que la patente no exista previamente.
async function registerVehicle(req, res, next) {
  let connection;

  try {
    const { usuarioId, patente, marca, modelo, color } = req.body;

    const userId = Number(usuarioId);

    // Valida que el usuarioId sea numerico y positivo para no consultar reservas de un usuario inexistente.
    if (!Number.isInteger(userId) || userId <= 0) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "El identificador del usuario es inválido",
      });
    }

    if (!patente) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "La patente es obligatoria",
      });
    }

    const cleanPlate = normalizePlate(patente);

    if (cleanPlate.length < 5 || cleanPlate.length > 10) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "La patente ingresada no es válida",
      });
    }

    connection = await pool.getConnection();

    // SQL de usuarios: busca credenciales o duplicados en la base de autenticacion.
    const [users] = await connection.execute(
      `
          SELECT id
          FROM usuarios
          WHERE id = ?
            AND activo = TRUE
          LIMIT 1
        `,
      [userId],
    );

    // Si no aparece ningun usuario, se responde credenciales incorrectas sin revelar si falla usuario o password.
    if (users.length === 0) {
      // 404 Not Found: informa que el recurso solicitado no existe en la base local.
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // SQL de vehiculos: consulta o valida patentes registradas para un usuario.
    const [existingVehicles] = await connection.execute(
      `
          SELECT id
          FROM vehiculos
          WHERE patente = ?
          LIMIT 1
        `,
      [cleanPlate],
    );

    if (existingVehicles.length > 0) {
      // 409 Conflict: evita duplicados o sobreasignacion cuando el estado ya no permite la operacion.
      return res.status(409).json({
        success: false,
        message: "La patente ya se encuentra registrada",
      });
    }

    // SQL de vehiculo: asocia una patente normalizada al usuario propietario.
    const [result] = await connection.execute(
      `
          INSERT INTO vehiculos (
            usuario_id,
            patente,
            marca,
            modelo,
            color
          )
          VALUES (?, ?, ?, ?, ?)
        `,
      [
        userId,
        cleanPlate,
        marca ? marca.trim() : null,
        modelo ? modelo.trim() : null,
        color ? color.trim() : null,
      ],
    );

    // 201 Created: confirma que se creo un recurso nuevo, como usuario, vehiculo o reserva.
    return res.status(201).json({
      success: true,
      message: "Vehículo registrado correctamente",
      data: {
        id: result.insertId,
        usuarioId: userId,
        patente: cleanPlate,
        marca: marca || null,
        modelo: modelo || null,
        color: color || null,
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

// Lista los vehiculos asociados a un usuario para que pueda reservar con uno de ellos.
async function getVehiclesByUser(req, res, next) {
  try {
    const userId = Number(req.params.usuarioId);

    // Valida que el usuarioId sea numerico y positivo para no consultar reservas de un usuario inexistente.
    if (!Number.isInteger(userId) || userId <= 0) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "Identificador de usuario inválido",
      });
    }

    // SQL de vehiculos: consulta o valida patentes registradas para un usuario.
    const [vehicles] = await pool.execute(
      `
          SELECT
            id,
            usuario_id,
            patente,
            marca,
            modelo,
            color,
            activo,
            fecha_registro
          FROM vehiculos
          WHERE usuario_id = ?
          ORDER BY fecha_registro DESC
        `,
      [userId],
    );

    // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
    return res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  registerVehicle,
  getVehiclesByUser,
};

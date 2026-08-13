/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Controlador HTTP: recibe la solicitud, llama a la capa de servicio/base de datos y devuelve una respuesta JSON.
 */

const { pool } = require("../database");

// Sincroniza estado completo o parcial para recuperar consistencia entre nodos.
// Construye una instantanea completa de tablas relevantes para sincronizar primario y respaldo.
async function getSnapshot(req, res, next) {
  try {
    // SQL parametrizado: usa placeholders (?) para separar datos del usuario de la sentencia ejecutada.
    const [parkings] = await pool.execute(`
      SELECT
        id,
        nombre,
        ubicacion,
        capacidad_total,
        estado,
        fecha_creacion
      FROM estacionamientos
      ORDER BY id ASC
    `);

    // SQL de espacios: lee disponibilidad/estado fisico que luego se muestra o valida.
    const [spaces] = await pool.execute(`
      SELECT
        id,
        estacionamiento_id,
        codigo,
        estado,
        vehiculo_id,
        fecha_actualizacion
      FROM espacios
      ORDER BY id ASC
    `);

    // SQL de reservas: lee movimientos para construir historial mostrado al usuario.
    const [movements] = await pool.execute(`
      SELECT
        id,
        codigo,
        usuario_id,
        vehiculo_id,
        espacio_id,
        tipo,
        estado,
        nodo_procesador,
        operation_id,
        fecha_movimiento
      FROM movimientos_estacionamiento
      ORDER BY id ASC
    `);

    // SQL de replicacion: recupera operaciones por id/estado para aplicar idempotencia o reintentos.
    const [operations] = await pool.execute(`
      SELECT
        operation_id,
        tipo,
        contenido,
        estado,
        fecha_creacion
      FROM operaciones_replicacion
      ORDER BY id ASC
    `);

    // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
    return res.status(200).json({
      success: true,

      node: "PRIMARY",

      generatedAt: new Date().toISOString(),

      data: {
        parkings,
        spaces,
        movements,
        operations,
      },
    });
  } catch (error) {
    next(error);
  }
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  getSnapshot,
};

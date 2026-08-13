/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Controlador HTTP: recibe la solicitud, llama a la capa de servicio/base de datos y devuelve una respuesta JSON.
 */

const {
  createParkingReservation,
  getParkingReservationsByUser,
} = require("../services/parking-reservation.service");
// Controlador REST que valida ids recibidos y delega la reserva al servicio transaccional.
async function createParkingReservationController(req, res, next) {
  try {
    const { usuarioId, vehiculoId, estacionamientoId } = req.body;

    const userId = Number(usuarioId);

    const vehicleId = Number(vehiculoId);

    const parkingId = Number(estacionamientoId);

    // Valida que el usuarioId sea numerico y positivo para no consultar reservas de un usuario inexistente.
    if (!Number.isInteger(userId) || userId <= 0) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "Identificador de usuario inválido",
      });
    }

    // Valida que el vehiculo seleccionado exista como id numerico antes de reservar.
    if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "Identificador de vehículo inválido",
      });
    }

    // Valida que el estacionamiento seleccionado sea un id numerico valido.
    if (!Number.isInteger(parkingId) || parkingId <= 0) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "Identificador de estacionamiento inválido",
      });
    }

    const result = await createParkingReservation({
      userId,
      vehicleId,
      parkingId,
    });

    // 201 Created: confirma que se creo un recurso nuevo, como usuario, vehiculo o reserva.
    return res.status(201).json({
      success: true,

      message: "Espacio de estacionamiento reservado correctamente",

      data: result.reservation,

      replication: result.replication,

      node: "PRIMARY",
    });
  } catch (error) {
    next(error);
  }
}
// Controlador REST que lista las reservas del usuario autenticado o consultado.
async function getParkingReservationsController(req, res, next) {
  try {
    const userId = Number(req.query.usuarioId);

    // Valida que el usuarioId sea numerico y positivo para no consultar reservas de un usuario inexistente.
    if (!Number.isInteger(userId) || userId <= 0) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "Identificador de usuario inválido",
      });
    }

    const reservations = await getParkingReservationsByUser(userId);

    // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
    return res.status(200).json({
      success: true,
      data: reservations,
      node: "PRIMARY",
    });
  } catch (error) {
    next(error);
  }
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  createParkingReservationController,
  getParkingReservationsController,
};

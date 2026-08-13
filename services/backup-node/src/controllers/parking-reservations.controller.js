/*
 * Nodo respaldo: mantiene una copia sincronizada, recibe replicacion pasiva y puede ser promovido cuando falla el primario.
 * Controlador HTTP: recibe la solicitud, llama a la capa de servicio/base de datos y devuelve una respuesta JSON.
 */

const {
  createParkingReservation,
  getParkingReservationsByUser,
} = require("../services/parking-reservation.service");

const { getCurrentRole } = require("./promotion.controller");
// Controlador REST que valida ids recibidos y delega la reserva al servicio transaccional.
async function createParkingReservationController(req, res, next) {
  try {
    const { usuarioId, vehiculoId, estacionamientoId } = req.body;

    const userId = Number(usuarioId);

    const vehicleId = Number(vehiculoId);

    const parkingId = Number(estacionamientoId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,

        message: "Identificador de usuario inválido",
      });
    }

    // Valida que el vehiculo seleccionado exista como id numerico antes de reservar.
    if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
      return res.status(400).json({
        success: false,

        message: "Identificador de vehículo inválido",
      });
    }

    // Valida que el estacionamiento seleccionado sea un id numerico valido.
    if (!Number.isInteger(parkingId) || parkingId <= 0) {
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

    return res.status(201).json({
      success: true,

      message: "Espacio reservado correctamente durante el failover",

      data: result.reservation,

      replication: result.replication,

      node: "BACKUP",

      activeRole: getCurrentRole(),
    });
  } catch (error) {
    next(error);
  }
}
// Controlador REST que lista las reservas del usuario autenticado o consultado.
async function getParkingReservationsController(req, res, next) {
  try {
    const userId = Number(req.query.usuarioId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,

        message: "Identificador de usuario inválido",
      });
    }

    const reservations = await getParkingReservationsByUser(userId);

    return res.status(200).json({
      success: true,

      data: reservations,

      node: "BACKUP",

      activeRole: getCurrentRole(),
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

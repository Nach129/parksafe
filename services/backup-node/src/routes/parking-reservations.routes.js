/*
 * Nodo respaldo: mantiene una copia sincronizada, recibe replicacion pasiva y puede ser promovido cuando falla el primario.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const {
  createParkingReservationController,
  getParkingReservationsController,
} = require("../controllers/parking-reservations.controller");

const router = express.Router();
// GET: Endpoint de reservas: crea o lista movimientos de estacionamiento.
// GET /parking/reservations: endpoint de parking-reservations.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.get("/parking/reservations", getParkingReservationsController);
// POST: Endpoint de reservas: crea o lista movimientos de estacionamiento.
// POST /parking/reservations: endpoint de parking-reservations.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.post("/parking/reservations", createParkingReservationController);

module.exports = router;

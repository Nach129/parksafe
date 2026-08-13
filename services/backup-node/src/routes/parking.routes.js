/*
 * Nodo respaldo: mantiene una copia sincronizada, recibe replicacion pasiva y puede ser promovido cuando falla el primario.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const {
  getParkingStatus,
  getParkingSpaces,
  getParkingSpaceById,
} = require("../controllers/parking.controller");

const router = express.Router();
// GET /parking/status: endpoint de parking.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.get("/parking/status", getParkingStatus);
// GET /parking/spaces: endpoint de parking.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.get("/parking/spaces", getParkingSpaces);
// GET /parking/spaces/:id: endpoint de parking.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.get("/parking/spaces/:id", getParkingSpaceById);

module.exports = router;

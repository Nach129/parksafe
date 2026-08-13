/*
 * Microservicio de registro: administra usuarios/vehiculos y valida duplicados antes de guardar datos.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const {
  registerVehicle,
  getVehiclesByUser,
} = require("../controllers/vehicle.controller");

const router = express.Router();
// POST /vehicles: registra patente para un usuario dentro del register-service.
router.post("/vehicles", registerVehicle);
// GET /users/:usuarioId/vehicles: endpoint de vehicle.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.get("/users/:usuarioId/vehicles", getVehiclesByUser);

module.exports = router;

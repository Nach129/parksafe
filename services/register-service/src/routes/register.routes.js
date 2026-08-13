/*
 * Microservicio de registro: administra usuarios/vehiculos y valida duplicados antes de guardar datos.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");
const { registerUser } = require("../controllers/register.controller");

const router = express.Router();
// POST /register: endpoint de register.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.post("/register", registerUser);

module.exports = router;

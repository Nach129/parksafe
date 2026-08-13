/*
 * COMENTARIOS PARKSAFE
 * Microservicio de login: valida credenciales y emite la identidad que el resto del sistema usa para operar.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 * Estos comentarios son explicativos para estudiar y defender el proyecto; no cambian el comportamiento del codigo.
 */

const express = require("express");

const { loginUser } = require("../controllers/login.controller");

const router = express.Router();
// POST /login: endpoint de login.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.post("/login", loginUser);

module.exports = router;

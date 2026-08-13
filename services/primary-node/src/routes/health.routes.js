/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const { getCurrentRole } = require("../services/role.service");

const router = express.Router();
// GET: Endpoint de salud del nodo: heartbeat lo usa para detectar caidas.
// GET /health: endpoint de health.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",

    node: "PRIMARY",

    role: getCurrentRole(),

    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

/*
 * Nodo respaldo: mantiene una copia sincronizada, recibe replicacion pasiva y puede ser promovido cuando falla el primario.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const { getCurrentRole } = require("../controllers/promotion.controller");

const router = express.Router();
// GET: Endpoint de salud del nodo: heartbeat lo usa para detectar caidas.
// GET /health: endpoint de health.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.get("/health", (req, res) => {
  // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
  return res.status(200).json({
    status: "ok",
    node: "BACKUP",
    role: getCurrentRole(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

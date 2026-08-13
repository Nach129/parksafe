/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const { getSnapshot } = require("../controllers/snapshot.controller");

const router = express.Router();
// GET: Endpoint de snapshot: entrega estado completo para resincronizar nodos.
// GET /snapshot: endpoint de snapshot.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.get("/snapshot", getSnapshot);

module.exports = router;

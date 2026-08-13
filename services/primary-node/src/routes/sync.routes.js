/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const { synchronizeSnapshot } = require("../controllers/sync.controller");

const router = express.Router();
// POST: Endpoint de sincronizacion: aplica snapshot remoto sobre la base local.
// POST /sync: endpoint de sync.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.post("/sync", synchronizeSnapshot);

module.exports = router;

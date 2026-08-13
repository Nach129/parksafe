/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const { applyReplication } = require("../controllers/replication.controller");

const router = express.Router();
// POST: Endpoint interno de replicacion: recibe operaciones desde el otro nodo.
// POST /replication: endpoint de replication.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.post("/replication", applyReplication);

module.exports = router;

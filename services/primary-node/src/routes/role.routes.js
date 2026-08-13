/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const { getRole, demote, promote } = require("../controllers/role.controller");

const router = express.Router();
// GET: Endpoint de rol del primario: permite consultar/promover/degradar para controlar failover.
// GET /role: endpoint de role.routes.js que conecta HTTP/JSON con la logica correspondiente del modulo.
router.get("/role", getRole);
// POST: Endpoint de rol del primario: permite consultar/promover/degradar para controlar failover.
// POST /demote: degrada el nodo a STANDBY para evitar dos primarios.
router.post("/demote", demote);
// POST: Endpoint de rol del primario: permite consultar/promover/degradar para controlar failover.
// POST /promote: promueve el nodo a PRIMARY cuando corresponde.
router.post("/promote", promote);

module.exports = router;

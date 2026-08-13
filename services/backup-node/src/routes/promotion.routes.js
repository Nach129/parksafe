/*
 * Nodo respaldo: mantiene una copia sincronizada, recibe replicacion pasiva y puede ser promovido cuando falla el primario.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const { promoteBackup } = require("../controllers/promotion.controller");

const router = express.Router();
// POST: Endpoint de promocion del respaldo: cambia el rol a PRIMARY durante failover.
// POST /promote: promueve el respaldo a PRIMARY durante failover.
router.post("/promote", promoteBackup);

module.exports = router;

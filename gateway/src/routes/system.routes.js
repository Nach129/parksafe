/*
 * Gateway/API Gateway: punto de entrada unico que enruta peticiones, aplica seguridad basica y oculta al cliente si atiende el primario o el respaldo.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");
const axios = require("axios");

const config = require("../config");

const { getHeartbeatState } = require("../services/heartbeat.service");

const { getNodeManagerState } = require("../services/node-manager.service");

const router = express.Router();
// Consulta /health de un servicio para saber si esta disponible y mostrarlo en el estado del sistema.
async function checkService(name, url) {
  try {
    const response = await axios.get(`${url}/health`, {
      timeout: 2000,
    });

    return {
      name,
      status: "ACTIVE",
      details: response.data,
    };
  } catch (error) {
    return {
      name,
      status: "INACTIVE",
      details: null,
    };
  }
}
// GET /status: arma una vista consolidada de Gateway, heartbeat, nodos y microservicios.
router.get("/status", async (req, res) => {
  const baseServices = await Promise.all([
    checkService("register-service", config.services.register),

    checkService("login-service", config.services.login),
  ]);

  // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
  return res.status(200).json({
    success: true,

    gateway: {
      status: "ACTIVE",

      timestamp: new Date().toISOString(),
    },

    nodeManager: getNodeManagerState(),

    heartbeat: getHeartbeatState(),

    services: baseServices,
  });
});

module.exports = router;

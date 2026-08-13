/*
 * Gateway/API Gateway: punto de entrada unico que enruta peticiones, aplica seguridad basica y oculta al cliente si atiende el primario o el respaldo.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const config = require("../config");
const { forwardRequest } = require("../services/proxy.service");

const router = express.Router();
// POST /register: reenvia registro de usuario al register-service.
router.post("/register", async (req, res, next) => {
  try {
    const result = await forwardRequest({
      method: "POST",
      url: `${config.services.register}/register`,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.status(result.status).json(result.data);
  } catch (error) {
    next(error);
  }
});
// POST /login: reenvia credenciales al login-service y devuelve token al frontend.
router.post("/login", async (req, res, next) => {
  try {
    const result = await forwardRequest({
      method: "POST",
      url: `${config.services.login}/login`,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.status(result.status).json(result.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

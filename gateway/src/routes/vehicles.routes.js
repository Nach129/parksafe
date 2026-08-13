/*
 * Gateway/API Gateway: punto de entrada unico que enruta peticiones, aplica seguridad basica y oculta al cliente si atiende el primario o el respaldo.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const config = require("../config");

const { forwardRequest } = require("../services/proxy.service");

const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

/*
 * Registrar vehículo.
 *
 * El cliente NO envía usuarioId.
 * El Gateway lo obtiene desde el JWT.
 */
// POST /api/vehicles: crea un vehiculo asociado al usuario autenticado.
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { patente, marca, modelo, color } = req.body;

    const result = await forwardRequest({
      method: "POST",

      url: `${config.services.register}` + `/vehicles`,

      data: {
        usuarioId: req.user.userId,

        patente,
        marca,
        modelo,
        color,
      },

      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.status(result.status).json(result.data);
  } catch (error) {
    next(error);
  }
});

/*
 * Consultar vehículos del usuario autenticado.
 */
// GET /api/vehicles: lista vehiculos del usuario autenticado.
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const result = await forwardRequest({
      method: "GET",

      url:
        `${config.services.register}` +
        `/users/${req.user.userId}` +
        `/vehicles`,
    });

    return res.status(result.status).json(result.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

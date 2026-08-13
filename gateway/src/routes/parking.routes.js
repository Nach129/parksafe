/*
 * Gateway/API Gateway: punto de entrada unico que enruta peticiones, aplica seguridad basica y oculta al cliente si atiende el primario o el respaldo.
 * Rutas HTTP: declaran endpoints REST y conectan cada URL con su controlador o proxy correspondiente.
 */

const express = require("express");

const config = require("../config");

const { forwardRequest } = require("../services/proxy.service");

const { authenticateToken } = require("../middleware/auth.middleware");

const {
  getActiveNode,
  getActiveNodeUrl,
} = require("../services/node-manager.service");

const router = express.Router();
// GET /status: consulta al nodo activo el resumen de ocupacion y agrega que nodo eligio el Gateway.
router.get("/status", async (req, res, next) => {
  try {
    const activeNodeUrl = getActiveNodeUrl();

    const result = await forwardRequest({
      method: "GET",

      url: `${activeNodeUrl}` + `/parking/status`,
    });

    return res.status(result.status).json({
      ...result.data,

      routedByGatewayTo: getActiveNode(),
    });
  } catch (error) {
    next(error);
  }
});
// GET /spaces: obtiene el mapa completo de espacios desde el nodo activo para mostrar disponibilidad.
router.get("/spaces", async (req, res, next) => {
  try {
    const activeNodeUrl = getActiveNodeUrl();

    const result = await forwardRequest({
      method: "GET",

      url: `${activeNodeUrl}` + `/parking/spaces`,
    });

    return res.status(result.status).json({
      ...result.data,

      routedByGatewayTo: getActiveNode(),
    });
  } catch (error) {
    next(error);
  }
});
// GET /spaces/:id: busca un espacio puntual en el nodo activo usando el id recibido por URL.
router.get("/spaces/:id", async (req, res, next) => {
  try {
    const activeNodeUrl = getActiveNodeUrl();

    const result = await forwardRequest({
      method: "GET",

      url: `${activeNodeUrl}` + `/parking/spaces/` + `${req.params.id}`,
    });

    return res.status(result.status).json({
      ...result.data,

      routedByGatewayTo: getActiveNode(),
    });
  } catch (error) {
    next(error);
  }
});
// GET /reservations: lista reservas del usuario autenticado; el Gateway inyecta usuarioId desde el JWT.
router.get("/reservations", authenticateToken, async (req, res, next) => {
  try {
    const activeNodeUrl = getActiveNodeUrl();

    const result = await forwardRequest({
      method: "GET",

      url:
        `${activeNodeUrl}` +
        `/parking/reservations` +
        `?usuarioId=${req.user.userId}`,
    });

    return res.status(result.status).json({
      ...result.data,

      routedByGatewayTo: getActiveNode(),
    });
  } catch (error) {
    next(error);
  }
});
// POST /reservations: valida que el vehiculo sea del usuario y reenvia la reserva al primario/respaldo activo.
router.post("/reservations", authenticateToken, async (req, res, next) => {
  try {
    const { vehiculoId, estacionamientoId } = req.body;

    /*
     * Validamos que el vehículo
     * pertenezca al usuario autenticado.
     */
    const vehiclesResult = await forwardRequest({
      method: "GET",

      url:
        `${config.services.register}` +
        `/users/` +
        `${req.user.userId}` +
        `/vehicles`,
    });

    const userVehicles = vehiclesResult.data.data || [];

    const belongs = userVehicles.some(
      (vehicle) => Number(vehicle.id) === Number(vehiculoId),
    );

    if (!belongs) {
      // 403 Forbidden: el usuario existe pero no tiene permiso o la cuenta esta desactivada.
      return res.status(403).json({
        success: false,
        message: "El vehículo no pertenece al usuario autenticado",
      });
    }

    const activeNodeUrl = getActiveNodeUrl();

    const result = await forwardRequest({
      method: "POST",

      url: `${activeNodeUrl}` + `/parking/reservations`,

      data: {
        usuarioId: req.user.userId,

        vehiculoId,

        estacionamientoId,
      },

      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.status(result.status).json({
      ...result.data,

      routedByGatewayTo: getActiveNode(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

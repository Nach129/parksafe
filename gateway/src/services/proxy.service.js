/*
 * Gateway/API Gateway: punto de entrada unico que enruta peticiones, aplica seguridad basica y oculta al cliente si atiende el primario o el respaldo.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 */

const axios = require("axios");
const config = require("../config");
// Actua como proxy del Gateway: reenvia metodo, URL, headers y body hacia el microservicio destino.
async function forwardRequest({ method, url, data, headers = {} }) {
  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
      timeout: config.requestTimeoutMs,
    });

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    if (error.response) {
      return {
        status: error.response.status,
        data: error.response.data,
      };
    }

    // Clasifica errores conocidos de base de datos para devolver mensajes mas entendibles.
    if (error.code === "ECONNABORTED") {
      return {
        status: 504,
        data: {
          success: false,
          message: "El servicio tardó demasiado en responder",
        },
      };
    }

    return {
      status: 503,
      data: {
        success: false,
        message: "El servicio solicitado no se encuentra disponible",
      },
    };
  }
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  forwardRequest,
};

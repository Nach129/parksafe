/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Controlador HTTP: recibe la solicitud, llama a la capa de servicio/base de datos y devuelve una respuesta JSON.
 */

const {
  getCurrentRole,
  demoteToStandby,
  promoteToPrimary,
} = require("../services/role.service");

// Administra el rol del nodo para soportar failover y promocion del respaldo.
// Devuelve el rol actual del nodo para que Gateway/heartbeat sepan si es PRIMARY o STANDBY.
async function getRole(req, res) {
  // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
  return res.status(200).json({
    success: true,
    node: "PRIMARY",
    role: getCurrentRole(),
  });
}
// Cambia el nodo a STANDBY; se usa para evitar doble primario al recuperar el nodo original.
async function demote(req, res) {
  const role = demoteToStandby();

  // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
  return res.status(200).json({
    success: true,

    message: "Nodo recuperado cambiado a STANDBY",

    node: "PRIMARY",

    role,
  });
}

// Administra el rol del nodo para soportar failover y promocion del respaldo.
// Cambia el nodo a PRIMARY; se usa cuando el respaldo asume durante el failover.
async function promote(req, res) {
  const role = promoteToPrimary();

  // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
  return res.status(200).json({
    success: true,

    message: "Nodo cambiado a PRIMARY",

    node: "PRIMARY",

    role,
  });
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  getRole,
  demote,
  promote,
};

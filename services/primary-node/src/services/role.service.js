/*
 * COMENTARIOS PARKSAFE
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 * Estos comentarios son explicativos para estudiar y defender el proyecto; no cambian el comportamiento del codigo.
 */

let currentRole = process.env.NODE_ROLE || "PRIMARY";

// Administra el rol del nodo para soportar failover y promocion del respaldo.
// Lee el rol en memoria del proceso para decidir si puede procesar escrituras.
function getCurrentRole() {
  return currentRole;
}

// Administra el rol del nodo para soportar failover y promocion del respaldo.
// Actualiza el rol en memoria y normaliza valores invalidos antes de usarlos en failover.
function setCurrentRole(role) {
  const allowedRoles = ["PRIMARY", "STANDBY"];

  if (!allowedRoles.includes(role)) {
    throw new Error(`Rol no permitido: ${role}`);
  }

  currentRole = role;

  console.log(`[PRIMARY] Rol actualizado a ${currentRole}`);

  return currentRole;
}
// Degrada el nodo a STANDBY para que deje de aceptar reservas directas.
function demoteToStandby() {
  return setCurrentRole("STANDBY");
}

// Administra el rol del nodo para soportar failover y promocion del respaldo.
// Promueve el nodo a PRIMARY para que pueda recibir reservas despues de una falla.
function promoteToPrimary() {
  return setCurrentRole("PRIMARY");
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  getCurrentRole,
  setCurrentRole,
  demoteToStandby,
  promoteToPrimary,
};

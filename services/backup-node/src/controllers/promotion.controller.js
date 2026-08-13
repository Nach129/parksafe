/*
 * Nodo respaldo: mantiene una copia sincronizada, recibe replicacion pasiva y puede ser promovido cuando falla el primario.
 * Controlador HTTP: recibe la solicitud, llama a la capa de servicio/base de datos y devuelve una respuesta JSON.
 */

let currentRole = "BACKUP";

// Administra el rol del nodo para soportar failover y promocion del respaldo.
// Lee el rol en memoria del proceso para decidir si puede procesar escrituras.
function getCurrentRole() {
  return currentRole;
}

// Administra el rol del nodo para soportar failover y promocion del respaldo.
// Promueve explicitamente el nodo respaldo a PRIMARY cuando el Gateway detecta la caida del primario.
function promoteBackup(req, res) {
  // Comprueba el rol del nodo; si no es PRIMARY no debe aceptar escrituras para evitar doble primario.
  if (currentRole === "PRIMARY") {
    // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
    return res.status(200).json({
      success: true,
      message: "El nodo ya se encuentra promovido",
      role: currentRole,
    });
  }

  currentRole = "PRIMARY";

  console.log("[BACKUP] Nodo promovido a PRIMARY");

  // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
  return res.status(200).json({
    success: true,
    message: "Nodo respaldo promovido correctamente",
    role: currentRole,
  });
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  getCurrentRole,
  promoteBackup,
};

/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Conexion a base de datos: centraliza el pool MySQL para reutilizar conexiones entre peticiones concurrentes.
 */

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});
// Prueba una conexion del pool MySQL al arrancar el servicio y falla temprano si la DB no responde.
async function testDatabaseConnection() {
  const connection = await pool.getConnection();

  try {
    await connection.query("SELECT 1");
    console.log("[PRIMARY] Conexión con MySQL establecida");
  } finally {
    // Libera la conexion al pool para que otras peticiones concurrentes puedan reutilizarla.
    connection.release();
  }
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  pool,
  testDatabaseConnection,
};

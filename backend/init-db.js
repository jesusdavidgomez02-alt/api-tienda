// Crea las tablas y carga los datos de database.sql en la base de datos configurada.
// Uso: npm run init-db
const fs = require('fs');
const path = require('path');
const pool = require('./db');

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'database.sql'), 'utf8');
  try {
    await pool.query(sql);
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM productos');
    console.log(`Base de datos lista: ${rows[0].total} productos cargados.`);
  } catch (err) {
    console.error('Error al crear la base de datos:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

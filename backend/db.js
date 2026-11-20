// Conexión a PostgreSQL con un "pool" (reutiliza conexiones)
// - En la nube (Render + Neon) se usa DATABASE_URL (una sola cadena con todo).
// - En tu PC se usan las variables sueltas DB_HOST, DB_USER, etc.
require('dotenv').config();
const { Pool } = require('pg');

// Se quitan parámetros como ?sslmode=require de la URL para que aplique la configuración ssl de abajo
const urlNube = process.env.DATABASE_URL && process.env.DATABASE_URL.split('?')[0];

const pool = urlNube
  ? new Pool({
      connectionString: urlNube,
      ssl: { rejectUnauthorized: false }, // las bases de datos en la nube exigen conexión cifrada
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

module.exports = pool;

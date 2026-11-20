// API REST de consulta - Tienda de barrio
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
app.use(cors());                 // permite que el frontend consulte desde otro origen
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // sirve el frontend

const SELECT_PRODUCTOS = `
  SELECT p.id, p.nombre, p.precio, p.stock, c.nombre AS categoria
  FROM productos p
  JOIN categorias c ON c.id = p.categoria_id`;

// GET /api/salud -> verifica que el servidor y la base de datos estén vivos
app.get('/api/salud', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', baseDeDatos: 'conectada', fecha: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ estado: 'error', baseDeDatos: 'sin conexión' });
  }
});

// GET /api/categorias -> lista de categorías
app.get('/api/categorias', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar categorías' });
  }
});

// GET /api/productos -> todos los productos
// Filtros opcionales: ?nombre=arroz  ?categoria=2  (se pueden combinar)
app.get('/api/productos', async (req, res) => {
  const { nombre, categoria } = req.query;
  const condiciones = [];
  const valores = [];

  if (nombre) {
    valores.push(`%${nombre}%`);
    condiciones.push(`p.nombre ILIKE $${valores.length}`);
  }
  if (categoria) {
    valores.push(categoria);
    condiciones.push(`p.categoria_id = $${valores.length}`);
  }

  let sql = SELECT_PRODUCTOS;
  if (condiciones.length) sql += ' WHERE ' + condiciones.join(' AND ');
  sql += ' ORDER BY p.nombre';

  try {
    const { rows } = await pool.query(sql, valores);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar productos' });
  }
});

// GET /api/productos/stock-bajo?limite=5 -> productos por agotarse
// (va ANTES de /:id para que "stock-bajo" no se tome como un id)
app.get('/api/productos/stock-bajo', async (req, res) => {
  const limite = Number(req.query.limite) || 5;
  try {
    const { rows } = await pool.query(
      `${SELECT_PRODUCTOS} WHERE p.stock <= $1 ORDER BY p.stock`, [limite]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar stock bajo' });
  }
});

// GET /api/productos/:id -> un producto
app.get('/api/productos/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'El id debe ser un número' });

  try {
    const { rows } = await pool.query(`${SELECT_PRODUCTOS} WHERE p.id = $1`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar el producto' });
  }
});

// Ruta no encontrada
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Solo arranca el servidor si se ejecuta directamente (npm start).
// Las pruebas importan "app" sin ocupar el puerto.
if (require.main === module) {
  const PORT = process.env.PORT || 3000; // Render asigna el puerto con la variable PORT
  app.listen(PORT, () => console.log(`API corriendo en el puerto ${PORT}`));
}

module.exports = app;

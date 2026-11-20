// Pruebas automáticas de la API (Formativa 2)
// Ejecutar: npm test   (necesita la base de datos con los datos de database.sql)
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../server');
const pool = require('../db');

let server;
let base;

before(async () => {
  server = app.listen(0); // puerto libre al azar
  await new Promise((r) => server.once('listening', r));
  base = `http://localhost:${server.address().port}/api`;
});

after(async () => {
  server.close();
  await pool.end();
});

async function get(ruta) {
  const res = await fetch(base + ruta);
  return { status: res.status, body: await res.json() };
}

test('1. GET /salud responde ok y la base de datos está conectada', async () => {
  const { status, body } = await get('/salud');
  assert.strictEqual(status, 200);
  assert.strictEqual(body.baseDeDatos, 'conectada');
});

test('2. GET /categorias devuelve las 5 categorías', async () => {
  const { status, body } = await get('/categorias');
  assert.strictEqual(status, 200);
  assert.strictEqual(body.length, 5);
});

test('3. GET /productos devuelve los 15 productos con sus campos', async () => {
  const { status, body } = await get('/productos');
  assert.strictEqual(status, 200);
  assert.strictEqual(body.length, 15);
  for (const campo of ['id', 'nombre', 'precio', 'stock', 'categoria']) {
    assert.ok(campo in body[0], `falta el campo ${campo}`);
  }
});

test('4. GET /productos?nombre=arroz filtra por nombre', async () => {
  const { body } = await get('/productos?nombre=arroz');
  assert.strictEqual(body.length, 1);
  assert.strictEqual(body[0].nombre, 'Arroz 1 kg');
});

test('5. GET /productos?categoria=3 trae solo Lácteos', async () => {
  const { body } = await get('/productos?categoria=3');
  assert.ok(body.length > 0);
  assert.ok(body.every((p) => p.categoria === 'Lácteos'));
});

test('6. GET /productos/4 devuelve un solo producto', async () => {
  const { status, body } = await get('/productos/4');
  assert.strictEqual(status, 200);
  assert.strictEqual(body.id, 4);
});

test('7. GET /productos/stock-bajo?limite=3 trae solo stock <= 3, de menor a mayor', async () => {
  const { body } = await get('/productos/stock-bajo?limite=3');
  assert.ok(body.every((p) => p.stock <= 3));
  const stocks = body.map((p) => p.stock);
  assert.deepStrictEqual(stocks, [...stocks].sort((a, b) => a - b));
});

test('8. GET /productos/999 responde 404 (no existe)', async () => {
  const { status } = await get('/productos/999');
  assert.strictEqual(status, 404);
});

test('9. GET /productos/abc responde 400 (id inválido)', async () => {
  const { status } = await get('/productos/abc');
  assert.strictEqual(status, 400);
});

test('10. Búsqueda con texto malicioso no rompe la API (inyección SQL)', async () => {
  const { status, body } = await get("/productos?nombre=' OR 1=1 --");
  assert.strictEqual(status, 200);
  assert.strictEqual(body.length, 0);
});

test('11. Ruta inexistente responde 404', async () => {
  const { status } = await get('/no-existe');
  assert.strictEqual(status, 404);
});

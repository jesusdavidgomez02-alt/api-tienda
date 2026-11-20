// Frontend: consulta la API con fetch y pinta los resultados
// Ruta relativa: funciona igual en localhost y en el servidor de Render
const API = '/api';

const tabla = document.getElementById('tabla');
const mensaje = document.getElementById('mensaje');
const selectCategoria = document.getElementById('categoria');

const formatoPesos = (n) => '$' + n.toLocaleString('es-CO');

async function consultar(url) {
  mensaje.textContent = 'Consultando ' + url + ' ...';
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error('Respuesta ' + respuesta.status);
    return await respuesta.json();
  } catch (err) {
    mensaje.textContent = 'Error: no se pudo conectar con la API (' + err.message + ')';
    return null;
  }
}

function pintarProductos(productos, titulo) {
  tabla.innerHTML = '';
  if (!productos) return;
  mensaje.textContent = `${titulo}: ${productos.length} resultado(s)`;

  productos.forEach((p) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${formatoPesos(p.precio)}</td>
      <td class="${p.stock <= 5 ? 'bajo' : ''}">${p.stock}</td>`;
    tabla.appendChild(fila);
  });
}

async function cargarCategorias() {
  const categorias = await consultar(`${API}/categorias`);
  if (!categorias) return;
  categorias.forEach((c) => {
    const opcion = document.createElement('option');
    opcion.value = c.id;
    opcion.textContent = c.nombre;
    selectCategoria.appendChild(opcion);
  });
}

async function cargarTodos() {
  pintarProductos(await consultar(`${API}/productos`), 'Todos los productos');
}

document.getElementById('filtros').addEventListener('submit', async (e) => {
  e.preventDefault();
  const params = new URLSearchParams();
  const nombre = document.getElementById('nombre').value.trim();
  if (nombre) params.append('nombre', nombre);
  if (selectCategoria.value) params.append('categoria', selectCategoria.value);
  pintarProductos(await consultar(`${API}/productos?${params}`), 'Búsqueda');
});

document.getElementById('btnStock').addEventListener('click', async () => {
  pintarProductos(await consultar(`${API}/productos/stock-bajo?limite=5`), 'Stock bajo (≤ 5)');
});

document.getElementById('btnTodos').addEventListener('click', cargarTodos);

cargarCategorias();
cargarTodos();

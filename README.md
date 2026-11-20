# API REST de consulta – Tienda de barrio

Backend: Node.js + Express. Base de datos: PostgreSQL. Frontend: HTML + JavaScript (fetch) + Pure.css.

- **Formativa 1:** API REST de consulta + frontend consultando (en localhost).
- **Formativa 2:** backend montado en un servidor en la nube + pruebas del proyecto.

## Arquitectura en el servidor

```
Navegador  →  Render (Node.js + Express, sirve API y frontend)  →  Neon (PostgreSQL en la nube)
```

## Endpoints (todos GET)

| Ruta | Qué devuelve |
|---|---|
| `/api/salud` | Estado del servidor y de la conexión a la base de datos |
| `/api/categorias` | Lista de categorías |
| `/api/productos` | Todos los productos |
| `/api/productos?nombre=arroz` | Productos cuyo nombre contiene "arroz" |
| `/api/productos?categoria=2` | Productos de la categoría 2 |
| `/api/productos/:id` | Un producto (404 si no existe, 400 si el id no es número) |
| `/api/productos/stock-bajo?limite=5` | Productos con stock ≤ 5 |

## Correr en tu PC (localhost)

1. En pgAdmin crea la base de datos `tienda`, abre Query Tool sobre ella, pega `database.sql` y presiona F5.
2. En la terminal:
   ```
   cd backend
   copy .env.example .env
   ```
   Pon tu contraseña de PostgreSQL en `.env`.
3. `npm install` y luego `npm start`
4. Abre http://localhost:3000

## Pruebas del proyecto

```
cd backend
npm test
```

Son 11 pruebas automáticas (`backend/test/api.test.js`):

| # | Prueba | Resultado esperado |
|---|---|---|
| 1 | GET /api/salud | 200, base de datos conectada |
| 2 | GET /api/categorias | 5 categorías |
| 3 | GET /api/productos | 15 productos con id, nombre, precio, stock, categoría |
| 4 | Buscar "arroz" | 1 resultado: Arroz 1 kg |
| 5 | Filtrar categoría 3 | Solo Lácteos |
| 6 | GET /api/productos/4 | Producto con id 4 |
| 7 | Stock bajo (límite 3) | Solo stock ≤ 3, ordenado de menor a mayor |
| 8 | GET /api/productos/999 | 404 |
| 9 | GET /api/productos/abc | 400 |
| 10 | Búsqueda con `' OR 1=1 --` | 200 y 0 resultados (protegido contra inyección SQL) |
| 11 | Ruta inexistente | 404 |

---

# Guía de despliegue (Formativa 2)

Necesitas 3 cuentas gratuitas, sin tarjeta: **GitHub**, **Neon** y **Render**. Lo más fácil es crear Neon y Render entrando con tu cuenta de GitHub.

## Paso 1 – Subir el proyecto a GitHub

1. Crea una cuenta en github.com.
2. Arriba a la derecha, **+ → New repository**. Nombre: `api-tienda`. Déjalo **Public** y no marques ninguna casilla. Dale **Create repository**.
3. En la página que aparece, haz clic en **"uploading an existing file"**.
4. Arrastra el **contenido** de la carpeta `api-tienda`: `backend`, `frontend`, `database.sql`, `README.md` y `.gitignore`. **No subas** `node_modules` ni `.env`.
5. Dale **Commit changes**.

> Si `.gitignore` no aparece en Windows al arrastrar, no pasa nada: lo importante es no subir `node_modules` ni `.env`.

## Paso 2 – Crear la base de datos en Neon

1. Entra a neon.com → **Sign up** → **Continue with GitHub**.
2. Crea un proyecto: nombre `tienda`, región **AWS US East** (la más cercana a Colombia), versión de Postgres la que salga por defecto.
3. En el panel del proyecto haz clic en **Connect** y copia la **connection string**. Se ve así:
   `postgresql://neondb_owner:abc123@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require`
4. Para crear las tablas: en el menú izquierdo abre **SQL Editor**, pega todo `database.sql` y dale **Run**.
5. Para verificar: ejecuta `SELECT * FROM productos;`. Deben salir 15 filas.

> Otra opción en lugar del paso 4: en tu PC, pon en `.env` la línea `DATABASE_URL=<la cadena de Neon>` y ejecuta `npm run init-db`.

## Paso 3 – Montar el backend en Render

1. Entra a render.com → **Get Started** → **GitHub**.
2. **New + → Web Service** → conecta tu repositorio `api-tienda`.
3. Configura:

   | Campo | Valor |
   |---|---|
   | Name | `api-tienda-jesus` (será parte de la URL) |
   | Region | Oregon u Ohio (cualquiera de EE. UU.) |
   | Branch | `main` |
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | **Free** |

4. En **Environment Variables** agrega:
   - Key: `DATABASE_URL` → Value: la cadena de Neon del Paso 2.
5. Dale **Deploy Web Service**. Tarda 2–4 minutos. En los logs debe salir `API corriendo en el puerto 10000`.
6. Arriba aparece tu URL, por ejemplo `https://api-tienda-jesus.onrender.com`.

## Paso 4 – Probar en el servidor

Abre en el navegador (cambia por tu URL):

- `https://api-tienda-jesus.onrender.com/api/salud` → debe decir `"baseDeDatos":"conectada"`
- `https://api-tienda-jesus.onrender.com/api/productos`
- `https://api-tienda-jesus.onrender.com/api/productos/999` → error 404
- `https://api-tienda-jesus.onrender.com` → la página con la tabla funcionando

**Importante:** el plan gratis de Render apaga el servidor después de 15 minutos sin visitas. La primera visita después tarda entre 30 y 60 segundos en responder. Abre la URL un minuto antes de mostrársela al profe.

## Problemas comunes

| Síntoma | Causa / solución |
|---|---|
| Render: `Cannot find module 'express'` | Root Directory no quedó en `backend` |
| `/api/salud` responde "sin conexión" | `DATABASE_URL` mal copiada en Render (Settings → Environment) |
| `relation "productos" does not exist` | No ejecutaste `database.sql` en el SQL Editor de Neon |
| La página tarda mucho en abrir | El servidor estaba dormido; espera unos segundos |
| Cambié código y no se ve en Render | Sube el archivo de nuevo a GitHub; Render redespliega solo |

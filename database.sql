-- Base de datos: tienda
-- 1) En pgAdmin crea una base de datos llamada: tienda
-- 2) Clic derecho sobre "tienda" > Query Tool
-- 3) Pega TODO este archivo y presiona F5

DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;

CREATE TABLE categorias (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE productos (
  id           SERIAL PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  precio       INTEGER NOT NULL CHECK (precio >= 0),   -- pesos colombianos
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  categoria_id INTEGER NOT NULL REFERENCES categorias(id)
);

INSERT INTO categorias (nombre) VALUES
  ('Bebidas'), ('Granos'), ('Lácteos'), ('Aseo'), ('Snacks');

INSERT INTO productos (nombre, precio, stock, categoria_id) VALUES
  ('Gaseosa 1.5 L',          5500, 24, 1),
  ('Agua 600 ml',            2000, 40, 1),
  ('Jugo de caja 1 L',       4800,  3, 1),
  ('Arroz 1 kg',             4200, 30, 2),
  ('Lentejas 500 g',         3800,  4, 2),
  ('Fríjol 500 g',           5200, 12, 2),
  ('Leche 1 L',              4500, 18, 3),
  ('Queso costeño 250 g',    7000,  2, 3),
  ('Yogur 200 g',            2500, 15, 3),
  ('Jabón de baño',          3000, 20, 4),
  ('Detergente 1 kg',        9500,  5, 4),
  ('Papel higiénico x4',     8200, 10, 4),
  ('Papas fritas 45 g',      2500, 35, 5),
  ('Galletas de soda',       3500,  1, 5),
  ('Chocolatina',            1500, 50, 5);

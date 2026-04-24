USE list_and_save;

-- Usuario demo para autologin
INSERT INTO Usuarios (email, password)
VALUES ('demo@listandsave.local', 'demo1234')
ON DUPLICATE KEY UPDATE
password = VALUES(password);

-- Productos demo
INSERT INTO Productos (nombre, marca, codigo_barras_ean, imagen_url) VALUES
('Cebolla dulce', 'Huerta Plus', '840000000001', 'assets/images/demo-cebolla.jpg'),
('Tomate pera', 'Fresco Dia', '840000000002', 'assets/images/demo-tomate.jpg'),
('Leche semidesnatada', 'Lacfrio', '840000000003', 'assets/images/demo-leche.jpg'),
('Pan integral', 'Horno Vivo', '840000000004', 'assets/images/demo-pan.jpg')
ON DUPLICATE KEY UPDATE
nombre = VALUES(nombre),
marca = VALUES(marca),
imagen_url = VALUES(imagen_url);

-- Supermercados demo
INSERT INTO Supermercados (nombre_supermercado, logo_url) VALUES
('Mercadona', 'assets/images/mercadona-logo.png'),
('Carrefour', 'assets/images/carrefour-logo.png'),
('Lidl', 'assets/images/lidl-logo.png')
ON DUPLICATE KEY UPDATE
logo_url = VALUES(logo_url);

-- Vinculacion producto-tienda
INSERT INTO ProductosTienda (id_producto, id_supermercado, url_externa_scraping)
SELECT p.id_producto, s.id_supermercado, CONCAT('https://demo.local/', p.id_producto, '/', s.id_supermercado)
FROM Productos p
CROSS JOIN Supermercados s
WHERE p.codigo_barras_ean IN ('840000000001', '840000000002', '840000000003', '840000000004')
  AND NOT EXISTS (
    SELECT 1
    FROM ProductosTienda pt
    WHERE pt.id_producto = p.id_producto
      AND pt.id_supermercado = s.id_supermercado
  );

-- Precios demo
INSERT INTO Precios (id_producto_tienda, precio_actual, precio_oferta, fecha_extraccion)
SELECT pt.id_producto_tienda,
       ROUND(0.80 + (RAND() * 3), 2) AS precio_actual,
       ROUND(0.70 + (RAND() * 2.5), 2) AS precio_oferta,
       NOW()
FROM ProductosTienda pt
JOIN Productos p ON p.id_producto = pt.id_producto
WHERE p.codigo_barras_ean IN ('840000000001', '840000000002', '840000000003', '840000000004')
  AND NOT EXISTS (
    SELECT 1 FROM Precios pr WHERE pr.id_producto_tienda = pt.id_producto_tienda
  );

-- Lista guardada demo
INSERT INTO ListasGuardadas (id_usuario, id_producto, cantidad)
SELECT u.id_usuario, p.id_producto, 1
FROM Usuarios u
JOIN Productos p ON p.codigo_barras_ean IN ('840000000001', '840000000003')
WHERE u.email = 'demo@listandsave.local'
  AND NOT EXISTS (
    SELECT 1
    FROM ListasGuardadas l
    WHERE l.id_usuario = u.id_usuario
      AND l.id_producto = p.id_producto
  );

-- Ajustes demo
INSERT INTO AjustesUsuario (id_usuario, tema_oscuro, notificaciones)
SELECT u.id_usuario, FALSE, TRUE
FROM Usuarios u
WHERE u.email = 'demo@listandsave.local'
  AND NOT EXISTS (
    SELECT 1 FROM AjustesUsuario a WHERE a.id_usuario = u.id_usuario
  );

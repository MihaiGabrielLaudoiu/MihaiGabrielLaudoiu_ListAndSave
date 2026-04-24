-- ==========================================
-- List&Save - Esquema inicial (DDL)
-- Entorno: MySQL (Laragon)
-- ==========================================

CREATE DATABASE IF NOT EXISTS list_and_save
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE list_and_save;

-- =========================
-- TABLAS INDEPENDIENTES
-- =========================

CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    marca VARCHAR(100),
    codigo_barras_ean VARCHAR(50) UNIQUE,
    imagen_url VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Supermercados (
    id_supermercado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_supermercado VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255)
) ENGINE=InnoDB;

-- =========================
-- TABLAS DEPENDIENTES
-- =========================

CREATE TABLE IF NOT EXISTS AjustesUsuario (
    id_ajuste INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tema_oscuro BOOLEAN DEFAULT FALSE,
    notificaciones BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_ajustes_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ListasGuardadas (
    id_lista INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT DEFAULT 1,
    CONSTRAINT fk_listas_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_listas_producto
        FOREIGN KEY (id_producto)
        REFERENCES Productos(id_producto)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ProductosTienda (
    id_producto_tienda INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    id_supermercado INT NOT NULL,
    url_externa_scraping VARCHAR(500),
    CONSTRAINT fk_productotienda_producto
        FOREIGN KEY (id_producto)
        REFERENCES Productos(id_producto)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_productotienda_supermercado
        FOREIGN KEY (id_supermercado)
        REFERENCES Supermercados(id_supermercado)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Precios (
    id_precio INT AUTO_INCREMENT PRIMARY KEY,
    id_producto_tienda INT NOT NULL,
    precio_actual DECIMAL(8,2) NOT NULL,
    precio_oferta DECIMAL(8,2) NULL,
    fecha_extraccion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_precios_producto_tienda
        FOREIGN KEY (id_producto_tienda)
        REFERENCES ProductosTienda(id_producto_tienda)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

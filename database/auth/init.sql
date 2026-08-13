

-- Base de datos separada por responsabilidad: auth, primario o respaldo segun el microservicio.
CREATE DATABASE IF NOT EXISTS parksafe_auth
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Selecciona el esquema activo antes de crear tablas o datos de prueba.
USE parksafe_auth;

-- Tabla del modelo persistente usada por los microservicios.

-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    nombre_usuario VARCHAR(50)
        NOT NULL
        UNIQUE,

    correo VARCHAR(120)
        NOT NULL
        UNIQUE,

    password_hash VARCHAR(255)
        NOT NULL,

    rol ENUM(
        'CLIENTE',
        'ADMINISTRADOR'
    ) NOT NULL DEFAULT 'CLIENTE',

    activo BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    fecha_creacion DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE IF NOT EXISTS vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    patente VARCHAR(10)
        NOT NULL
        UNIQUE,

    marca VARCHAR(50),

    modelo VARCHAR(50),

    color VARCHAR(30),

    activo BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    fecha_registro DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vehiculo_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;
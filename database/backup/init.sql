

-- Base de datos separada por responsabilidad: auth, primario o respaldo segun el microservicio.
CREATE DATABASE IF NOT EXISTS parksafe_backup
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Selecciona el esquema activo antes de crear tablas o datos de prueba.
USE parksafe_backup;

-- Tabla del modelo persistente usada por los microservicios.

-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE IF NOT EXISTS estacionamientos (
    id INT PRIMARY KEY,

    nombre VARCHAR(120) NOT NULL,

    ubicacion VARCHAR(200),

    capacidad_total INT NOT NULL,

    estado ENUM(
        'ACTIVO',
        'CERRADO'
    ) NOT NULL DEFAULT 'ACTIVO',

    fecha_creacion DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE IF NOT EXISTS espacios (
    id INT PRIMARY KEY,

    estacionamiento_id INT NOT NULL,

    codigo VARCHAR(20)
        NOT NULL,

    estado ENUM(
        'DISPONIBLE',
        'RESERVADO',
        'OCUPADO',
        'FUERA_DE_SERVICIO'
    ) NOT NULL DEFAULT 'DISPONIBLE',

    vehiculo_id INT NULL,

    fecha_actualizacion DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_backup_espacio_codigo
        UNIQUE (
            estacionamiento_id,
            codigo
        ),

    CONSTRAINT fk_backup_espacio_estacionamiento
        FOREIGN KEY (estacionamiento_id)
        REFERENCES estacionamientos(id)
) ENGINE=InnoDB;


-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE IF NOT EXISTS movimientos_estacionamiento (
    id INT AUTO_INCREMENT PRIMARY KEY,

    codigo VARCHAR(50)
        NOT NULL
        UNIQUE,

    usuario_id INT NOT NULL,

    vehiculo_id INT NOT NULL,

    espacio_id INT NOT NULL,

    tipo ENUM(
        'RESERVA',
        'INGRESO',
        'SALIDA',
        'CANCELACION'
    ) NOT NULL,

    estado ENUM(
        'ACTIVO',
        'COMPLETADO',
        'CANCELADO'
    ) NOT NULL DEFAULT 'ACTIVO',

    nodo_procesador ENUM(
        'PRIMARIO',
        'RESPALDO'
    ) NOT NULL,

    operation_id VARCHAR(60)
        NOT NULL
        UNIQUE,

    fecha_movimiento DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_backup_movimiento_espacio
        FOREIGN KEY (espacio_id)
        REFERENCES espacios(id)
) ENGINE=InnoDB;


-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE IF NOT EXISTS operaciones_replicadas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    operation_id VARCHAR(60)
        NOT NULL
        UNIQUE,

    tipo VARCHAR(50)
        NOT NULL,

    contenido JSON
        NOT NULL,

    fecha_aplicacion DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE IF NOT EXISTS operaciones_replicacion (
    id INT AUTO_INCREMENT PRIMARY KEY,

    operation_id VARCHAR(60)
        NOT NULL
        UNIQUE,

    tipo VARCHAR(50)
        NOT NULL,

    contenido JSON
        NOT NULL,

    estado ENUM(
        'PENDIENTE',
        'APLICADA',
        'ERROR'
    ) NOT NULL DEFAULT 'PENDIENTE',

    fecha_creacion DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    fecha_actualizacion DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- Datos iniciales para poder demostrar el sistema sin carga manual previa.
-- Carga inicial: 
INSERT INTO estacionamientos (
    id,
    nombre,
    ubicacion,
    capacidad_total,
    estado
)
VALUES (
    1,
    'Estacionamiento Principal',
    'Universidad de Tarapacá',
    10,
    'ACTIVO'
);

INSERT INTO espacios (
    id,
    estacionamiento_id,
    codigo,
    estado
)
VALUES
(1, 1, 'A-01', 'DISPONIBLE'),
(2, 1, 'A-02', 'DISPONIBLE'),
(3, 1, 'A-03', 'DISPONIBLE'),
(4, 1, 'A-04', 'DISPONIBLE'),
(5, 1, 'A-05', 'DISPONIBLE'),
(6, 1, 'A-06', 'DISPONIBLE'),
(7, 1, 'A-07', 'DISPONIBLE'),
(8, 1, 'A-08', 'DISPONIBLE'),
(9, 1, 'A-09', 'DISPONIBLE'),
(10, 1, 'A-10', 'DISPONIBLE');
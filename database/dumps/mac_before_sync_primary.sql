
-- MySQL dump 10.13  Distrib 8.4.11, for Linux (aarch64)
--
-- Host: localhost    Database: parksafe_primary
-- ------------------------------------------------------
-- Server version	8.4.11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `espacios`
--

DROP TABLE IF EXISTS `espacios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
-- Tabla del modelo persistente usada por los microservicios.
-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE `espacios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estacionamiento_id` int NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `estado` enum('DISPONIBLE','RESERVADO','OCUPADO','FUERA_DE_SERVICIO') NOT NULL DEFAULT 'DISPONIBLE',
  `vehiculo_id` int DEFAULT NULL,
  `fecha_actualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_espacio_codigo` (`estacionamiento_id`,`codigo`),
  CONSTRAINT `fk_espacio_estacionamiento` FOREIGN KEY (`estacionamiento_id`) REFERENCES `estacionamientos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `espacios`
--

LOCK TABLES `espacios` WRITE;
/*!40000 ALTER TABLE `espacios` DISABLE KEYS */;
-- Datos iniciales para poder demostrar el sistema sin carga manual previa.
-- Carga inicial: deja datos disponibles para correr la demo inmediatamente.
INSERT INTO `espacios` VALUES (1,1,'A-01','DISPONIBLE',NULL,'2026-08-12 02:41:20'),(2,1,'A-02','DISPONIBLE',NULL,'2026-08-12 02:41:20'),(3,1,'A-03','DISPONIBLE',NULL,'2026-08-12 02:41:20'),(4,1,'A-04','DISPONIBLE',NULL,'2026-08-12 02:41:20'),(5,1,'A-05','DISPONIBLE',NULL,'2026-08-12 02:41:20'),(6,1,'A-06','DISPONIBLE',NULL,'2026-08-12 02:41:20'),(7,1,'A-07','DISPONIBLE',NULL,'2026-08-12 02:41:20'),(8,1,'A-08','DISPONIBLE',NULL,'2026-08-12 02:41:20'),(9,1,'A-09','DISPONIBLE',NULL,'2026-08-12 02:41:20'),(10,1,'A-10','DISPONIBLE',NULL,'2026-08-12 02:41:20');
/*!40000 ALTER TABLE `espacios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estacionamientos`
--

DROP TABLE IF EXISTS `estacionamientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE `estacionamientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `capacidad_total` int NOT NULL,
  `estado` enum('ACTIVO','CERRADO') NOT NULL DEFAULT 'ACTIVO',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_capacidad_estacionamiento` CHECK ((`capacidad_total` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estacionamientos`
--

LOCK TABLES `estacionamientos` WRITE;
/*!40000 ALTER TABLE `estacionamientos` DISABLE KEYS */;
-- Carga inicial: deja datos disponibles para correr la demo inmediatamente.
INSERT INTO `estacionamientos` VALUES (1,'Estacionamiento Principal','Universidad de TarapacÃ¡',10,'ACTIVO','2026-08-12 02:41:20');
/*!40000 ALTER TABLE `estacionamientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_estacionamiento`
--

DROP TABLE IF EXISTS `movimientos_estacionamiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE `movimientos_estacionamiento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `usuario_id` int NOT NULL,
  `vehiculo_id` int NOT NULL,
  `espacio_id` int NOT NULL,
  `tipo` enum('RESERVA','INGRESO','SALIDA','CANCELACION') NOT NULL,
  `estado` enum('ACTIVO','COMPLETADO','CANCELADO') NOT NULL DEFAULT 'ACTIVO',
  `nodo_procesador` enum('PRIMARIO','RESPALDO') NOT NULL,
  `operation_id` varchar(60) NOT NULL,
  `fecha_movimiento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `operation_id` (`operation_id`),
  KEY `fk_movimiento_espacio` (`espacio_id`),
  CONSTRAINT `fk_movimiento_espacio` FOREIGN KEY (`espacio_id`) REFERENCES `espacios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_estacionamiento`
--

LOCK TABLES `movimientos_estacionamiento` WRITE;
/*!40000 ALTER TABLE `movimientos_estacionamiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_estacionamiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operaciones_replicacion`
--

DROP TABLE IF EXISTS `operaciones_replicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE `operaciones_replicacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `operation_id` varchar(60) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `contenido` json NOT NULL,
  `estado` enum('PENDIENTE','APLICADA','ERROR') NOT NULL DEFAULT 'PENDIENTE',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `operation_id` (`operation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operaciones_replicacion`
--

LOCK TABLES `operaciones_replicacion` WRITE;
/*!40000 ALTER TABLE `operaciones_replicacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `operaciones_replicacion` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-12  3:18:13

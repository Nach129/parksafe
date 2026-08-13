

-- MySQL dump 10.13  Distrib 8.4.11, for Linux (aarch64)
--
-- Host: localhost    Database: parksafe_backup
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
  `id` int NOT NULL,
  `estacionamiento_id` int NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `estado` enum('DISPONIBLE','RESERVADO','OCUPADO','FUERA_DE_SERVICIO') NOT NULL DEFAULT 'DISPONIBLE',
  `vehiculo_id` int DEFAULT NULL,
  `fecha_actualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_backup_espacio_codigo` (`estacionamiento_id`,`codigo`),
  CONSTRAINT `fk_backup_espacio_estacionamiento` FOREIGN KEY (`estacionamiento_id`) REFERENCES `estacionamientos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `espacios`
--

LOCK TABLES `espacios` WRITE;
/*!40000 ALTER TABLE `espacios` DISABLE KEYS */;
-- Datos iniciales para poder demostrar el sistema sin carga manual previa.
-- Carga inicial: deja datos disponibles para correr la demo inmediatamente.
INSERT INTO `espacios` VALUES (1,1,'A-01','RESERVADO',1,'2026-08-09 04:08:16'),(2,1,'A-02','RESERVADO',2,'2026-08-09 04:29:45'),(3,1,'A-03','RESERVADO',3,'2026-08-09 04:50:59'),(4,1,'A-04','RESERVADO',4,'2026-08-09 05:07:52'),(5,1,'A-05','RESERVADO',5,'2026-08-09 05:50:33'),(6,1,'A-06','RESERVADO',6,'2026-08-09 05:50:33'),(7,1,'A-07','RESERVADO',7,'2026-08-09 05:50:33'),(8,1,'A-08','RESERVADO',8,'2026-08-09 05:50:33'),(9,1,'A-09','RESERVADO',9,'2026-08-09 05:50:33'),(10,1,'A-10','RESERVADO',10,'2026-08-09 05:51:50'),(11,2,'B-01','RESERVADO',15,'2026-08-09 22:38:44'),(12,2,'B-02','RESERVADO',16,'2026-08-09 22:44:30'),(13,2,'B-03','RESERVADO',12,'2026-08-10 21:14:09'),(14,2,'B-04','RESERVADO',18,'2026-08-10 22:53:21'),(15,2,'B-05','DISPONIBLE',NULL,'2026-08-10 22:40:49'),(16,2,'B-06','DISPONIBLE',NULL,'2026-08-10 22:40:49'),(17,2,'B-07','DISPONIBLE',NULL,'2026-08-10 22:40:49'),(18,2,'B-08','DISPONIBLE',NULL,'2026-08-10 22:40:49'),(19,2,'B-09','DISPONIBLE',NULL,'2026-08-10 22:40:49'),(20,2,'B-10','DISPONIBLE',NULL,'2026-08-10 22:40:49'),(21,3,'C-01','DISPONIBLE',NULL,'2026-08-10 22:42:52'),(22,3,'C-02','DISPONIBLE',NULL,'2026-08-10 22:42:52'),(23,3,'C-03','DISPONIBLE',NULL,'2026-08-10 22:42:52'),(24,3,'C-04','DISPONIBLE',NULL,'2026-08-10 22:42:52'),(25,3,'C-05','DISPONIBLE',NULL,'2026-08-10 22:42:52'),(26,3,'C-06','DISPONIBLE',NULL,'2026-08-10 22:42:52'),(27,3,'C-07','DISPONIBLE',NULL,'2026-08-10 22:42:52'),(28,3,'C-08','DISPONIBLE',NULL,'2026-08-10 22:42:52'),(29,3,'C-09','DISPONIBLE',NULL,'2026-08-10 22:42:52'),(30,3,'C-10','DISPONIBLE',NULL,'2026-08-10 22:42:52');
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
  `id` int NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `capacidad_total` int NOT NULL,
  `estado` enum('ACTIVO','CERRADO') NOT NULL DEFAULT 'ACTIVO',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estacionamientos`
--

LOCK TABLES `estacionamientos` WRITE;
/*!40000 ALTER TABLE `estacionamientos` DISABLE KEYS */;
-- Carga inicial: deja datos disponibles para correr la demo inmediatamente.
INSERT INTO `estacionamientos` VALUES (1,'Estacionamiento Principal','Universidad de Tarapac├â┬í',10,'ACTIVO','2026-08-09 03:45:40'),(2,'Estacionamiento Secundario','Zona de pruebas ParkSafe',10,'ACTIVO','2026-08-09 22:34:59'),(3,'Estacionamiento Demo',NULL,10,'ACTIVO','2026-08-10 22:42:39');
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
  KEY `fk_backup_movimiento_espacio` (`espacio_id`),
  CONSTRAINT `fk_backup_movimiento_espacio` FOREIGN KEY (`espacio_id`) REFERENCES `espacios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_estacionamiento`
--

LOCK TABLES `movimientos_estacionamiento` WRITE;
/*!40000 ALTER TABLE `movimientos_estacionamiento` DISABLE KEYS */;
-- Carga inicial: deja datos disponibles para correr la demo inmediatamente.
INSERT INTO `movimientos_estacionamiento` VALUES (1,'PARK-48496263-6847',1,1,1,'RESERVA','ACTIVO','PRIMARIO','7729e74f-a383-4342-abc2-c79e002c3243','2026-08-09 04:08:16'),(2,'PARK-49785037-1627',1,2,2,'RESERVA','ACTIVO','PRIMARIO','a10eb6e1-9bdc-4fab-b3cb-c70307a2cca7','2026-08-09 04:29:45'),(3,'PARK-51059241-5321',1,3,3,'RESERVA','ACTIVO','PRIMARIO','0e9acce6-24fd-46e8-a186-705b23d1f5fd','2026-08-09 04:50:59'),(4,'PARK-BACKUP-52072043-1028',1,4,4,'RESERVA','ACTIVO','RESPALDO','494d517a-33fb-4e09-bae4-d2e7ef6873e5','2026-08-09 05:07:52'),(5,'PARK-BACKUP-54633269-9091',1,5,5,'RESERVA','ACTIVO','RESPALDO','c5d4dee9-a625-458c-b3bb-b560220b7d0d','2026-08-09 05:50:33'),(6,'PARK-BACKUP-54633288-4416',1,6,6,'RESERVA','ACTIVO','RESPALDO','f38619c8-b02a-4bc7-beb6-881a8fb1d29f','2026-08-09 05:50:33'),(7,'PARK-BACKUP-54633304-9773',1,7,7,'RESERVA','ACTIVO','RESPALDO','8a341c6c-6ada-4656-be02-bff2c4678989','2026-08-09 05:50:33'),(8,'PARK-BACKUP-54633319-7286',1,8,8,'RESERVA','ACTIVO','RESPALDO','17c952f0-e83b-4c84-96e7-a79123dfefa6','2026-08-09 05:50:33'),(9,'PARK-BACKUP-54633333-2850',1,9,9,'RESERVA','ACTIVO','RESPALDO','e75df4b6-23f3-4cd7-8aa0-706b5b638828','2026-08-09 05:50:33'),(10,'PARK-BACKUP-54710029-9863',1,10,10,'RESERVA','ACTIVO','RESPALDO','1f5b27ce-c56e-4389-9a30-5b7551649de6','2026-08-09 05:51:50'),(11,'PARK-BACKUP-15124134-3806',1,15,11,'RESERVA','ACTIVO','RESPALDO','78157983-916c-42aa-abc4-ca1f54dbf6b4','2026-08-09 22:38:44'),(12,'PARK-BACKUP-15470693-7676',1,16,12,'RESERVA','ACTIVO','RESPALDO','93a72713-4cb2-4333-be2a-46f323ee5c0c','2026-08-09 22:44:30'),(13,'PARK-96449707-4510',1,12,13,'RESERVA','ACTIVO','PRIMARIO','af5ecab1-328f-44b6-b84a-db7e5ef96331','2026-08-10 21:14:09'),(14,'PARK-BACKUP-02401464-5876',2,18,14,'RESERVA','ACTIVO','RESPALDO','79d24f03-82ea-4adc-bbae-0115502e2bb6','2026-08-10 22:53:21');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operaciones_replicacion`
--

LOCK TABLES `operaciones_replicacion` WRITE;
/*!40000 ALTER TABLE `operaciones_replicacion` DISABLE KEYS */;
-- Carga inicial: deja datos disponibles para correr la demo inmediatamente.
INSERT INTO `operaciones_replicacion` VALUES (1,'78157983-916c-42aa-abc4-ca1f54dbf6b4','ESPACIO_RESERVADO','{\"space\": {\"id\": 11, \"code\": \"B-01\", \"status\": \"RESERVADO\", \"parkingId\": 2, \"vehicleId\": 15}, \"movement\": {\"id\": 11, \"code\": \"PARK-BACKUP-15124134-3806\", \"type\": \"RESERVA\", \"status\": \"ACTIVO\", \"userId\": 1, \"spaceId\": 11, \"vehicleId\": 15, \"processedBy\": \"RESPALDO\"}}','APLICADA','2026-08-09 22:38:44','2026-08-09 22:38:44'),(2,'93a72713-4cb2-4333-be2a-46f323ee5c0c','ESPACIO_RESERVADO','{\"space\": {\"id\": 12, \"code\": \"B-02\", \"status\": \"RESERVADO\", \"parkingId\": 2, \"vehicleId\": 16}, \"movement\": {\"id\": 12, \"code\": \"PARK-BACKUP-15470693-7676\", \"type\": \"RESERVA\", \"status\": \"ACTIVO\", \"userId\": 1, \"spaceId\": 12, \"vehicleId\": 16, \"processedBy\": \"RESPALDO\"}}','APLICADA','2026-08-09 22:44:30','2026-08-09 22:46:28'),(3,'79d24f03-82ea-4adc-bbae-0115502e2bb6','ESPACIO_RESERVADO','{\"space\": {\"id\": 14, \"code\": \"B-04\", \"status\": \"RESERVADO\", \"parkingId\": 2, \"vehicleId\": 18}, \"movement\": {\"id\": 14, \"code\": \"PARK-BACKUP-02401464-5876\", \"type\": \"RESERVA\", \"status\": \"ACTIVO\", \"userId\": 2, \"spaceId\": 14, \"vehicleId\": 18, \"processedBy\": \"RESPALDO\"}}','APLICADA','2026-08-10 22:53:21','2026-08-10 22:53:21');
/*!40000 ALTER TABLE `operaciones_replicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operaciones_replicadas`
--

DROP TABLE IF EXISTS `operaciones_replicadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE `operaciones_replicadas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `operation_id` varchar(60) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `contenido` json NOT NULL,
  `fecha_aplicacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `operation_id` (`operation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operaciones_replicadas`
--

LOCK TABLES `operaciones_replicadas` WRITE;
/*!40000 ALTER TABLE `operaciones_replicadas` DISABLE KEYS */;
-- Carga inicial: deja datos disponibles para correr la demo inmediatamente.
INSERT INTO `operaciones_replicadas` VALUES (1,'7729e74f-a383-4342-abc2-c79e002c3243','ESPACIO_RESERVADO','{\"space\": {\"id\": 1, \"code\": \"A-01\", \"status\": \"RESERVADO\", \"parkingId\": 1, \"vehicleId\": 1}, \"movement\": {\"id\": 1, \"code\": \"PARK-48496263-6847\", \"type\": \"RESERVA\", \"status\": \"ACTIVO\", \"userId\": 1, \"spaceId\": 1, \"vehicleId\": 1, \"processedBy\": \"PRIMARIO\"}}','2026-08-09 04:08:16'),(2,'a10eb6e1-9bdc-4fab-b3cb-c70307a2cca7','ESPACIO_RESERVADO','{\"space\": {\"id\": 2, \"code\": \"A-02\", \"status\": \"RESERVADO\", \"parkingId\": 1, \"vehicleId\": 2}, \"movement\": {\"id\": 2, \"code\": \"PARK-49785037-1627\", \"type\": \"RESERVA\", \"status\": \"ACTIVO\", \"userId\": 1, \"spaceId\": 2, \"vehicleId\": 2, \"processedBy\": \"PRIMARIO\"}}','2026-08-09 04:29:45'),(3,'0e9acce6-24fd-46e8-a186-705b23d1f5fd','ESPACIO_RESERVADO','{\"space\": {\"id\": 3, \"code\": \"A-03\", \"status\": \"RESERVADO\", \"parkingId\": 1, \"vehicleId\": 3}, \"movement\": {\"id\": 3, \"code\": \"PARK-51059241-5321\", \"type\": \"RESERVA\", \"status\": \"ACTIVO\", \"userId\": 1, \"spaceId\": 3, \"vehicleId\": 3, \"processedBy\": \"PRIMARIO\"}}','2026-08-09 04:50:59'),(4,'af5ecab1-328f-44b6-b84a-db7e5ef96331','ESPACIO_RESERVADO','{\"space\": {\"id\": 13, \"code\": \"B-03\", \"status\": \"RESERVADO\", \"parkingId\": 2, \"vehicleId\": 12}, \"movement\": {\"id\": 13, \"code\": \"PARK-96449707-4510\", \"type\": \"RESERVA\", \"status\": \"ACTIVO\", \"userId\": 1, \"spaceId\": 13, \"vehicleId\": 12, \"processedBy\": \"PRIMARIO\"}}','2026-08-10 21:14:09');
/*!40000 ALTER TABLE `operaciones_replicadas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-12  3:18:17

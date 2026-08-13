

﻿-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: localhost    Database: parksafe_auth
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
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
-- Tabla del modelo persistente usada por los microservicios.
-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `correo` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('CLIENTE','ADMINISTRADOR') NOT NULL DEFAULT 'CLIENTE',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
-- Datos iniciales para poder demostrar el sistema sin carga manual previa.
-- Carga inicial: deja datos disponibles para correr la demo inmediatamente.
INSERT INTO `usuarios` VALUES (1,'Ignacio Garrido','ignacio','nacho@gmail.com','$2b$10$N/O4ADZOEh.vDL449Cng7erR2nYd0J3eQSnmP8Qz4YXwfKKRtZlpu','CLIENTE',1,'2026-08-09 03:55:56'),(2,'Andrea Navia','andrea','andrea@gmail.com','$2b$10$ejl/tXgbFiTapw39Per78OAri6lELsom7d.6JF/29UQZBEau6/k.e','CLIENTE',1,'2026-08-10 22:22:47');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehiculos`
--

DROP TABLE IF EXISTS `vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
-- Tabla central del dominio: guarda usuarios, vehiculos, espacios, movimientos o replicacion.
CREATE TABLE `vehiculos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `patente` varchar(10) NOT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `color` varchar(30) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patente` (`patente`),
  KEY `fk_vehiculo_usuario` (`usuario_id`),
  CONSTRAINT `fk_vehiculo_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehiculos`
--

LOCK TABLES `vehiculos` WRITE;
/*!40000 ALTER TABLE `vehiculos` DISABLE KEYS */;
-- Carga inicial: deja datos disponibles para correr la demo inmediatamente.
INSERT INTO `vehiculos` VALUES (1,1,'ABCD12','Toyota','Yaris','Blanco',1,'2026-08-09 03:56:46'),(2,1,'EFGH34','Hyundai','Accent','Negro',1,'2026-08-09 04:29:26'),(3,1,'IJKL56','Kia','Rio','Gris',1,'2026-08-09 04:50:35'),(4,1,'MNOP78','Suzuki','Swift','Azul',1,'2026-08-09 05:04:44'),(5,1,'QRST90','Toyota','Corolla','Rojo',1,'2026-08-09 05:50:12'),(6,1,'UVWX12','Kia','Morning','Blanco',1,'2026-08-09 05:50:12'),(7,1,'YZAB34','Hyundai','i10','Gris',1,'2026-08-09 05:50:12'),(8,1,'CDEF56','Nissan','Versa','Negro',1,'2026-08-09 05:50:12'),(9,1,'GHIJ78','Chevrolet','Sail','Azul',1,'2026-08-09 05:50:12'),(10,1,'KLMN10','Mazda','2','Rojo',1,'2026-08-09 05:51:13'),(11,1,'PQRS11','Ford','Fiesta','Negro',1,'2026-08-09 05:51:13'),(12,1,'TUVW12','Honda','Fit','Blanco',1,'2026-08-09 05:51:13'),(13,1,'XYZA13','Renault','Clio','Azul',1,'2026-08-09 05:51:13'),(14,1,'BCDE14','Peugeot','208','Gris',1,'2026-08-09 05:51:13'),(15,1,'FGHI15','Toyota','Raize','Blanco',1,'2026-08-09 22:37:48'),(16,1,'JKLM16','Nissan','March','Rojo',1,'2026-08-09 22:44:01'),(17,1,'PARK17','Mazda','CX-3','Gris',1,'2026-08-09 23:45:51'),(18,2,'LPRT24','Toyota','Corolla','Blanco',1,'2026-08-10 22:45:29');
/*!40000 ALTER TABLE `vehiculos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'parksafe_auth'
--

--
-- Dumping routines for database 'parksafe_auth'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-10 23:09:34

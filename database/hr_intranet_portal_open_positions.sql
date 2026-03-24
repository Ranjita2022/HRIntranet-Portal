-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: hr_intranet_portal
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `open_positions`
--

DROP TABLE IF EXISTS `open_positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `open_positions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requisition_id` varchar(50) DEFAULT NULL,
  `requisition_title` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `posting_date` date NOT NULL,
  `closing_date` date DEFAULT NULL,
  `description` text,
  `requirements` text,
  `status` varchar(20) NOT NULL DEFAULT 'OPEN',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `requisition_id` (`requisition_id`),
  KEY `idx_status` (`status`),
  KEY `idx_posting_date` (`posting_date`),
  KEY `idx_is_published` (`is_published`),
  KEY `idx_posting_date_published` (`posting_date` DESC,`is_published`),
  CONSTRAINT `open_positions_chk_1` CHECK ((`status` in (_utf8mb4'OPEN',_utf8mb4'CLOSED',_utf8mb4'ON_HOLD')))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `open_positions`
--

LOCK TABLES `open_positions` WRITE;
/*!40000 ALTER TABLE `open_positions` DISABLE KEYS */;
INSERT INTO `open_positions` VALUES (1,'FM001','Conference Finance Senior Manager','United States-New Jersey-Piscataway','2026-03-12',NULL,'','','ON_HOLD',1,'2026-03-15 17:59:02','2026-03-15 22:56:05'),(2,'E3480','Scrum Master ','United States-New Jersey-Piscataway','2026-03-12',NULL,'','','OPEN',1,'2026-03-15 17:59:02','2026-03-19 12:25:20'),(3,'E6088','Data Governance Analyst ','United States-New Jersey-Piscataway','2026-03-11',NULL,'','','OPEN',1,'2026-03-15 17:59:02','2026-03-19 12:25:29'),(5,'SG001','Director, Strategic Giving','United States-New Jersey-Piscataway','2026-03-10',NULL,'','','CLOSED',1,'2026-03-15 17:59:02','2026-03-15 22:15:10'),(6,'SI001','Summer intern ','Bangalore, India','2026-03-16',NULL,'','','OPEN',1,'2026-03-15 22:51:26','2026-03-15 22:51:26'),(8,'SI002','Internal Audit Analyst','Bangalore, India','2026-03-16',NULL,'','','OPEN',1,'2026-03-15 22:54:02','2026-03-15 22:54:02'),(9,'MI003','Marketing intern','Bangalore, India','2026-03-16',NULL,'','','OPEN',1,'2026-03-15 22:57:35','2026-03-15 22:57:35'),(10,'IT004','IT intern','Bangalore, India','2026-03-16',NULL,'','','OPEN',1,'2026-03-15 23:01:48','2026-03-15 23:01:48');
/*!40000 ALTER TABLE `open_positions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 16:42:14

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
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('GENERAL','URGENT','BREAKING','POLICY','EVENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GENERAL',
  `title` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image_id` int DEFAULT NULL,
  `publish_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `priority` int DEFAULT '0',
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_publish_date` (`publish_date`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_priority` (`priority`),
  KEY `image_id` (`image_id`),
  KEY `idx_announcements_active_publish` (`is_active`,`publish_date`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,'GENERAL','Q1 Town Hall Meeting','Join us for the quarterly town hall on March 15th at 2 PM in the main conference room.',NULL,'2026-02-23',NULL,1,5,NULL,'2026-02-27 09:50:24','2026-03-23 09:28:23'),(2,'POLICY','Updated Remote Work Policy','New remote work guidelines are now available on the HR portal. Please review by end of month.',NULL,'2026-03-24',NULL,1,8,NULL,'2026-02-27 09:50:24','2026-03-23 23:56:19'),(3,'EVENT','Annual Company Picnic','Save the date! Our annual company picnic will be held on July 20th at Central Park.',NULL,'2026-06-01',NULL,1,3,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(4,'GENERAL','New Parking Policy','Updated parking assignments effective March 1st. Check your email for your new parking space number.',NULL,'2026-02-15',NULL,1,4,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(5,'URGENT','Building Maintenance This Weekend','HVAC maintenance will affect the 3rd and 4th floors this Saturday. Please plan accordingly.',NULL,'2026-03-24',NULL,1,7,NULL,'2026-02-27 09:50:24','2026-03-23 23:56:27'),(13,'BREAKING','CEO Town Hall Today at 3 PM - All employees invited to join virtually or in main auditorium','',NULL,'2026-03-24',NULL,1,10,NULL,'2026-02-27 09:50:24','2026-03-23 23:47:39'),(15,'GENERAL','Company Annual Picnic','Join us for food, games, and team building!',NULL,'2026-03-24',NULL,1,1,NULL,'2026-03-01 03:26:23','2026-03-23 23:57:04'),(16,'GENERAL','Conducting picnic for all IEEE staffs','Enjoy the day with meal.',3,'2026-03-13','2026-03-14',0,0,'admin','2026-03-12 23:01:28','2026-03-17 23:48:29'),(17,'GENERAL','Conducting picnic for all IEEE staffs','',NULL,'2026-03-23',NULL,1,0,'admin','2026-03-23 03:47:56','2026-03-23 03:47:56'),(18,'EVENT','ECHO Session','',NULL,'2026-04-21',NULL,1,0,'admin','2026-03-23 23:38:04','2026-03-23 23:38:04'),(19,'GENERAL','Fire Extinguisher Drill','',NULL,'2026-03-24',NULL,1,0,'admin','2026-03-23 23:57:56','2026-03-23 23:57:56');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 16:42:16

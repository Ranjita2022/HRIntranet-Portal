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
-- Table structure for table `quick_links`
--

DROP TABLE IF EXISTS `quick_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quick_links` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `open_in_new_tab` tinyint(1) DEFAULT '1',
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_display_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quick_links`
--

LOCK TABLES `quick_links` WRITE;
/*!40000 ALTER TABLE `quick_links` DISABLE KEYS */;
INSERT INTO `quick_links` VALUES (1,'Company Email','https://www.google.com/search?q=ieee-india%40ieee.org&rlz=1C1GCEA_en-GBIN1202IN1202&oq=ieee+company+email&gs_lcrp=EgZjaHJvbWUqBwgBECEYoAEyBggAEEUYOTIHCAEQIRigATIHCAIQIRigATIHCAMQIRigATIHCAQQIRifBTIHCAUQIRifBTIHCAYQIRifBTIHCAcQIRifBTIHCAgQIRiPAtIBCDg3ODJqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8&mstk=AUtExfCINGujDnY0ir2_eL0GdKb0zINGuvn5st9YQCGEV8aKfiuxyV0ZxwpJ-2IGakpMQ2culPeOTJf0DBv-U0AX8I9F-P-wyU36dOs0VCQ6RQ7xcoS83tDkp-mJLir0WNNEL5zrwrXIxpR0m2hniOR62tEgfJsUCZp2sUxxKOEqSUpVvDf3p8KNlhmPOYy7b9Zu43xw&csui=3&ved=2ahUKEwik56_67LeTAxXOa2wGHX6UAoYQgK4QegQIARAD','Access your company email','bi-envelope-fill','tools',1,1,1,NULL,'2026-02-27 09:50:24','2026-03-24 00:27:50'),(2,'Employee Portal','https://portal.company.com','Access HR and benefits portal','bi-people-fill','hr',2,1,1,NULL,'2026-02-27 09:50:24','2026-03-24 00:31:37'),(3,'IT Help Desk','https://helpdesk.ieee.org/','Submit IT support tickets','bi-headset','support',3,1,1,NULL,'2026-02-27 09:50:24','2026-03-24 01:01:41'),(4,'Time Tracking','https://timesheet.company.com','Log your work hours','bi-clock-history','tools',4,1,1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(6,'Benefits Portal','https://benefits.company.com','Manage your benefits','bi-heart-pulse-fill','hr',6,1,1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(7,'Learning Hub','https://iln.ieee.org/public/TrainingCatalog.aspx','Training and development resources','bi-book-fill','resources',7,1,1,NULL,'2026-02-27 09:50:24','2026-03-24 00:59:05'),(8,'Payroll','https://payroll.company.com','View pay stubs and tax documents','bi-cash-stack','hr',8,1,1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(9,'IEEE Company Website','https://india.ieee.org/','Access your IEEE India office website','bi-bank','Website',0,1,1,'admin','2026-03-09 04:39:37','2026-03-24 01:00:59'),(10,'IEEE India Operations','https://drive.google.com/drive/folders/1cO4Ua2agWrurbcdlwom4tIAciDpd5Fgh?usp=sharing',NULL,'bi-file-earmark-text-fill',NULL,0,1,1,'admin','2026-03-24 00:02:01','2026-03-24 01:00:23'),(12,'JOHO app','https://people.zoho.in/',NULL,'bi-box-arrow-in-right',NULL,0,1,1,'admin','2026-03-24 00:16:55','2026-03-24 01:02:18');
/*!40000 ALTER TABLE `quick_links` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 16:38:26

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
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int DEFAULT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_table_name` (`table_name`),
  CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
INSERT INTO `audit_log` VALUES (1,1,'UPDATE','employees',5,'{\"id\": 5, \"email\": \"sarah.lee@company.com\", \"phone\": \"555-0105\", \"status\": \"ACTIVE\", \"lastName\": \"Lee\", \"position\": \"HR Manager\", \"firstName\": \"Sarahaaaaaa\", \"department\": \"HR\"}','{\"id\": 5, \"email\": \"sarah.lee@company.com\", \"phone\": \"555-0105\", \"status\": \"ACTIVE\", \"lastName\": \"Lee\", \"position\": \"HR Manager\", \"firstName\": \"Sarah\", \"department\": \"HR\"}','192.168.1.100','2026-02-28 05:51:22'),(2,1,'UPDATE','employees',3,'{\"id\": 3, \"email\": \"michael.chen@company.com\", \"phone\": \"555-0103\", \"status\": \"ACTIVE\", \"lastName\": \"Chen\", \"position\": \"Senior Developer\", \"firstName\": \"Michael\", \"department\": \"IT\"}','{\"id\": 3, \"email\": \"michael.chen@company.com\", \"phone\": \"555-9999\", \"status\": \"ACTIVE\", \"lastName\": \"Chen\", \"position\": \"Senior Developer\", \"firstName\": \"Michael\", \"department\": \"IT\"}','192.168.1.100','2026-02-28 04:51:22'),(3,1,'UPDATE','employees',2,'{\"id\": 2, \"email\": \"jane.smith@company.com\", \"phone\": \"555-0102\", \"status\": \"ACTIVE\", \"lastName\": \"Smith\", \"position\": \"HR Manager\", \"firstName\": \"Jane\", \"department\": \"HR\"}','{\"id\": 2, \"email\": \"jane.smith@company.com\", \"phone\": \"555-0102\", \"status\": \"ACTIVE\", \"lastName\": \"Smith\", \"position\": \"Finance Manager\", \"firstName\": \"Jane\", \"department\": \"Finance\"}','192.168.1.101','2026-02-28 02:51:22'),(4,1,'UPDATE','announcements',1,'{\"id\": 1, \"type\": \"EVENT\", \"title\": \"Company Anniversary\", \"status\": \"ACTIVE\", \"description\": \"Join us in celebrating our 10th anniversary\"}','{\"id\": 1, \"type\": \"EVENT\", \"title\": \"Company Anniversary Celebration\", \"status\": \"ACTIVE\", \"description\": \"Join us in celebrating our 10th anniversary with special events and prizes!\"}','192.168.1.100','2026-02-27 07:51:22'),(5,1,'UPDATE','emergency_contacts',1,'{\"id\": 1, \"type\": \"SECURITY\", \"phone\": \"555-1000\", \"status\": \"ACTIVE\", \"contactName\": \"Security Office\"}','{\"id\": 1, \"type\": \"SECURITY\", \"phone\": \"555-1000\", \"status\": \"ACTIVE\", \"contactName\": \"24/7 Security Office\"}','192.168.1.100','2026-02-27 07:51:22'),(6,1,'UPDATE','holidays',1,'{\"id\": 1, \"date\": \"2026-01-01\", \"name\": \"New Year\'s Day\", \"type\": \"PUBLIC\", \"status\": \"ACTIVE\"}','{\"id\": 1, \"date\": \"2026-01-02\", \"name\": \"New Year\'s Day\", \"type\": \"PUBLIC\", \"status\": \"ACTIVE\"}','192.168.1.101','2026-02-26 07:51:22'),(7,1,'UPDATE','employees',7,'{\"id\": 7, \"email\": \"david.brown@company.com\", \"phone\": \"555-0107\", \"status\": \"ACTIVE\", \"lastName\": \"Brown\", \"position\": \"Sales Executive\", \"firstName\": \"David\", \"department\": \"Sales\"}','{\"id\": 7, \"email\": \"david.brown@company.com\", \"phone\": \"555-0107\", \"status\": \"INACTIVE\", \"lastName\": \"Brown\", \"position\": \"Sales Executive\", \"firstName\": \"David\", \"department\": \"Sales\"}','192.168.1.100','2026-02-25 07:51:22'),(8,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 2}','0:0:0:0:0:0:0:1','2026-03-01 00:16:07'),(9,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 1, \"updatedCount\": 0}','0:0:0:0:0:0:0:1','2026-03-01 00:25:53'),(10,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 00:30:45'),(11,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 00:30:48'),(12,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 00:35:26'),(13,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 00:39:01'),(14,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 01:01:59'),(15,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 01:21:55'),(16,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 01:22:06'),(17,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-02 22:23:43');
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 16:38:24

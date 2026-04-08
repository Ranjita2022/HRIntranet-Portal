CREATE DATABASE  IF NOT EXISTS `hr_intranet_portal` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `hr_intranet_portal`;
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
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('SUPER_ADMIN','ADMIN','HR_STAFF') COLLATE utf8mb4_unicode_ci DEFAULT 'HR_STAFF',
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'admin','$2a$10$WtNpTzRWoeubxKxEVnL.Z.I93SW25zvj5pCZij58Qk8XW66saSu/O','System Administrator','admin@company.com','SUPER_ADMIN',1,'2026-04-07 04:28:48','2026-02-27 09:50:24','2026-04-07 04:28:48'),(2,'hradmin','$2a$10$XjJaAuijME0tvZfaHMr2FudUKYr6mCyaxVe.9fRD6rLb/U/w68iQG','HR Administrator','hradmin@company.com','ADMIN',1,'2026-03-02 22:26:33','2026-03-02 08:56:17','2026-03-02 22:26:33'),(3,'hrstaff','$2a$10$qgQwXoOo4u59vIdoLiCOourwtPRWOxChtFw7zLmJRc5jS8Ro3SPp2','HR Staff Member','hrstaff@company.com','HR_STAFF',1,'2026-03-02 05:20:17','2026-03-02 08:56:17','2026-03-02 05:20:17');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('GENERAL','TRAINING','URGENT','BREAKING','POLICY','EVENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GENERAL',
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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,'GENERAL','Q1 Town Hall Meeting','Join us for the quarterly town hall on March 15th at 2 PM in the main conference room.',NULL,'2026-02-23','2026-03-30',1,5,NULL,'2026-02-27 09:50:24','2026-03-31 05:58:47'),(3,'EVENT','Annual Company Picnic','Save the date! Our annual company picnic will be held on July 20th at Central Park.',NULL,'2026-06-01',NULL,1,3,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(16,'GENERAL','Conducting picnic for all IEEE staffs','Enjoy the day with meal.',NULL,'2026-03-31',NULL,1,0,'admin','2026-03-12 23:01:28','2026-03-31 05:57:21'),(17,'GENERAL','Conducting picnic for all IEEE staffs','',NULL,'2026-01-06',NULL,1,0,'admin','2026-03-23 03:47:56','2026-03-31 05:54:23'),(18,'EVENT','ECHO Session','Encourage everyone to participate in the session.',NULL,'2026-04-21',NULL,1,0,'admin','2026-03-23 23:38:04','2026-04-02 01:01:14'),(20,'TRAINING','Digital Personal Data Protection Act (DPDPA)- India 2026','All IEEE staff in India are required to complete the following two mandatory trainings by 3 April 2026',NULL,'2026-03-31','2026-04-03',1,0,'admin','2026-03-31 05:18:59','2026-03-31 05:18:59'),(21,'TRAINING','Data Privacy at IEEE-India 2026','All IEEE staff in India are required to complete the following two mandatory trainings by 3 April 2026',NULL,'2026-03-31','2026-04-03',1,0,'admin','2026-03-31 05:41:54','2026-03-31 05:41:54'),(23,'GENERAL','Annual meet','',NULL,'2026-04-01',NULL,1,0,'admin','2026-04-01 06:12:43','2026-04-01 06:12:43'),(24,'EVENT','Workshop on \"Grooming, Global Etiquette, Networking & Decision-Making Excellence.\"','',NULL,'2026-04-16','2026-04-16',1,0,'admin','2026-04-07 04:43:27','2026-04-07 04:52:16'),(25,'GENERAL','Bring your kid to work','Join us for a adventure and learning!!',65,'2026-04-07','2026-04-23',1,0,'admin','2026-04-07 04:52:55','2026-04-07 05:03:40');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
INSERT INTO `audit_log` VALUES (1,1,'UPDATE','employees',5,'{\"id\": 5, \"email\": \"sarah.lee@company.com\", \"phone\": \"555-0105\", \"status\": \"ACTIVE\", \"lastName\": \"Lee\", \"position\": \"HR Manager\", \"firstName\": \"Sarahaaaaaa\", \"department\": \"HR\"}','{\"id\": 5, \"email\": \"sarah.lee@company.com\", \"phone\": \"555-0105\", \"status\": \"ACTIVE\", \"lastName\": \"Lee\", \"position\": \"HR Manager\", \"firstName\": \"Sarah\", \"department\": \"HR\"}','192.168.1.100','2026-02-28 05:51:22'),(2,1,'UPDATE','employees',3,'{\"id\": 3, \"email\": \"michael.chen@company.com\", \"phone\": \"555-0103\", \"status\": \"ACTIVE\", \"lastName\": \"Chen\", \"position\": \"Senior Developer\", \"firstName\": \"Michael\", \"department\": \"IT\"}','{\"id\": 3, \"email\": \"michael.chen@company.com\", \"phone\": \"555-9999\", \"status\": \"ACTIVE\", \"lastName\": \"Chen\", \"position\": \"Senior Developer\", \"firstName\": \"Michael\", \"department\": \"IT\"}','192.168.1.100','2026-02-28 04:51:22'),(3,1,'UPDATE','employees',2,'{\"id\": 2, \"email\": \"jane.smith@company.com\", \"phone\": \"555-0102\", \"status\": \"ACTIVE\", \"lastName\": \"Smith\", \"position\": \"HR Manager\", \"firstName\": \"Jane\", \"department\": \"HR\"}','{\"id\": 2, \"email\": \"jane.smith@company.com\", \"phone\": \"555-0102\", \"status\": \"ACTIVE\", \"lastName\": \"Smith\", \"position\": \"Finance Manager\", \"firstName\": \"Jane\", \"department\": \"Finance\"}','192.168.1.101','2026-02-28 02:51:22'),(4,1,'UPDATE','announcements',1,'{\"id\": 1, \"type\": \"EVENT\", \"title\": \"Company Anniversary\", \"status\": \"ACTIVE\", \"description\": \"Join us in celebrating our 10th anniversary\"}','{\"id\": 1, \"type\": \"EVENT\", \"title\": \"Company Anniversary Celebration\", \"status\": \"ACTIVE\", \"description\": \"Join us in celebrating our 10th anniversary with special events and prizes!\"}','192.168.1.100','2026-02-27 07:51:22'),(5,1,'UPDATE','emergency_contacts',1,'{\"id\": 1, \"type\": \"SECURITY\", \"phone\": \"555-1000\", \"status\": \"ACTIVE\", \"contactName\": \"Security Office\"}','{\"id\": 1, \"type\": \"SECURITY\", \"phone\": \"555-1000\", \"status\": \"ACTIVE\", \"contactName\": \"24/7 Security Office\"}','192.168.1.100','2026-02-27 07:51:22'),(6,1,'UPDATE','holidays',1,'{\"id\": 1, \"date\": \"2026-01-01\", \"name\": \"New Year\'s Day\", \"type\": \"PUBLIC\", \"status\": \"ACTIVE\"}','{\"id\": 1, \"date\": \"2026-01-02\", \"name\": \"New Year\'s Day\", \"type\": \"PUBLIC\", \"status\": \"ACTIVE\"}','192.168.1.101','2026-02-26 07:51:22'),(7,1,'UPDATE','employees',7,'{\"id\": 7, \"email\": \"david.brown@company.com\", \"phone\": \"555-0107\", \"status\": \"ACTIVE\", \"lastName\": \"Brown\", \"position\": \"Sales Executive\", \"firstName\": \"David\", \"department\": \"Sales\"}','{\"id\": 7, \"email\": \"david.brown@company.com\", \"phone\": \"555-0107\", \"status\": \"INACTIVE\", \"lastName\": \"Brown\", \"position\": \"Sales Executive\", \"firstName\": \"David\", \"department\": \"Sales\"}','192.168.1.100','2026-02-25 07:51:22'),(8,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 2}','0:0:0:0:0:0:0:1','2026-03-01 00:16:07'),(9,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 1, \"updatedCount\": 0}','0:0:0:0:0:0:0:1','2026-03-01 00:25:53'),(10,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 00:30:45'),(11,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 00:30:48'),(12,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 00:35:26'),(13,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 00:39:01'),(14,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 01:01:59'),(15,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 01:21:55'),(16,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-01 01:22:06'),(17,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-02 22:23:43'),(18,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 1}','0:0:0:0:0:0:0:1','2026-03-30 03:35:56'),(19,1,'DELETE','gallery_folders',3,'{\"filename\": \"image-1.jpg\", \"photoCount\": 2}','{\"filename\": \"image-1.jpg\", \"photoCount\": 1}','0:0:0:0:0:0:0:1','2026-03-30 03:45:11'),(20,1,'DELETE','announcement_image',16,NULL,NULL,'0:0:0:0:0:0:0:1','2026-03-31 05:57:21'),(21,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-43.jpg\", \"photoCount\": 45}','{\"filename\": \"image-43.jpg\", \"photoCount\": 44}','0:0:0:0:0:0:0:1','2026-04-01 04:12:47'),(22,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-11.jpg\", \"photoCount\": 44}','{\"filename\": \"image-11.jpg\", \"photoCount\": 43}','0:0:0:0:0:0:0:1','2026-04-01 04:12:52'),(23,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-13.jpg\", \"photoCount\": 43}','{\"filename\": \"image-13.jpg\", \"photoCount\": 42}','0:0:0:0:0:0:0:1','2026-04-01 04:13:00'),(24,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-10.jpg\", \"photoCount\": 42}','{\"filename\": \"image-10.jpg\", \"photoCount\": 41}','0:0:0:0:0:0:0:1','2026-04-01 04:14:35'),(25,1,'SCAN','gallery_folders',NULL,NULL,'{\"newCount\": 0, \"updatedCount\": 5}','0:0:0:0:0:0:0:1','2026-04-01 04:15:46'),(26,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-15.jpg\", \"photoCount\": 39}','{\"filename\": \"image-15.jpg\", \"photoCount\": 38}','0:0:0:0:0:0:0:1','2026-04-01 04:16:42'),(27,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-14.jpg\", \"photoCount\": 39}','{\"filename\": \"image-14.jpg\", \"photoCount\": 38}','0:0:0:0:0:0:0:1','2026-04-01 04:16:42'),(28,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-1.jpg\", \"photoCount\": 39}','{\"filename\": \"image-1.jpg\", \"photoCount\": 38}','0:0:0:0:0:0:0:1','2026-04-01 04:16:42'),(29,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-20.jpg\", \"photoCount\": 38}','{\"filename\": \"image-20.jpg\", \"photoCount\": 37}','0:0:0:0:0:0:0:1','2026-04-01 04:16:42'),(30,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-2.jpg\", \"photoCount\": 37}','{\"filename\": \"image-2.jpg\", \"photoCount\": 36}','0:0:0:0:0:0:0:1','2026-04-01 04:16:42'),(31,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-23.jpg\", \"photoCount\": 36}','{\"filename\": \"image-23.jpg\", \"photoCount\": 35}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(32,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-28.jpg\", \"photoCount\": 34}','{\"filename\": \"image-28.jpg\", \"photoCount\": 33}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(33,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-24.jpg\", \"photoCount\": 34}','{\"filename\": \"image-24.jpg\", \"photoCount\": 33}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(34,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-27.jpg\", \"photoCount\": 33}','{\"filename\": \"image-27.jpg\", \"photoCount\": 32}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(35,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-29.jpg\", \"photoCount\": 32}','{\"filename\": \"image-29.jpg\", \"photoCount\": 31}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(36,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-3.jpg\", \"photoCount\": 31}','{\"filename\": \"image-3.jpg\", \"photoCount\": 30}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(37,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-33.jpg\", \"photoCount\": 30}','{\"filename\": \"image-33.jpg\", \"photoCount\": 29}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(38,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-32.jpg\", \"photoCount\": 29}','{\"filename\": \"image-32.jpg\", \"photoCount\": 28}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(39,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-31.jpg\", \"photoCount\": 28}','{\"filename\": \"image-31.jpg\", \"photoCount\": 27}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(40,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-30.jpg\", \"photoCount\": 27}','{\"filename\": \"image-30.jpg\", \"photoCount\": 26}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(41,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-34.jpg\", \"photoCount\": 26}','{\"filename\": \"image-34.jpg\", \"photoCount\": 25}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(42,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-35.jpg\", \"photoCount\": 25}','{\"filename\": \"image-35.jpg\", \"photoCount\": 24}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(43,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-36.jpg\", \"photoCount\": 24}','{\"filename\": \"image-36.jpg\", \"photoCount\": 23}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(44,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-37.jpg\", \"photoCount\": 23}','{\"filename\": \"image-37.jpg\", \"photoCount\": 22}','0:0:0:0:0:0:0:1','2026-04-01 04:16:43'),(45,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-1.jpg\", \"photoCount\": 52}','{\"filename\": \"image-1.jpg\", \"photoCount\": 51}','0:0:0:0:0:0:0:1','2026-04-01 04:17:23'),(46,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-13.jpg\", \"photoCount\": 52}','{\"filename\": \"image-13.jpg\", \"photoCount\": 51}','0:0:0:0:0:0:0:1','2026-04-01 04:17:23'),(47,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-12.jpg\", \"photoCount\": 52}','{\"filename\": \"image-12.jpg\", \"photoCount\": 51}','0:0:0:0:0:0:0:1','2026-04-01 04:17:23'),(48,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-14.jpg\", \"photoCount\": 51}','{\"filename\": \"image-14.jpg\", \"photoCount\": 50}','0:0:0:0:0:0:0:1','2026-04-01 04:17:23'),(49,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-15.jpg\", \"photoCount\": 50}','{\"filename\": \"image-15.jpg\", \"photoCount\": 49}','0:0:0:0:0:0:0:1','2026-04-01 04:17:23'),(50,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-16.jpg\", \"photoCount\": 49}','{\"filename\": \"image-16.jpg\", \"photoCount\": 48}','0:0:0:0:0:0:0:1','2026-04-01 04:17:23'),(51,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-17.jpg\", \"photoCount\": 48}','{\"filename\": \"image-17.jpg\", \"photoCount\": 47}','0:0:0:0:0:0:0:1','2026-04-01 04:17:23'),(52,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-2.jpg\", \"photoCount\": 47}','{\"filename\": \"image-2.jpg\", \"photoCount\": 46}','0:0:0:0:0:0:0:1','2026-04-01 04:17:23'),(53,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-22.jpg\", \"photoCount\": 46}','{\"filename\": \"image-22.jpg\", \"photoCount\": 45}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(54,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-23.jpg\", \"photoCount\": 45}','{\"filename\": \"image-23.jpg\", \"photoCount\": 44}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(55,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-24.jpg\", \"photoCount\": 44}','{\"filename\": \"image-24.jpg\", \"photoCount\": 43}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(56,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-25.jpg\", \"photoCount\": 43}','{\"filename\": \"image-25.jpg\", \"photoCount\": 42}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(57,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-26.jpg\", \"photoCount\": 42}','{\"filename\": \"image-26.jpg\", \"photoCount\": 41}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(58,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-27.jpg\", \"photoCount\": 41}','{\"filename\": \"image-27.jpg\", \"photoCount\": 40}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(59,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-28.jpg\", \"photoCount\": 40}','{\"filename\": \"image-28.jpg\", \"photoCount\": 39}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(60,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-29.jpg\", \"photoCount\": 39}','{\"filename\": \"image-29.jpg\", \"photoCount\": 38}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(61,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-30.jpg\", \"photoCount\": 38}','{\"filename\": \"image-30.jpg\", \"photoCount\": 37}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(62,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-31.jpg\", \"photoCount\": 37}','{\"filename\": \"image-31.jpg\", \"photoCount\": 36}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(63,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-32.jpg\", \"photoCount\": 36}','{\"filename\": \"image-32.jpg\", \"photoCount\": 35}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(64,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-33.jpg\", \"photoCount\": 35}','{\"filename\": \"image-33.jpg\", \"photoCount\": 34}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(65,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-34.jpg\", \"photoCount\": 34}','{\"filename\": \"image-34.jpg\", \"photoCount\": 33}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(66,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-36.jpg\", \"photoCount\": 33}','{\"filename\": \"image-36.jpg\", \"photoCount\": 32}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(67,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-37.jpg\", \"photoCount\": 32}','{\"filename\": \"image-37.jpg\", \"photoCount\": 31}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(68,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-38.jpg\", \"photoCount\": 31}','{\"filename\": \"image-38.jpg\", \"photoCount\": 30}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(69,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-39.jpg\", \"photoCount\": 30}','{\"filename\": \"image-39.jpg\", \"photoCount\": 29}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(70,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-4.jpg\", \"photoCount\": 29}','{\"filename\": \"image-4.jpg\", \"photoCount\": 28}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(71,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-40.jpg\", \"photoCount\": 28}','{\"filename\": \"image-40.jpg\", \"photoCount\": 27}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(72,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-41.jpg\", \"photoCount\": 27}','{\"filename\": \"image-41.jpg\", \"photoCount\": 26}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(73,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-44.jpg\", \"photoCount\": 26}','{\"filename\": \"image-44.jpg\", \"photoCount\": 25}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(74,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-45.jpg\", \"photoCount\": 25}','{\"filename\": \"image-45.jpg\", \"photoCount\": 24}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(75,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-46.jpg\", \"photoCount\": 24}','{\"filename\": \"image-46.jpg\", \"photoCount\": 23}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(76,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-47.jpg\", \"photoCount\": 23}','{\"filename\": \"image-47.jpg\", \"photoCount\": 22}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(77,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-48.jpg\", \"photoCount\": 22}','{\"filename\": \"image-48.jpg\", \"photoCount\": 21}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(78,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-49.jpg\", \"photoCount\": 21}','{\"filename\": \"image-49.jpg\", \"photoCount\": 20}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(79,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-50.jpg\", \"photoCount\": 20}','{\"filename\": \"image-50.jpg\", \"photoCount\": 19}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(80,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-51.jpg\", \"photoCount\": 19}','{\"filename\": \"image-51.jpg\", \"photoCount\": 18}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(81,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-52.jpg\", \"photoCount\": 18}','{\"filename\": \"image-52.jpg\", \"photoCount\": 17}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(82,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-53.jpg\", \"photoCount\": 17}','{\"filename\": \"image-53.jpg\", \"photoCount\": 16}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(83,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-54.jpg\", \"photoCount\": 16}','{\"filename\": \"image-54.jpg\", \"photoCount\": 15}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(84,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-8.jpg\", \"photoCount\": 15}','{\"filename\": \"image-8.jpg\", \"photoCount\": 14}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(85,1,'DELETE','gallery_folders',2,'{\"filename\": \"image-9.jpg\", \"photoCount\": 14}','{\"filename\": \"image-9.jpg\", \"photoCount\": 13}','0:0:0:0:0:0:0:1','2026-04-01 04:17:24'),(86,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-12.jpg\", \"photoCount\": 21}','{\"filename\": \"image-12.jpg\", \"photoCount\": 20}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(87,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-16.jpg\", \"photoCount\": 21}','{\"filename\": \"image-16.jpg\", \"photoCount\": 20}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(88,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-17.jpg\", \"photoCount\": 20}','{\"filename\": \"image-17.jpg\", \"photoCount\": 19}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(89,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-18.jpg\", \"photoCount\": 19}','{\"filename\": \"image-18.jpg\", \"photoCount\": 18}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(90,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-19.jpg\", \"photoCount\": 18}','{\"filename\": \"image-19.jpg\", \"photoCount\": 17}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(91,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-22.jpg\", \"photoCount\": 17}','{\"filename\": \"image-22.jpg\", \"photoCount\": 16}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(92,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-26.jpg\", \"photoCount\": 16}','{\"filename\": \"image-26.jpg\", \"photoCount\": 15}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(93,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-4.jpg\", \"photoCount\": 14}','{\"filename\": \"image-4.jpg\", \"photoCount\": 13}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(94,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-38.jpg\", \"photoCount\": 14}','{\"filename\": \"image-38.jpg\", \"photoCount\": 13}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(95,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-42.jpg\", \"photoCount\": 12}','{\"filename\": \"image-42.jpg\", \"photoCount\": 11}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(96,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-40.jpg\", \"photoCount\": 12}','{\"filename\": \"image-40.jpg\", \"photoCount\": 11}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(97,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-5.jpg\", \"photoCount\": 11}','{\"filename\": \"image-5.jpg\", \"photoCount\": 10}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(98,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-6.jpg\", \"photoCount\": 10}','{\"filename\": \"image-6.jpg\", \"photoCount\": 9}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(99,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-7.jpg\", \"photoCount\": 9}','{\"filename\": \"image-7.jpg\", \"photoCount\": 8}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(100,1,'DELETE','gallery_folders',1,'{\"filename\": \"image-8.jpg\", \"photoCount\": 8}','{\"filename\": \"image-8.jpg\", \"photoCount\": 7}','0:0:0:0:0:0:0:1','2026-04-01 04:17:59'),(101,1,'DELETE','gallery_folders',4,'{\"filename\": \"image-16.jpg\", \"photoCount\": 16}','{\"filename\": \"image-16.jpg\", \"photoCount\": 15}','0:0:0:0:0:0:0:1','2026-04-01 04:18:10'),(102,1,'DELETE','gallery_folders',5,'{\"filename\": \"image-4.jpg\", \"photoCount\": 3}','{\"filename\": \"image-4.jpg\", \"photoCount\": 2}','0:0:0:0:0:0:0:1','2026-04-02 00:16:21'),(103,1,'DELETE','gallery_folders',5,'{\"filename\": \"image-3.jpg\", \"photoCount\": 3}','{\"filename\": \"image-3.jpg\", \"photoCount\": 2}','0:0:0:0:0:0:0:1','2026-04-02 00:16:21'),(104,1,'TOGGLE','gallery_folders',5,'{\"isActive\": true}','{\"isActive\": false}','0:0:0:0:0:0:0:1','2026-04-02 00:18:14'),(105,1,'TOGGLE','gallery_folders',18,'{\"isActive\": true}','{\"isActive\": false}','0:0:0:0:0:0:0:1','2026-04-02 00:19:21'),(106,1,'TOGGLE','gallery_folders',5,'{\"isActive\": false}','{\"isActive\": true}','0:0:0:0:0:0:0:1','2026-04-02 00:22:34'),(107,1,'TOGGLE','gallery_folders',18,'{\"isActive\": false}','{\"isActive\": true}','0:0:0:0:0:0:0:1','2026-04-02 00:26:14');
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carousel_slides`
--

DROP TABLE IF EXISTS `carousel_slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carousel_slides` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_id` int DEFAULT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_is_active` (`is_active`),
  KEY `image_id` (`image_id`),
  KEY `idx_carousel_active_order` (`is_active`,`display_order`),
  CONSTRAINT `carousel_slides_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carousel_slides`
--

LOCK TABLES `carousel_slides` WRITE;
/*!40000 ALTER TABLE `carousel_slides` DISABLE KEYS */;
INSERT INTO `carousel_slides` VALUES (1,'Welcome to 2026!','Celebrating another amazing year together as a team',NULL,'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop',1,0,NULL,'2026-02-27 09:50:24','2026-04-07 23:40:11'),(3,'Innovation Award 2026','Congratulations to our R&D team for winning the Innovation Excellence Award',NULL,'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',3,0,NULL,'2026-02-27 09:50:24','2026-04-02 00:45:53'),(11,'Annual IEEE picnic','Enjoyed the day and had a meal',14,NULL,4,0,'admin','2026-03-24 04:14:34','2026-04-02 00:45:37'),(12,'ECHO Session','Impactful session',15,NULL,5,0,'admin','2026-03-24 05:00:23','2026-04-07 23:40:20'),(13,'Q1 Townhall Meeting','Great meeting with all departments',16,NULL,2,1,'admin','2026-03-24 05:02:41','2026-04-02 00:45:03'),(16,'Womens Day Celebration','Celebrated Women’s Day 2026 by honoring the strength, resilience, and brilliance of women with heartfelt messages.',20,NULL,4,0,'admin','2026-04-01 04:40:50','2026-04-07 23:40:04'),(17,'IEEE SA invited by CEEW','Great discussion on climate-smart agriculture, and water security addressing the convergence of technology, policy and the end community.',21,NULL,3,1,'admin','2026-04-01 04:44:39','2026-04-02 00:45:15');
/*!40000 ALTER TABLE `carousel_slides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emergency_contacts`
--

DROP TABLE IF EXISTS `emergency_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emergency_contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('SECURITY','IT_SUPPORT','HR','MEDICAL','FACILITY','GENERAL','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `is_emergency` tinyint(1) DEFAULT '0',
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_is_emergency` (`is_emergency`),
  KEY `idx_display_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emergency_contacts`
--

LOCK TABLES `emergency_contacts` WRITE;
/*!40000 ALTER TABLE `emergency_contacts` DISABLE KEYS */;
INSERT INTO `emergency_contacts` VALUES (1,'Security Emergency','Security Desk','911','security@company.com','For immediate security threats or building emergencies','SECURITY',1,1,1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(2,'Medical Emergency','On-Site Medical','800-555-0911','medical@company.com','On-site medical assistance','MEDICAL',2,1,1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(3,'IT Support','Help Desk','800-555-4357','helpdesk@company.com','Technical support and IT issues','IT_SUPPORT',3,1,0,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(4,'HR Support','HR Department','800-555-4700','hr@company.com','Human resources inquiries','HR',4,1,0,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(5,'Facilities','Facility Management','800-555-3900','facilities@company.com','Building maintenance and facilities issues','FACILITY',5,1,1,NULL,'2026-02-27 09:50:24','2026-02-28 23:10:23'),(6,'Security Desk','Front Desk Security','800-555-7378','security@company.com','24/7 building security','SECURITY',6,1,0,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24');
/*!40000 ALTER TABLE `emergency_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci GENERATED ALWAYS AS (concat(`first_name`,_utf8mb4' ',`last_name`)) STORED,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `profile_image_id` int DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','TERMINATED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_department` (`department`),
  KEY `fk_employee_profile_image` (`profile_image_id`),
  KEY `idx_employees_status_startdate` (`status`,`start_date`),
  CONSTRAINT `fk_employee_profile_image` FOREIGN KEY (`profile_image_id`) REFERENCES `images` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` (`id`, `employee_id`, `first_name`, `last_name`, `email`, `position`, `department`, `start_date`, `end_date`, `birth_date`, `profile_image_id`, `status`, `created_at`, `updated_at`) VALUES (1,'EMP001','Akshay','M','a.m@ieee.org','Full Stack Developer','IT','2026-02-02',NULL,'1111-01-14',66,'ACTIVE','2026-02-27 09:50:24','2026-04-07 05:57:23'),(2,'EMP002','Nikhil Kumar','','nikhil.kumar@ieee.org','IIP Coordinator','Philanthropy','2026-02-23',NULL,'1111-07-27',67,'ACTIVE','2026-02-27 09:50:24','2026-04-07 06:00:57'),(4,'EMP004','Bansari','Sompura','b.sompura@ieee.org','Finance Intern','Finance & Administration','2026-02-10',NULL,'1990-04-18',68,'ACTIVE','2026-02-27 09:50:24','2026-04-07 05:26:00'),(5,'EMP005','Gopika','Sreekumar','g.sreekumar@ieee.org','Internal Audit Analyst','Finance & Administration','2026-02-19',NULL,'1111-02-18',69,'ACTIVE','2026-02-27 09:50:24','2026-04-07 05:57:51'),(6,'EMP006','Archana','K M','a.km@ieee.org','WIE Placement Officer','Philanthropy','2026-01-27',NULL,'1111-04-22',70,'ACTIVE','2026-02-27 09:50:24','2026-04-07 06:03:10'),(7,'EMP007','Gurnur Singh','','gurnur.singh@ieee.org','Senior Oracle ERP Analyst','IT','2026-03-10',NULL,'1111-12-23',71,'ACTIVE','2026-02-27 09:50:24','2026-04-07 06:01:19'),(9,'EMP009','Michelle','Anderson','michelle.anderson@company.com','HR Specialist','HR','2024-04-05',NULL,'1993-04-20',9,'ACTIVE','2026-02-27 09:50:24','2026-04-02 01:18:37'),(10,'EMP010','Sushmitha','A S','emily.rodriguez@company.com','Digital Marketing intern','Marketing','2026-03-19',NULL,'1995-03-28',11,'ACTIVE','2026-02-27 09:50:24','2026-04-02 01:17:15'),(11,'EMP011','David','Park','david.park@company.com','Financial Analyst','Finance & Administration','2025-02-10','2026-04-02','1994-06-15',59,'TERMINATED','2026-02-27 09:50:24','2026-04-02 01:58:36'),(12,'EMP012','Lisa','Thompson','lisa.thompson@company.com','Software Engineer','Engineering','2025-02-20',NULL,'1992-07-22',NULL,'ACTIVE','2026-02-27 09:50:24','2026-02-28 08:35:22'),(13,'EMP013','James','Wilson','james.wilson@company.com','Data Analyst','Analytics','2025-12-01',NULL,'1990-05-10',NULL,'ACTIVE','2026-02-27 09:50:24','2026-02-28 08:35:22'),(15,'EMP015','Kevin','White','kevin.white@company.com','DevOps Engineer','Engineering','2026-02-01',NULL,'1993-03-18',1,'ACTIVE','2026-02-27 09:50:24','2026-02-28 08:35:22'),(31,'EMP016','Amanda','Harris','amanda.harris@company.com','Accountant','Finance','2019-01-07',NULL,'1986-08-12',NULL,'ACTIVE','2026-02-27 13:37:20','2026-02-28 08:35:22'),(33,'EMP018','Ashley','Lewis','ashley.lewis@company.com','Social Media Manager','Marketing','2023-04-02',NULL,NULL,13,'ACTIVE','2026-02-27 13:37:20','2026-04-02 01:21:08'),(34,'EMP019','Joshua','Walker','joshua.walker@company.com','Systems Administrator','IT','2020-04-15',NULL,NULL,NULL,'INACTIVE','2026-02-27 13:37:20','2026-04-02 02:15:34'),(35,'EMP020','Sagar','Hall','stephanie.hall@company.com','Human Resource','HR','2019-04-03',NULL,NULL,57,'ACTIVE','2026-02-27 13:37:20','2026-04-02 01:20:20'),(36,'EMP0040','Raja','Daivam','r.daivam@ieee.org','Lead Developer','IT','2026-02-28',NULL,NULL,5,'ACTIVE','2026-02-27 21:28:43','2026-03-16 05:07:05'),(37,'214155','Ranjita','Ambali','r.ambali@ieee.org','IT Intern','IT','2026-01-20',NULL,'1111-06-08',72,'ACTIVE','2026-03-05 03:24:57','2026-04-07 05:56:16'),(38,'EMP0010','Yukthashree','A S','y.as@ieee.com','IT Intern','IT','2026-02-09',NULL,'1111-10-10',73,'ACTIVE','2026-03-31 05:05:51','2026-04-07 05:56:24');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery_folders`
--

DROP TABLE IF EXISTS `gallery_folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery_folders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `folder_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `folder_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `photo_count` int NOT NULL DEFAULT '0',
  `display_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folder_name` (`folder_name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_folders`
--

LOCK TABLES `gallery_folders` WRITE;
/*!40000 ALTER TABLE `gallery_folders` DISABLE KEYS */;
INSERT INTO `gallery_folders` VALUES (1,'picnic','Company Picnic 2025','Fun times at the annual company picnic','images/gallery/picnic',8,1,1,'system','2026-03-01 05:22:43','2026-04-05 22:58:00'),(2,'diwali','Diwali Celebration','Festival of lights celebration at office','images/gallery/diwali',13,2,1,'system','2026-03-01 05:22:43','2026-04-01 04:17:24'),(3,'christmas','Christmas','Photo collection','images/gallery/christmas',9,3,1,'admin','2026-03-01 00:25:53','2026-04-07 04:31:27'),(4,'test','test images','testing images','images/gallery/test',15,0,1,NULL,'2026-03-01 01:01:34','2026-04-05 22:57:06'),(20,'Celebrations','Celebrations',NULL,'images/gallery/Celebrations',9,0,1,NULL,'2026-04-06 04:47:58','2026-04-06 05:08:13');
/*!40000 ALTER TABLE `gallery_folders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery_images`
--

DROP TABLE IF EXISTS `gallery_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_id` int DEFAULT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`),
  KEY `image_id` (`image_id`),
  CONSTRAINT `gallery_images_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_images`
--

LOCK TABLES `gallery_images` WRITE;
/*!40000 ALTER TABLE `gallery_images` DISABLE KEYS */;
INSERT INTO `gallery_images` VALUES (1,'Team Building Event','Annual team building activities',NULL,'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop','events',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(2,'Office Celebration','Celebrating our achievements',NULL,'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop','events',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(3,'Company Innovation','Innovation and creativity at work',NULL,'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop','workplace',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(4,'Community Outreach','Giving back to the community',NULL,'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop','social',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(5,'Team Collaboration','Working together',NULL,'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop','workplace',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(6,'Company Milestone','Reaching new heights',NULL,'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop','achievements',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(7,'Employee Recognition','Celebrating our stars',NULL,'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop','achievements',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(8,'Office Space','Our modern workspace',NULL,'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop','workplace',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(9,'Team Meeting','Collaboration in action',NULL,'https://images.unsplash.com/photo-1552664688-cf412ec27db2?w=800&h=600&fit=crop','workplace',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(10,'Holiday Party','Annual celebration',NULL,'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop','events',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(11,'Training Session','Learning and development',NULL,'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop','training',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(12,'Company Awards','Excellence recognized',NULL,'https://images.unsplash.com/photo-1599658880436-c61792e70672?w=800&h=600&fit=crop','achievements',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(13,'Team Lunch','Building relationships',NULL,'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop','social',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(14,'Product Launch','New product celebration',NULL,'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop','achievements',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(15,'Volunteer Day','Making an impact',NULL,'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop','social',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(16,'Company Picnic','Fun in the sun',NULL,'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop','events',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(17,'Leadership Team','Our amazing leaders',NULL,'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop','team',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(18,'Office Tour','Welcome to our space',NULL,'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop','workplace',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(19,'Team Success','Celebrating wins together',NULL,'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop','achievements',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(20,'Company Culture','What makes us special',NULL,'https://images.unsplash.com/photo-1522071901873-411886a10004?w=800&h=600&fit=crop','workplace',1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24');
/*!40000 ALTER TABLE `gallery_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `holidays`
--

DROP TABLE IF EXISTS `holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holidays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `holiday_date` date NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_holiday_date` (`holiday_date`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holidays`
--

LOCK TABLES `holidays` WRITE;
/*!40000 ALTER TABLE `holidays` DISABLE KEYS */;
INSERT INTO `holidays` VALUES (1,'New Year','2026-01-01','Happy New Year to Everyone!!',1,NULL,'2026-02-27 09:50:24','2026-04-01 22:46:33'),(3,'Bakrid','2026-05-28','Happy Bakrid!!',1,NULL,'2026-02-27 09:50:24','2026-04-02 00:35:50'),(5,'May Day','2026-05-01','Happy Republic Day',1,NULL,'2026-02-27 09:50:24','2026-04-01 23:52:39'),(7,'Christmas','2026-12-25','Happy Christmas to Everyone!!',1,NULL,'2026-02-27 09:50:24','2026-04-01 22:46:16'),(12,'Good Friday','2026-04-03','Happy Good Friday!! Spend happy day with your family',1,'admin','2026-04-01 06:11:27','2026-04-01 06:11:27'),(14,'Makara Sankranti','2026-01-15','Happy Makara Sankranti to All',1,'admin','2026-04-01 22:47:49','2026-04-01 22:47:49'),(15,'Republic Day','2026-01-26','Happy Republic Day!!',1,'admin','2026-04-01 22:48:30','2026-04-01 22:48:30'),(16,'Ugadi','2026-03-19','Happy Ugadi to All',1,'admin','2026-04-01 22:49:11','2026-04-01 22:49:11'),(17,'Ganesh Chaturthi','2026-09-14','May Bappa bless all with wisdom, and happiness',1,'admin','2026-04-01 22:53:02','2026-04-02 00:35:37'),(18,'Gandhi Jayanti','2026-10-02','Wishing you all a very Happy Gandhi Jayanti!',1,'admin','2026-04-01 22:54:08','2026-04-01 22:54:08'),(19,'Vijayadashami','2026-10-21','Wishing you all a joyous Vijayadashami!!',1,'admin','2026-04-01 23:00:57','2026-04-02 00:35:19'),(20,'Balipadyami','2026-11-10','Happy Bali Padyami!',1,'admin','2026-04-01 23:02:33','2026-04-01 23:02:33'),(21,'Ramazan','2026-03-21','Happy Ramazan!!',0,'admin','2026-04-01 23:03:44','2026-04-07 22:52:31'),(22,'Independence Day','2026-08-15','Happy Independence Day!!',0,'admin','2026-04-01 23:04:38','2026-04-07 22:52:23'),(23,'Rajyotsava','2026-11-01','Happy Karnataka Rajyotsava',0,'admin','2026-04-01 23:05:40','2026-04-07 22:52:40');
/*!40000 ALTER TABLE `holidays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `image_type` enum('EMPLOYEE_PROFILE','CAROUSEL','ANNOUNCEMENT','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_image_type` (`image_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `images`
--

LOCK TABLES `images` WRITE;
/*!40000 ALTER TABLE `images` DISABLE KEYS */;
INSERT INTO `images` VALUES (1,'kevin-white-profile.jpg','kevin-white-profile.jpg','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&face=1',0,'image/jpeg',NULL,NULL,'EMPLOYEE_PROFILE','system','2026-02-28 04:14:14'),(2,'raja-daivam-profile.jpg','raja-daivam-profile.jpg','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&face=1',0,'image/jpeg',NULL,NULL,'EMPLOYEE_PROFILE','system','2026-02-28 04:14:14'),(3,'35f641b7-0e2c-446b-85a4-6d73b5d240dd.jpg','IEEE Staffs.jpg','uploads\\images\\35f641b7-0e2c-446b-85a4-6d73b5d240dd.jpg',247520,'image/jpeg',1000,800,'ANNOUNCEMENT','admin','2026-03-12 23:01:29'),(4,'7c387985-2242-4450-bbd4-00da12067430.jpg','female.jpg','uploads\\images\\7c387985-2242-4450-bbd4-00da12067430.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-03-16 05:06:34'),(5,'4cbc01a3-cc42-48ed-87ac-0ee979627ed9.jpg','male.jpg','uploads\\images\\4cbc01a3-cc42-48ed-87ac-0ee979627ed9.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-03-16 05:07:05'),(6,'4e958e14-31d9-4185-bddc-01b10ec77210.jpg','female.jpg','uploads\\images\\4e958e14-31d9-4185-bddc-01b10ec77210.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-03-16 05:07:43'),(7,'9c4bfb4e-7159-4bd4-a2fc-643d799012bb.jpg','male.jpg','uploads\\images\\9c4bfb4e-7159-4bd4-a2fc-643d799012bb.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-03-16 05:08:01'),(8,'428892d9-91aa-425f-af5f-d2e4668764af.jpg','male.jpg','uploads\\images\\428892d9-91aa-425f-af5f-d2e4668764af.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-03-16 05:08:18'),(9,'c142ee74-0302-451b-8a55-4e246dfa065d.jpg','male.jpg','uploads\\images\\c142ee74-0302-451b-8a55-4e246dfa065d.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-03-16 05:44:31'),(10,'0e6c1df5-4414-487d-9bad-b46bc8e98e77.jpg','female.jpg','uploads\\images\\0e6c1df5-4414-487d-9bad-b46bc8e98e77.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-03-16 05:44:53'),(11,'2483ea57-0753-4a3e-b081-5c4aad88c3d9.jpg','female.jpg','uploads\\images\\2483ea57-0753-4a3e-b081-5c4aad88c3d9.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-03-16 05:45:27'),(12,'f436c507-8571-4b7a-9c90-34af5b014635.jpg','male.jpg','uploads\\images\\f436c507-8571-4b7a-9c90-34af5b014635.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-03-17 03:54:40'),(13,'9b5628c1-ce09-4f0f-bac6-b427151e2791.jpg','female.jpg','uploads\\images\\9b5628c1-ce09-4f0f-bac6-b427151e2791.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-03-17 03:55:53'),(14,'77a3ae46-0148-4122-8a47-5546ecf0e522.jpg','IEEE team.jpg','uploads\\images\\77a3ae46-0148-4122-8a47-5546ecf0e522.jpg',346326,'image/jpeg',1000,800,'CAROUSEL','admin','2026-03-24 04:14:34'),(15,'80a9a269-a8b4-4af4-9a5b-1e947a1bccc2.jpg','Echo session.jpg','uploads\\images\\80a9a269-a8b4-4af4-9a5b-1e947a1bccc2.jpg',2797787,'image/jpeg',4000,3000,'CAROUSEL','admin','2026-03-24 05:00:23'),(16,'870d243c-84d8-4bd2-986c-b8613b0eeca9.jpeg','townhall.jpeg','uploads\\images\\870d243c-84d8-4bd2-986c-b8613b0eeca9.jpeg',285457,'image/jpeg',1200,1600,'CAROUSEL','admin','2026-03-24 05:02:41'),(17,'e8bf6af3-d83f-4eef-aac8-25d236846358.jpg','female.jpg','uploads\\images\\e8bf6af3-d83f-4eef-aac8-25d236846358.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-03-31 05:05:52'),(18,'2d126226-e525-4f75-9677-adcf72459144.jpeg','womens_day.jpeg','uploads\\images\\2d126226-e525-4f75-9677-adcf72459144.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 04:39:23'),(19,'f95c57d6-ab88-4a37-9792-fbd0d499de36.jpeg','womens_day.jpeg','uploads\\images\\f95c57d6-ab88-4a37-9792-fbd0d499de36.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 04:39:51'),(20,'86cfb61e-c887-4778-afab-ed6953f404e7.jpeg','womens_day.jpeg','uploads\\images\\86cfb61e-c887-4778-afab-ed6953f404e7.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 04:40:50'),(21,'aa6b2def-870d-4dfa-af8f-7b1f5be79473.jpeg','WhatsApp Image 2026-03-25 at 5.23.51 PM.jpeg','uploads\\images\\aa6b2def-870d-4dfa-af8f-7b1f5be79473.jpeg',121515,'image/jpeg',960,1280,'CAROUSEL','admin','2026-04-01 04:44:39'),(22,'b442b362-5776-4e68-92ca-2b2b9b3c300f.jpeg','WhatsApp Image 2026-03-25 at 5.23.51 PM.jpeg','uploads\\images\\b442b362-5776-4e68-92ca-2b2b9b3c300f.jpeg',121515,'image/jpeg',960,1280,'CAROUSEL','admin','2026-04-01 04:45:02'),(23,'0e406ef4-74ca-41ea-b8f3-5f9579ff4247.jpeg','WhatsApp Image 2026-03-25 at 5.23.51 PM.jpeg','uploads\\images\\0e406ef4-74ca-41ea-b8f3-5f9579ff4247.jpeg',121515,'image/jpeg',960,1280,'CAROUSEL','admin','2026-04-01 04:46:02'),(24,'b2cfb6e8-cad1-4c64-a2a6-b0cfc328f31a.jpeg','womens_day.jpeg','uploads\\images\\b2cfb6e8-cad1-4c64-a2a6-b0cfc328f31a.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 04:48:21'),(25,'cfcbd399-023b-4d24-9eef-0cfd398faa3b.jpeg','womens_day.jpeg','uploads\\images\\cfcbd399-023b-4d24-9eef-0cfd398faa3b.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 04:48:59'),(26,'9311fbc1-c995-4045-a80d-527c99a9699e.jpeg','WhatsApp Image 2026-03-25 at 5.23.51 PM.jpeg','uploads\\images\\9311fbc1-c995-4045-a80d-527c99a9699e.jpeg',121515,'image/jpeg',960,1280,'CAROUSEL','admin','2026-04-01 04:49:23'),(27,'a7e522d4-643d-47ac-b1f2-a05a60834315.jpeg','WhatsApp Image 2026-03-25 at 5.23.51 PM.jpeg','uploads\\images\\a7e522d4-643d-47ac-b1f2-a05a60834315.jpeg',121515,'image/jpeg',960,1280,'CAROUSEL','admin','2026-04-01 04:57:50'),(28,'089877a1-9fcc-4d19-9610-6b5921e5d6e8.jpeg','womens_day.jpeg','uploads\\images\\089877a1-9fcc-4d19-9610-6b5921e5d6e8.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 04:59:56'),(29,'832e246d-4811-4a78-9cb5-08c647c20bc7.jpeg','womens_day.jpeg','uploads\\images\\832e246d-4811-4a78-9cb5-08c647c20bc7.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:00:34'),(30,'0221e376-6d70-43a5-b3e6-10e2cba1b68f.jpeg','WhatsApp Image 2026-03-25 at 5.23.51 PM.jpeg','uploads\\images\\0221e376-6d70-43a5-b3e6-10e2cba1b68f.jpeg',121515,'image/jpeg',960,1280,'CAROUSEL','admin','2026-04-01 05:01:49'),(31,'66ff72cc-8c23-4c0f-809d-b5db92ee6d39.jpeg','womens_day.jpeg','uploads\\images\\66ff72cc-8c23-4c0f-809d-b5db92ee6d39.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:02:54'),(32,'6547c2e9-ef32-40ae-8747-8a21bcece311.jpeg','womens_day.jpeg','uploads\\images\\6547c2e9-ef32-40ae-8747-8a21bcece311.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:10:09'),(33,'a4742617-667b-40b6-b378-646b2e281cd5.jpeg','womens_day.jpeg','uploads\\images\\a4742617-667b-40b6-b378-646b2e281cd5.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:10:37'),(34,'d22d35bc-937f-4579-b322-b6180709068a.jpeg','WhatsApp Image 2026-03-25 at 5.23.51 PM.jpeg','uploads\\images\\d22d35bc-937f-4579-b322-b6180709068a.jpeg',121515,'image/jpeg',960,1280,'CAROUSEL','admin','2026-04-01 05:11:03'),(35,'53855e5f-735e-4745-aa72-5938df846557.jpeg','womens_day.jpeg','uploads\\images\\53855e5f-735e-4745-aa72-5938df846557.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:18:02'),(36,'1f593d5f-cc29-4169-9864-c9b9bcd8ba78.jpeg','WhatsApp Image 2026-03-25 at 5.23.51 PM.jpeg','uploads\\images\\1f593d5f-cc29-4169-9864-c9b9bcd8ba78.jpeg',121515,'image/jpeg',960,1280,'CAROUSEL','admin','2026-04-01 05:21:51'),(37,'a6bb0ffd-de50-438b-956b-39e18d6dd82a.jpeg','womens_day.jpeg','uploads\\images\\a6bb0ffd-de50-438b-956b-39e18d6dd82a.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:22:27'),(38,'d6e8585f-da8f-4b50-8566-3be029ba009b.jpeg','womens_day.jpeg','uploads\\images\\d6e8585f-da8f-4b50-8566-3be029ba009b.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:22:46'),(39,'8fd9ace4-fdc1-41dc-9dfb-0ae3ad286807.jpeg','womens_day.jpeg','uploads\\images\\8fd9ace4-fdc1-41dc-9dfb-0ae3ad286807.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:27:50'),(40,'1883e954-0fca-4257-8897-f8a66c01f40d.jpeg','womens_day.jpeg','uploads\\images\\1883e954-0fca-4257-8897-f8a66c01f40d.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:28:07'),(41,'80aaa972-5338-4175-92c9-3f57e06ecf7b.jpeg','WhatsApp Image 2026-03-25 at 5.23.51 PM.jpeg','uploads\\images\\80aaa972-5338-4175-92c9-3f57e06ecf7b.jpeg',121515,'image/jpeg',960,1280,'CAROUSEL','admin','2026-04-01 05:30:20'),(42,'cf65d51c-8a08-414e-bb48-3d2acbca8de5.jpeg','womens_day.jpeg','uploads\\images\\cf65d51c-8a08-414e-bb48-3d2acbca8de5.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:33:10'),(43,'d5f57157-c609-4fce-9947-0e4aa8ce5179.jpeg','womens_day.jpeg','uploads\\images\\d5f57157-c609-4fce-9947-0e4aa8ce5179.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:33:31'),(44,'36c0cddc-d7e5-46eb-91ed-29b13213195e.jpeg','womens_day.jpeg','uploads\\images\\36c0cddc-d7e5-46eb-91ed-29b13213195e.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:40:26'),(45,'23abf775-b186-4ac2-af43-d3e791daba3b.jpeg','womens_day.jpeg','uploads\\images\\23abf775-b186-4ac2-af43-d3e791daba3b.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 05:40:58'),(46,'8efd55a7-642d-4e23-bdcc-36907a291883.jpeg','WhatsApp Image 2026-03-25 at 5.23.51 PM.jpeg','uploads\\images\\8efd55a7-642d-4e23-bdcc-36907a291883.jpeg',121515,'image/jpeg',960,1280,'CAROUSEL','admin','2026-04-01 05:49:27'),(47,'a69966f6-9b92-4002-b501-66a88022c2c5.jpeg','womens_day.jpeg','uploads\\images\\a69966f6-9b92-4002-b501-66a88022c2c5.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 06:10:19'),(48,'c4468663-375e-483d-b5bb-443c9a6ba21d.jpeg','womens_day.jpeg','uploads\\images\\c4468663-375e-483d-b5bb-443c9a6ba21d.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 10:41:27'),(49,'bb443d44-4c35-4b80-9cc1-fec6e2b43bc6.jpeg','womens_day.jpeg','uploads\\images\\bb443d44-4c35-4b80-9cc1-fec6e2b43bc6.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 11:24:14'),(50,'1791a4c9-f2d2-412e-85f7-4e640bb0f0ab.jpeg','womens_day.jpeg','uploads\\images\\1791a4c9-f2d2-412e-85f7-4e640bb0f0ab.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 11:29:25'),(51,'ab6d5308-b160-4619-8463-fa5f2e7b42ed.jpeg','womens_day.jpeg','uploads\\images\\ab6d5308-b160-4619-8463-fa5f2e7b42ed.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 11:29:58'),(52,'fce9f37e-c14b-4aa0-bd45-0793c6fc639c.jpeg','womens_day.jpeg','uploads\\images\\fce9f37e-c14b-4aa0-bd45-0793c6fc639c.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 11:32:03'),(53,'245707ed-814e-4610-bdc7-dba03fd91205.jpeg','womens_day.jpeg','uploads\\images\\245707ed-814e-4610-bdc7-dba03fd91205.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 11:36:22'),(54,'4ddd97de-ea9e-4a0b-9b76-1e965b17869c.jpg','male.jpg','uploads\\images\\4ddd97de-ea9e-4a0b-9b76-1e965b17869c.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-04-01 11:37:52'),(55,'165cb7d8-6f5e-4366-8a82-07d8d5bccacb.jpeg','womens_day.jpeg','uploads\\images\\165cb7d8-6f5e-4366-8a82-07d8d5bccacb.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-01 12:01:30'),(56,'9dec3a7f-32d9-487a-845a-2ccc4645a535.jpeg','WhatsApp Image 2026-03-25 at 5.23.51 PM.jpeg','uploads\\images\\9dec3a7f-32d9-487a-845a-2ccc4645a535.jpeg',121515,'image/jpeg',960,1280,'CAROUSEL','admin','2026-04-02 00:09:23'),(57,'7f61b878-3d2d-45ec-bc7d-f31044e7a6a7.jpg','male.jpg','uploads\\images\\7f61b878-3d2d-45ec-bc7d-f31044e7a6a7.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-04-02 01:20:20'),(58,'e7149968-b458-4d7b-94a4-673a96a5cdcf.jpg','female.jpg','uploads\\images\\e7149968-b458-4d7b-94a4-673a96a5cdcf.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-04-02 01:23:52'),(59,'bcc474c8-c862-4018-a0e4-7038d9e94c1f.jpg','male.jpg','uploads\\images\\bcc474c8-c862-4018-a0e4-7038d9e94c1f.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-04-02 01:58:36'),(60,'54724450-a901-4534-b74c-ad7cc3f3f2eb.jpeg','womens_day.jpeg','uploads\\images\\54724450-a901-4534-b74c-ad7cc3f3f2eb.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-05 23:14:54'),(61,'7947f098-80c7-411d-a854-2961bea15a38.jpeg','womens_day.jpeg','uploads\\images\\7947f098-80c7-411d-a854-2961bea15a38.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-05 23:19:56'),(62,'a3848c09-9724-4e8e-883a-7b5a0decb713.jpeg','womens_day.jpeg','uploads\\images\\a3848c09-9724-4e8e-883a-7b5a0decb713.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-05 23:23:19'),(63,'7e4ea192-09ea-4b7b-bf3e-d1b59fa58cd6.jpeg','womens_day.jpeg','uploads\\images\\7e4ea192-09ea-4b7b-bf3e-d1b59fa58cd6.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-05 23:26:47'),(64,'c177767c-ed06-41aa-8e66-7b645ca61859.jpeg','womens_day.jpeg','uploads\\images\\c177767c-ed06-41aa-8e66-7b645ca61859.jpeg',963569,'image/jpeg',3490,1349,'CAROUSEL','admin','2026-04-05 23:29:52'),(65,'2f9f45fa-86da-46da-b838-d6f78ecf1ad2.png','Bring your child to work.png','uploads\\images\\2f9f45fa-86da-46da-b838-d6f78ecf1ad2.png',2050048,'image/png',1380,705,'ANNOUNCEMENT','admin','2026-04-07 05:02:09'),(66,'2cbdfaff-992c-4f61-9c6e-664dc2fcbca2.jpg','Akshay.jpg','uploads\\images\\2cbdfaff-992c-4f61-9c6e-664dc2fcbca2.jpg',83910,'image/jpeg',726,935,'EMPLOYEE_PROFILE','admin','2026-04-07 05:12:46'),(67,'dd359593-fe30-4411-8507-fc9e54a83dc1.png','Nikhil Kumar.png','uploads\\images\\dd359593-fe30-4411-8507-fc9e54a83dc1.png',1338315,'image/png',1084,2412,'EMPLOYEE_PROFILE','admin','2026-04-07 05:21:56'),(68,'4c4d4c13-021b-472b-849f-89194e6121d6.png','Screenshot 2026-04-07 162533.png','uploads\\images\\4c4d4c13-021b-472b-849f-89194e6121d6.png',48223,'image/png',175,181,'EMPLOYEE_PROFILE','admin','2026-04-07 05:26:00'),(69,'4a6f6969-a4ff-4f68-b3b9-432cd5f0aaae.jpg','Gopica.jpg','uploads\\images\\4a6f6969-a4ff-4f68-b3b9-432cd5f0aaae.jpg',25387,'image/jpeg',472,591,'EMPLOYEE_PROFILE','admin','2026-04-07 05:29:06'),(70,'b865f37a-258f-4589-9c4e-11796b7d6873.png','Screenshot 2026-04-07 163428.png','uploads\\images\\b865f37a-258f-4589-9c4e-11796b7d6873.png',56902,'image/png',218,259,'EMPLOYEE_PROFILE','admin','2026-04-07 05:34:58'),(71,'4865f568-7291-4ddc-862b-98ae1ce0a2cd.jpg','Gurnur.jpg','uploads\\images\\4865f568-7291-4ddc-862b-98ae1ce0a2cd.jpg',14383,'image/jpeg',258,340,'EMPLOYEE_PROFILE','admin','2026-04-07 05:38:52'),(72,'ff278a17-c43a-4fa6-8f2f-7327bc08c738.jpeg','my photo.jpeg','uploads\\images\\ff278a17-c43a-4fa6-8f2f-7327bc08c738.jpeg',91258,'image/jpeg',924,1080,'EMPLOYEE_PROFILE','admin','2026-04-07 05:40:03'),(73,'3cd63c45-8c37-4b91-ad18-5353aee36e16.jpeg','WhatsApp Image 2026-04-07 at 4.36.21 PM.jpeg','uploads\\images\\3cd63c45-8c37-4b91-ad18-5353aee36e16.jpeg',113146,'image/jpeg',1030,1024,'EMPLOYEE_PROFILE','admin','2026-04-07 05:41:02');
/*!40000 ALTER TABLE `images` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `open_positions`
--

LOCK TABLES `open_positions` WRITE;
/*!40000 ALTER TABLE `open_positions` DISABLE KEYS */;
INSERT INTO `open_positions` VALUES (12,'E6104',' IEEE India Philanthropy Coordinator','India-Karnataka-Bengaluru','2026-03-25',NULL,'','','OPEN',1,'2026-04-01 04:03:37','2026-04-01 04:03:37'),(13,'E4047','Internal Audit Analyst I ','India-Karnataka-Bengaluru','2026-03-09',NULL,'','','OPEN',1,'2026-04-01 04:04:37','2026-04-01 04:04:37'),(14,'E4047B','Internal Audit Analyst II','India-Karnataka-Bengaluru','2026-03-04',NULL,'','','OPEN',1,'2026-04-01 04:06:18','2026-04-01 04:06:18'),(15,'E6091',' Human Resources Generalist','India-Karnataka-Bengaluru','2026-02-12',NULL,'','','OPEN',1,'2026-04-01 04:10:29','2026-04-01 04:10:29');
/*!40000 ALTER TABLE `open_positions` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quick_links`
--

LOCK TABLES `quick_links` WRITE;
/*!40000 ALTER TABLE `quick_links` DISABLE KEYS */;
INSERT INTO `quick_links` VALUES (1,'Company Email','https://www.google.com/search?q=ieee-india%40ieee.org&rlz=1C1GCEA_en-GBIN1202IN1202&oq=ieee+company+email&gs_lcrp=EgZjaHJvbWUqBwgBECEYoAEyBggAEEUYOTIHCAEQIRigATIHCAIQIRigATIHCAMQIRigATIHCAQQIRifBTIHCAUQIRifBTIHCAYQIRifBTIHCAcQIRifBTIHCAgQIRiPAtIBCDg3ODJqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8&mstk=AUtExfCINGujDnY0ir2_eL0GdKb0zINGuvn5st9YQCGEV8aKfiuxyV0ZxwpJ-2IGakpMQ2culPeOTJf0DBv-U0AX8I9F-P-wyU36dOs0VCQ6RQ7xcoS83tDkp-mJLir0WNNEL5zrwrXIxpR0m2hniOR62tEgfJsUCZp2sUxxKOEqSUpVvDf3p8KNlhmPOYy7b9Zu43xw&csui=3&ved=2ahUKEwik56_67LeTAxXOa2wGHX6UAoYQgK4QegQIARAD','Access your company email','bi-envelope-fill','tools',1,1,1,NULL,'2026-02-27 09:50:24','2026-03-24 00:27:50'),(2,'Employee Portal','https://portal.company.com','Access HR and benefits portal','bi-people-fill','hr',2,0,1,NULL,'2026-02-27 09:50:24','2026-04-02 02:03:36'),(3,'IT Help Desk','https://helpdesk.ieee.org/','Submit IT support tickets','bi-headset','support',3,1,1,NULL,'2026-02-27 09:50:24','2026-03-24 01:01:41'),(4,'Time Tracking','https://timesheet.company.com','Log your work hours','bi-clock-history','tools',4,0,1,NULL,'2026-02-27 09:50:24','2026-04-02 02:02:55'),(6,'Benefits Portal','https://benefits.company.com','Manage your benefits','bi-heart-pulse-fill','hr',6,0,1,NULL,'2026-02-27 09:50:24','2026-04-02 02:03:04'),(7,'Learning and Development','https://sst.myabsorb.com/#/dashboard','Training and development resources','bi-book-fill','resources',7,1,1,NULL,'2026-02-27 09:50:24','2026-03-31 03:40:22'),(8,'Payroll','https://payroll.company.com','View pay stubs and tax documents','bi-cash-stack','hr',8,0,1,NULL,'2026-02-27 09:50:24','2026-04-02 02:03:19'),(9,'IEEE Company Website','https://india.ieee.org/','Access your IEEE India office website','bi-bank','Website',0,1,1,'admin','2026-03-09 04:39:37','2026-03-24 01:00:59'),(10,'IEEE India Operations','https://drive.google.com/drive/folders/1cO4Ua2agWrurbcdlwom4tIAciDpd5Fgh?usp=sharing',NULL,'bi-file-earmark-text-fill','Training',0,1,1,'admin','2026-03-24 00:02:01','2026-03-31 04:15:22'),(12,'ZOHO app','https://people.zoho.in/','Access the app','bi-box-arrow-in-right','All',0,1,1,'admin','2026-03-24 00:16:55','2026-04-01 11:52:18');
/*!40000 ALTER TABLE `quick_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoutouts`
--

DROP TABLE IF EXISTS `shoutouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoutouts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `from_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `to_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  `is_displayed` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_approved_displayed` (`is_approved`,`is_displayed`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoutouts`
--

LOCK TABLES `shoutouts` WRITE;
/*!40000 ALTER TABLE `shoutouts` DISABLE KEYS */;
INSERT INTO `shoutouts` VALUES (1,'John Smith','Sarah Johnson','Thank you for your amazing help on the project! Your dedication is inspiring.','Teamwork',1,1,'2026-03-02 13:15:36','2026-03-02 13:15:36','admin'),(2,'Emily Davis','Michael Brown','Great job on the presentation! You knocked it out of the park!','Excellence',1,1,'2026-03-02 13:15:36','2026-03-02 13:15:36','admin'),(3,'David Wilson','Jennifer Garcia','Your innovative solution saved us hours of work. You\'re a star!','Innovation',1,1,'2026-03-02 13:15:36','2026-03-02 13:15:36','admin'),(4,'Lisa Anderson','James Martinez','Thanks for always being so helpful and positive. You make work fun!','Appreciation',1,1,'2026-03-02 13:15:36','2026-03-02 13:15:36','admin'),(5,'Robert Thomas','Patricia Rodriguez','Your attention to detail is incredible. Thanks for catching that error!','Excellence',1,1,'2026-03-02 13:15:36','2026-03-02 13:15:36','admin'),(6,'Raja Daivam','Joshua Walker','test','Teamwork',0,1,'2026-03-02 08:18:29',NULL,NULL),(7,'Raja Daivam','David Park','Testing welcome','Appreciation',0,1,'2026-03-02 08:47:29',NULL,NULL),(8,'Raja Daivam','Jessica Williams','she did very good job','Teamwork',0,1,'2026-03-02 22:21:09',NULL,NULL),(9,'Daniel Garcia','Kevin White','test','Appreciation',0,1,'2026-03-03 00:05:13',NULL,NULL),(10,'Amanda Brown','Amanda Harris','Good innovation','Innovation',0,1,'2026-03-11 03:18:20',NULL,NULL),(11,'Ranjita Ambali','Yukthashree A S','Built the dashboard for the portal','Teamwork',0,1,'2026-04-06 04:39:40',NULL,NULL);
/*!40000 ALTER TABLE `shoutouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_active_announcements`
--

DROP TABLE IF EXISTS `vw_active_announcements`;
/*!50001 DROP VIEW IF EXISTS `vw_active_announcements`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_active_announcements` AS SELECT 
 1 AS `id`,
 1 AS `type`,
 1 AS `title`,
 1 AS `description`,
 1 AS `date`,
 1 AS `priority`,
 1 AS `image_url`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_active_carousel`
--

DROP TABLE IF EXISTS `vw_active_carousel`;
/*!50001 DROP VIEW IF EXISTS `vw_active_carousel`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_active_carousel` AS SELECT 
 1 AS `id`,
 1 AS `title`,
 1 AS `subtitle`,
 1 AS `display_order`,
 1 AS `image_url`,
 1 AS `width`,
 1 AS `height`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_recent_joiners`
--

DROP TABLE IF EXISTS `vw_recent_joiners`;
/*!50001 DROP VIEW IF EXISTS `vw_recent_joiners`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_recent_joiners` AS SELECT 
 1 AS `id`,
 1 AS `employee_id`,
 1 AS `name`,
 1 AS `position`,
 1 AS `department`,
 1 AS `start_date`,
 1 AS `title`,
 1 AS `description`,
 1 AS `image_url`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_upcoming_holidays`
--

DROP TABLE IF EXISTS `vw_upcoming_holidays`;
/*!50001 DROP VIEW IF EXISTS `vw_upcoming_holidays`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_upcoming_holidays` AS SELECT 
 1 AS `id`,
 1 AS `title`,
 1 AS `date`,
 1 AS `description`,
 1 AS `days_until`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vw_active_announcements`
--

/*!50001 DROP VIEW IF EXISTS `vw_active_announcements`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_active_announcements` AS select `a`.`id` AS `id`,`a`.`type` AS `type`,`a`.`title` AS `title`,`a`.`description` AS `description`,`a`.`publish_date` AS `date`,`a`.`priority` AS `priority`,`i`.`file_path` AS `image_url`,`a`.`created_at` AS `created_at` from (`announcements` `a` left join `images` `i` on((`a`.`image_id` = `i`.`id`))) where ((`a`.`is_active` = true) and (`a`.`publish_date` <= curdate()) and ((`a`.`expiry_date` is null) or (`a`.`expiry_date` >= curdate()))) order by `a`.`priority` desc,`a`.`publish_date` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_active_carousel`
--

/*!50001 DROP VIEW IF EXISTS `vw_active_carousel`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_active_carousel` AS select `c`.`id` AS `id`,`c`.`title` AS `title`,`c`.`subtitle` AS `subtitle`,`c`.`display_order` AS `display_order`,`i`.`file_path` AS `image_url`,`i`.`width` AS `width`,`i`.`height` AS `height` from (`carousel_slides` `c` join `images` `i` on((`c`.`image_id` = `i`.`id`))) where (`c`.`is_active` = true) order by `c`.`display_order`,`c`.`created_at` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_recent_joiners`
--

/*!50001 DROP VIEW IF EXISTS `vw_recent_joiners`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_recent_joiners` AS select `e`.`id` AS `id`,`e`.`employee_id` AS `employee_id`,`e`.`full_name` AS `name`,`e`.`position` AS `position`,`e`.`department` AS `department`,`e`.`start_date` AS `start_date`,concat('Welcome ',`e`.`full_name`,' to Our Team!') AS `title`,concat('We are excited to welcome ',`e`.`full_name`,' as our new ',`e`.`position`,'.') AS `description`,`i`.`file_path` AS `image_url`,`e`.`created_at` AS `created_at` from (`employees` `e` left join `images` `i` on((`e`.`profile_image_id` = `i`.`id`))) where ((`e`.`status` = 'ACTIVE') and (`e`.`start_date` >= (curdate() - interval 90 day))) order by `e`.`start_date` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_upcoming_holidays`
--

/*!50001 DROP VIEW IF EXISTS `vw_upcoming_holidays`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_upcoming_holidays` AS select `holidays`.`id` AS `id`,`holidays`.`title` AS `title`,`holidays`.`holiday_date` AS `date`,`holidays`.`description` AS `description`,(to_days(`holidays`.`holiday_date`) - to_days(curdate())) AS `days_until` from `holidays` where ((`holidays`.`is_active` = true) and (`holidays`.`holiday_date` >= curdate()) and (`holidays`.`holiday_date` <= (curdate() + interval 180 day))) order by `holidays`.`holiday_date` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-08 11:56:22

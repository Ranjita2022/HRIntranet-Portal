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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` (`id`, `employee_id`, `first_name`, `last_name`, `email`, `position`, `department`, `start_date`, `birth_date`, `profile_image_id`, `status`, `created_at`, `updated_at`) VALUES (1,'EMP001','Sarahaa','Johnson','sarah.johnson@company.com','Senior HR Manager','Engineering','2016-02-15','1985-03-15',6,'ACTIVE','2026-02-27 09:50:24','2026-03-16 05:07:43'),(2,'EMP002','Robert','Martinez','robert.martinez@company.com','Senior Software Architect','Engineering','2016-03-13','1983-05-22',7,'ACTIVE','2026-02-27 09:50:24','2026-03-16 05:08:01'),(3,'EMP003','Jennifer','Taylor','jennifer.taylor@company.com','Director of Operations','Operations','2025-03-01','1982-07-10',8,'ACTIVE','2026-02-27 09:50:24','2026-03-16 05:08:18'),(4,'EMP004','Michael','Chen','michael.chen@company.com','Senior Developer','Engineering','2021-02-15','1990-04-18',NULL,'ACTIVE','2026-02-27 09:50:24','2026-02-28 08:35:22'),(5,'EMP005','Amanda','Brown','amanda.brown@company.com','Marketing Manager','Marketing','2021-03-01','1988-06-25',10,'ACTIVE','2026-02-27 09:50:24','2026-03-16 05:44:53'),(6,'EMP006','Christopher','Lee','christopher.lee@company.com','Senior Financial Analyst','Finance','2026-03-20','1987-08-30',12,'ACTIVE','2026-02-27 09:50:24','2026-03-17 03:54:40'),(7,'EMP007','Jessica','Williams','jessica.williams@company.com','Product Manager','Product','2024-02-10','1992-03-12',NULL,'ACTIVE','2026-02-27 09:50:24','2026-02-28 08:35:22'),(8,'EMP008','Daniel','Garcia','daniel.garcia@company.com','UX Designer','Design','2024-02-25','1991-05-08',NULL,'ACTIVE','2026-02-27 09:50:24','2026-02-28 08:35:22'),(9,'EMP009','Michelle','Anderson','michelle.anderson@company.com','HR Specialist','HR','2024-03-05','1993-04-20',9,'ACTIVE','2026-02-27 09:50:24','2026-03-16 05:44:31'),(10,'EMP010','Emily','Rodriguez','emily.rodriguez@company.com','Marketing Specialist','Marketing','2025-02-01','1995-03-28',11,'ACTIVE','2026-02-27 09:50:24','2026-03-16 05:45:27'),(11,'EMP011','David','Park','david.park@company.com','Financial Analyst','Finance','2025-02-10','1994-06-15',NULL,'ACTIVE','2026-02-27 09:50:24','2026-02-28 08:35:22'),(12,'EMP012','Lisa','Thompson','lisa.thompson@company.com','Software Engineer','Engineering','2025-02-20','1992-07-22',NULL,'ACTIVE','2026-02-27 09:50:24','2026-02-28 08:35:22'),(13,'EMP013','James','Wilson','james.wilson@company.com','Data Analyst','Analytics','2025-12-01','1990-05-10',NULL,'ACTIVE','2026-02-27 09:50:24','2026-02-28 08:35:22'),(14,'EMP014','Maria','Lopez','maria.lopez@company.com','Content Writer','Marketing','2026-01-15','1996-04-05',NULL,'ACTIVE','2026-02-27 09:50:24','2026-02-28 08:35:22'),(15,'EMP015','Kevin','White','kevin.white@company.com','DevOps Engineer','Engineering','2026-02-01','1993-03-18',1,'ACTIVE','2026-02-27 09:50:24','2026-02-28 08:35:22'),(31,'EMP016','Amanda','Harris','amanda.harris@company.com','Accountant','Finance','2019-01-07','1986-08-12',NULL,'ACTIVE','2026-02-27 13:37:20','2026-02-28 08:35:22'),(32,'EMP017','Matthew','Clark','matthew.clark@company.com','Business Analyst','Product','2021-10-18','1989-09-25',NULL,'ACTIVE','2026-02-27 13:37:20','2026-02-28 08:35:22'),(33,'EMP018','Ashley','Lewis','ashley.lewis@company.com','Social Media Manager','Marketing','2022-09-22',NULL,13,'ACTIVE','2026-02-27 13:37:20','2026-03-17 03:55:53'),(34,'EMP019','Joshua','Walker','joshua.walker@company.com','Systems Administrator','IT','2020-05-15',NULL,NULL,'ACTIVE','2026-02-27 13:37:20','2026-02-27 13:37:20'),(35,'EMP020','Stephanie','Hall','stephanie.hall@company.com','Customer Success Manager','Sales','2019-12-03',NULL,NULL,'ACTIVE','2026-02-27 13:37:20','2026-02-27 13:37:20'),(36,'EMP0040','Raja','Daivam','r.daivam@ieee.org','Lead Developer','IT','2026-02-28',NULL,5,'ACTIVE','2026-02-27 21:28:43','2026-03-16 05:07:05'),(37,'214155','Ranjita','Ambali','r.ambali@ieee.org','IT Intern','IT','2026-03-10',NULL,4,'ACTIVE','2026-03-05 03:24:57','2026-03-16 05:06:34');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 16:42:13

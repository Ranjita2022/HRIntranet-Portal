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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoutouts`
--

LOCK TABLES `shoutouts` WRITE;
/*!40000 ALTER TABLE `shoutouts` DISABLE KEYS */;
INSERT INTO `shoutouts` VALUES (1,'John Smith','Sarah Johnson','Thank you for your amazing help on the project! Your dedication is inspiring.','Teamwork',1,1,'2026-03-02 13:15:36','2026-03-02 13:15:36','admin'),(2,'Emily Davis','Michael Brown','Great job on the presentation! You knocked it out of the park!','Excellence',1,1,'2026-03-02 13:15:36','2026-03-02 13:15:36','admin'),(3,'David Wilson','Jennifer Garcia','Your innovative solution saved us hours of work. You\'re a star!','Innovation',1,1,'2026-03-02 13:15:36','2026-03-02 13:15:36','admin'),(4,'Lisa Anderson','James Martinez','Thanks for always being so helpful and positive. You make work fun!','Appreciation',1,1,'2026-03-02 13:15:36','2026-03-02 13:15:36','admin'),(5,'Robert Thomas','Patricia Rodriguez','Your attention to detail is incredible. Thanks for catching that error!','Excellence',1,1,'2026-03-02 13:15:36','2026-03-02 13:15:36','admin'),(6,'Raja Daivam','Joshua Walker','test','Teamwork',0,1,'2026-03-02 08:18:29',NULL,NULL),(7,'Raja Daivam','David Park','Testing welcome','Appreciation',0,1,'2026-03-02 08:47:29',NULL,NULL),(8,'Raja Daivam','Jessica Williams','she did very good job','Teamwork',0,1,'2026-03-02 22:21:09',NULL,NULL),(9,'Daniel Garcia','Kevin White','test','Appreciation',0,1,'2026-03-03 00:05:13',NULL,NULL),(10,'Amanda Brown','Amanda Harris','Good innovation','Innovation',0,1,'2026-03-11 03:18:20',NULL,NULL);
/*!40000 ALTER TABLE `shoutouts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 16:38:25

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carousel_slides`
--

LOCK TABLES `carousel_slides` WRITE;
/*!40000 ALTER TABLE `carousel_slides` DISABLE KEYS */;
INSERT INTO `carousel_slides` VALUES (1,'Welcome to 2026!','Celebrating another amazing year together as a team',NULL,'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop',1,1,NULL,'2026-02-27 09:50:24','2026-03-24 04:46:41'),(2,'Annual Company Retreat 2025','Thank you to everyone who joined our mountain retreat last month!',NULL,'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&h=600&fit=crop',2,0,NULL,'2026-02-27 09:50:24','2026-03-18 04:13:06'),(3,'Innovation Award 2026','Congratulations to our R&D team for winning the Innovation Excellence Award',NULL,'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',3,1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(4,'Community Service Day','Our team volunteered 500+ hours this quarter. Making a difference together!',NULL,'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=600&fit=crop',4,1,NULL,'2026-02-27 09:50:24','2026-02-27 09:50:24'),(5,'Celebrating Our Team','Meet our amazing employees who make everything possible',NULL,'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=600&fit=crop',5,0,NULL,'2026-02-27 09:50:24','2026-03-18 04:11:46'),(6,'Welcome to IEEE HR Portal','Your gateway to company resources, announcements, and employee information',NULL,'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop',1,1,'admin','2026-02-28 03:24:08','2026-03-24 04:46:33'),(7,'Innovation and Excellence','Advancing Technology for Humanity - Join our mission to make a difference',NULL,'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop',2,1,'admin','2026-02-28 03:24:08','2026-02-28 03:24:08'),(8,'Team Collaboration','Working together to achieve groundbreaking results in electrical and electronics engineering',NULL,'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=600&fit=crop',3,0,'admin','2026-02-28 03:24:08','2026-03-18 04:13:12'),(9,'Professional Development','Continuous learning and growth opportunities for all IEEE members',NULL,'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=600&fit=crop',4,0,'admin','2026-02-28 03:24:08','2026-03-18 04:11:58'),(10,'Global Network','Connect with professionals worldwide through IEEE community',NULL,'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop',5,0,'admin','2026-02-28 03:24:08','2026-03-18 04:11:52'),(11,'Annual IEEE picnic','Enjoyed the day and had a meal',14,NULL,4,1,'admin','2026-03-24 04:14:34','2026-03-24 04:42:44'),(12,'ECHO Session','Everyone had a great day',15,NULL,0,1,'admin','2026-03-24 05:00:23','2026-03-24 05:00:23'),(13,'Townhall Meeting','Had a discussion with all departments',16,NULL,0,1,'admin','2026-03-24 05:02:41','2026-03-24 05:02:41');
/*!40000 ALTER TABLE `carousel_slides` ENABLE KEYS */;
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

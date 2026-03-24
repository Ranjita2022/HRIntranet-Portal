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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 16:38:22

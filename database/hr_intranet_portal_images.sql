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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `images`
--

LOCK TABLES `images` WRITE;
/*!40000 ALTER TABLE `images` DISABLE KEYS */;
INSERT INTO `images` VALUES (1,'kevin-white-profile.jpg','kevin-white-profile.jpg','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&face=1',0,'image/jpeg',NULL,NULL,'EMPLOYEE_PROFILE','system','2026-02-28 04:14:14'),(2,'raja-daivam-profile.jpg','raja-daivam-profile.jpg','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&face=1',0,'image/jpeg',NULL,NULL,'EMPLOYEE_PROFILE','system','2026-02-28 04:14:14'),(3,'35f641b7-0e2c-446b-85a4-6d73b5d240dd.jpg','IEEE Staffs.jpg','uploads\\images\\35f641b7-0e2c-446b-85a4-6d73b5d240dd.jpg',247520,'image/jpeg',1000,800,'ANNOUNCEMENT','admin','2026-03-12 23:01:29'),(4,'7c387985-2242-4450-bbd4-00da12067430.jpg','female.jpg','uploads\\images\\7c387985-2242-4450-bbd4-00da12067430.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-03-16 05:06:34'),(5,'4cbc01a3-cc42-48ed-87ac-0ee979627ed9.jpg','male.jpg','uploads\\images\\4cbc01a3-cc42-48ed-87ac-0ee979627ed9.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-03-16 05:07:05'),(6,'4e958e14-31d9-4185-bddc-01b10ec77210.jpg','female.jpg','uploads\\images\\4e958e14-31d9-4185-bddc-01b10ec77210.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-03-16 05:07:43'),(7,'9c4bfb4e-7159-4bd4-a2fc-643d799012bb.jpg','male.jpg','uploads\\images\\9c4bfb4e-7159-4bd4-a2fc-643d799012bb.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-03-16 05:08:01'),(8,'428892d9-91aa-425f-af5f-d2e4668764af.jpg','male.jpg','uploads\\images\\428892d9-91aa-425f-af5f-d2e4668764af.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-03-16 05:08:18'),(9,'c142ee74-0302-451b-8a55-4e246dfa065d.jpg','male.jpg','uploads\\images\\c142ee74-0302-451b-8a55-4e246dfa065d.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-03-16 05:44:31'),(10,'0e6c1df5-4414-487d-9bad-b46bc8e98e77.jpg','female.jpg','uploads\\images\\0e6c1df5-4414-487d-9bad-b46bc8e98e77.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-03-16 05:44:53'),(11,'2483ea57-0753-4a3e-b081-5c4aad88c3d9.jpg','female.jpg','uploads\\images\\2483ea57-0753-4a3e-b081-5c4aad88c3d9.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-03-16 05:45:27'),(12,'f436c507-8571-4b7a-9c90-34af5b014635.jpg','male.jpg','uploads\\images\\f436c507-8571-4b7a-9c90-34af5b014635.jpg',29935,'image/jpeg',978,980,'EMPLOYEE_PROFILE','admin','2026-03-17 03:54:40'),(13,'9b5628c1-ce09-4f0f-bac6-b427151e2791.jpg','female.jpg','uploads\\images\\9b5628c1-ce09-4f0f-bac6-b427151e2791.jpg',29578,'image/jpeg',540,360,'EMPLOYEE_PROFILE','admin','2026-03-17 03:55:53'),(14,'77a3ae46-0148-4122-8a47-5546ecf0e522.jpg','IEEE team.jpg','uploads\\images\\77a3ae46-0148-4122-8a47-5546ecf0e522.jpg',346326,'image/jpeg',1000,800,'CAROUSEL','admin','2026-03-24 04:14:34'),(15,'80a9a269-a8b4-4af4-9a5b-1e947a1bccc2.jpg','Echo session.jpg','uploads\\images\\80a9a269-a8b4-4af4-9a5b-1e947a1bccc2.jpg',2797787,'image/jpeg',4000,3000,'CAROUSEL','admin','2026-03-24 05:00:23'),(16,'870d243c-84d8-4bd2-986c-b8613b0eeca9.jpeg','townhall.jpeg','uploads\\images\\870d243c-84d8-4bd2-986c-b8613b0eeca9.jpeg',285457,'image/jpeg',1200,1600,'CAROUSEL','admin','2026-03-24 05:02:41');
/*!40000 ALTER TABLE `images` ENABLE KEYS */;
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

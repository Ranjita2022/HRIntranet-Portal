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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 16:38:27

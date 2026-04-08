-- --------------------------------------------------------
-- Table: work_anniversaries
-- --------------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `work_anniversaries`;

CREATE TABLE `work_anniversaries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `employee_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `anniversary_year` int NOT NULL,
  `anniversary_date` date NOT NULL,
  `announcement_id` int DEFAULT NULL,
  `is_notified` tinyint(1) NOT NULL DEFAULT '0',
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_work_anniversaries_employee` (`employee_id`),
  KEY `idx_work_anniversaries_date` (`anniversary_date`),
  CONSTRAINT `fk_work_anniversaries_employee`
    FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_work_anniversaries_announcement`
    FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================
-- HR Intranet Portal - Suggestions Table
-- ============================================================
CREATE TABLE IF NOT EXISTS suggestions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    submitter_name  VARCHAR(100)    NULL COMMENT 'NULL when anonymous',
    is_anonymous    TINYINT(1)      NOT NULL DEFAULT 0,
    category        ENUM('WORKPLACE','BENEFITS','CULTURE','PROCESS','TECHNOLOGY','OTHER')
                                    NOT NULL DEFAULT 'OTHER',
    suggestion_text TEXT            NOT NULL,
    status          ENUM('NEW','REVIEWED','IMPLEMENTED','DISMISSED')
                                    NOT NULL DEFAULT 'NEW',
    admin_notes     TEXT            NULL,
    reviewed_at     DATETIME        NULL,
    reviewed_by     VARCHAR(100)    NULL,
    submitted_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


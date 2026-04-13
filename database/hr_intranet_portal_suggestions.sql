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
    admin_notes     TEXT            NULL COMMENT 'Internal — not shown publicly',
    public_note     VARCHAR(500)    NULL COMMENT 'HR response shown on public status board',
    reviewed_at     DATETIME        NULL,
    reviewed_by     VARCHAR(100)    NULL,
    submitted_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add public_note if upgrading an existing installation (MySQL 8.0+)
-- If on older MySQL, run manually: ALTER TABLE suggestions ADD COLUMN public_note VARCHAR(500) NULL AFTER admin_notes;
-- ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS public_note VARCHAR(500) NULL AFTER admin_notes;



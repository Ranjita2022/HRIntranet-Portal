-- Create open_positions table
CREATE TABLE IF NOT EXISTS open_positions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requisition_id VARCHAR(50) UNIQUE,
    requisition_title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    posting_date DATE NOT NULL,
    closing_date DATE,
    description TEXT,
    requirements TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'ON_HOLD')),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_posting_date (posting_date),
    INDEX idx_is_published (is_published)
);

-- Insert sample data for testing
INSERT INTO open_positions (requisition_id, requisition_title, location, posting_date, status, is_published) VALUES
('FM001', 'Conference Finance Senior Manager', 'United States-New Jersey-Piscataway', '2026-03-12', 'OPEN', TRUE),
('E3480', 'Scrum Master (E3480)', 'United States-New Jersey-Piscataway', '2026-03-12', 'OPEN', TRUE),
('E6088', 'Data Governance Analyst (E6088)', 'United States-New Jersey-Piscataway', '2026-03-11', 'OPEN', TRUE),
('N0557', 'Mbr Ops Assoc II (N0557)', 'United States-New Jersey-Piscataway', '2026-03-11', 'OPEN', TRUE),
('SG001', 'Director, Strategic Giving', 'United States-New Jersey-Piscataway', '2026-03-10', 'OPEN', TRUE);

-- Add any indexes needed
CREATE INDEX idx_posting_date_published ON open_positions(posting_date DESC, is_published);

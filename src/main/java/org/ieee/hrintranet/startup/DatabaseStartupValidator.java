package org.ieee.hrintranet.startup;

import org.ieee.hrintranet.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseStartupValidator implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseStartupValidator.class);
    
    private final EmployeeRepository employeeRepository;
    private final AnnouncementRepository announcementRepository;
    private final CarouselSlideRepository carouselSlideRepository;
    private final GalleryImageRepository galleryImageRepository;
    private final QuickLinkRepository quickLinkRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final JdbcTemplate jdbcTemplate;
    
    @Override
    public void run(String... args) throws Exception {
        printDatabaseValidation();
    }
    
    private void printDatabaseValidation() {
        logger.info("");
        logger.info("========================================");
        logger.info("   DATABASE CONNECTION TEST RESULTS");
        logger.info("========================================");
        
        try {
            // Count records in all tables
            long employeeCount = employeeRepository.count();
            long announcementCount = announcementRepository.count();
            long workAnniversaryCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM work_anniversaries", Long.class);
            long carouselCount = carouselSlideRepository.count();
            long galleryCount = galleryImageRepository.count();
            long quickLinkCount = quickLinkRepository.count();
            long emergencyContactCount = emergencyContactRepository.count();
            
            logger.info("✓ Database: hr_intranet_portal");
            logger.info("✓ All tables accessible");
            logger.info("");
            logger.info("Table Record Counts:");
            logger.info("  └─ employees: {}", employeeCount);
            logger.info("  └─ announcements: {}", announcementCount);
            logger.info("  └─ work_anniversaries: {}", workAnniversaryCount);
            logger.info("  └─ carousel_slides: {}", carouselCount);
            logger.info("  └─ gallery_images: {}", galleryCount);
            logger.info("  └─ quick_links: {}", quickLinkCount);
            logger.info("  └─ emergency_contacts: {}", emergencyContactCount);
            logger.info("");
            
            // Validation checks
            boolean allValid = true;
            
            if (employeeCount != 15) {
                logger.warn("⚠ Expected 15 employees, found {}", employeeCount);
                allValid = false;
            } else {
                logger.info("✓ Employee count: {} (Expected: 15)", employeeCount);
            }
            
            if (announcementCount < 13) {
                logger.warn("⚠ Expected at least 13 announcements, found {}", announcementCount);
                allValid = false;
            } else {
                logger.info("✓ Announcement count: {} (Expected: 13+)", announcementCount);
            }
            
            if (workAnniversaryCount != 12) {
                logger.warn("⚠ Expected 12 work anniversaries, found {}", workAnniversaryCount);
                allValid = false;
            } else {
                logger.info("✓ Work anniversary count: {} (Expected: 12)", workAnniversaryCount);
            }
            
            if (carouselCount != 5) {
                logger.warn("⚠ Expected 5 carousel slides, found {}", carouselCount);
                allValid = false;
            } else {
                logger.info("✓ Carousel slide count: {} (Expected: 5)", carouselCount);
            }
            
            if (galleryCount != 20) {
                logger.warn("⚠ Expected 20 gallery images, found {}", galleryCount);
                allValid = false;
            } else {
                logger.info("✓ Gallery image count: {} (Expected: 20)", galleryCount);
            }
            
            logger.info("");
            
            if (allValid) {
                logger.info("========================================");
                logger.info("   ✓✓✓ ALL VALIDATIONS PASSED! ✓✓✓");
                logger.info("========================================");
                logger.info("Backend is ready to serve requests");
                logger.info("API Endpoints:");
                logger.info("  • Health: http://localhost:8080/api/public/health");
                logger.info("  • Portal Data: http://localhost:8080/api/public/portal-data");
            } else {
                logger.warn("========================================");
                logger.warn("   ⚠ VALIDATION WARNINGS DETECTED");
                logger.warn("========================================");
                logger.warn("Check database import - some counts don't match expected values");
            }
            
            logger.info("========================================");
            logger.info("");
            
        } catch (Exception e) {
            logger.error("========================================");
            logger.error("   ✗ DATABASE VALIDATION FAILED");
            logger.error("========================================");
            logger.error("Error connecting to database: {}", e.getMessage());
            logger.error("Please check database connection settings");
            logger.error("========================================");
            logger.error("");
        }
    }
}

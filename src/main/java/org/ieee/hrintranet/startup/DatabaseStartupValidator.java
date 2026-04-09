package org.ieee.hrintranet.startup;

import org.ieee.hrintranet.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseStartupValidator implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseStartupValidator.class);

    /** Injected from application.properties / profile — no hardcoded URLs. */
    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    private final EmployeeRepository employeeRepository;
    private final AnnouncementRepository announcementRepository;
    private final CarouselSlideRepository carouselSlideRepository;
    private final GalleryImageRepository galleryImageRepository;
    private final QuickLinkRepository quickLinkRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    // JdbcTemplate removed — no raw SQL queries needed

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
            logger.info("  └─ carousel_slides: {}", carouselCount);
            logger.info("  └─ gallery_images: {}", galleryCount);
            logger.info("  └─ quick_links: {}", quickLinkCount);
            logger.info("  └─ emergency_contacts: {}", emergencyContactCount);
            logger.info("");
            
            // Validation checks
            boolean allValid = true;
            
            if (employeeCount < 1) {
                logger.warn("⚠ No employees found in database");
                allValid = false;
            } else {
                logger.info("✓ Employee count: {}", employeeCount);
            }
            
            if (announcementCount < 1) {
                logger.warn("⚠ No announcements found in database");
                allValid = false;
            } else {
                logger.info("✓ Announcement count: {}", announcementCount);
            }
            
            if (carouselCount != 5) {
                logger.warn("⚠ Expected 5 carousel slides, found {}", carouselCount);
                allValid = false;
            } else {
                logger.info("✓ Gallery image count: {}", galleryCount);
            }
            
            logger.info("");
            
            if (allValid) {
                logger.info("========================================");
                logger.info("   ✓✓✓ ALL VALIDATIONS PASSED! ✓✓✓");
                logger.info("========================================");
                logger.info("Backend is ready to serve requests");
                logger.info("API Endpoints:");
                logger.info("  • Health:      {}/api/public/health",       appBaseUrl);
                logger.info("  • Portal Data: {}/api/public/portal-data",  appBaseUrl);
                logger.info("  • Config:      {}/api/public/config",        appBaseUrl);
            } else {
                logger.warn("========================================");
                logger.warn("   ⚠ VALIDATION WARNINGS DETECTED");
                logger.warn("========================================");
                logger.warn("Check database import - some tables appear empty");
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

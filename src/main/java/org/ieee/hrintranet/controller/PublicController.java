package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.*;
import org.ieee.hrintranet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicController {
    
    private final EmployeeRepository employeeRepository;
    private final AnnouncementRepository announcementRepository;
    private final HolidayRepository holidayRepository;
    private final CarouselSlideRepository carouselSlideRepository;
    private final org.ieee.hrintranet.repository.GalleryImageRepository galleryImageRepository;
    private final org.ieee.hrintranet.repository.GalleryFolderRepository galleryFolderRepository;
    private final org.ieee.hrintranet.repository.QuickLinkRepository quickLinkRepository;
    private final org.ieee.hrintranet.repository.EmergencyContactRepository emergencyContactRepository;
    
    @GetMapping("/portal-data")
    public ResponseEntity<Map<String, Object>> getPortalData(
            @RequestParam(defaultValue = "6") int maxJoiners,
            @RequestParam(defaultValue = "5") int maxHolidays,
            @RequestParam(defaultValue = "10") int maxAnnouncements,
            @RequestParam(defaultValue = "2000") int maxCarousel) {
        
        Map<String, Object> response = new HashMap<>();
        
        // Get recent joiners (within 30 days of their start date)
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);
        List<Employee> recentJoiners = employeeRepository.findAll().stream()
                .filter(emp -> emp.getStatus() == Employee.EmployeeStatus.ACTIVE)
                .filter(emp -> !emp.getStartDate().isBefore(thirtyDaysAgo) && !emp.getStartDate().isAfter(today))
                .sorted((e1, e2) -> e2.getStartDate().compareTo(e1.getStartDate()))
                .limit(maxJoiners)
                .collect(Collectors.toList());
        
        List<Map<String, Object>> joiners = recentJoiners.stream().map(emp -> {
            Map<String, Object> joiner = new HashMap<>();
            joiner.put("ID", emp.getId());
            joiner.put("Type", "joiner");
            joiner.put("Title", "Welcome " + emp.getFullName() + " to Our Team!");
            joiner.put("Name", emp.getFullName());
            joiner.put("Position", emp.getPosition());
            joiner.put("Department", emp.getDepartment());
            joiner.put("StartDate", emp.getStartDate().toString());
            joiner.put("Date", "");
            joiner.put("Description", "We are excited to welcome " + emp.getFullName() + 
                                     " as our new " + emp.getPosition() + ".");
            String joinerImageUrl = "";
            if (emp.getProfileImage() != null) {
                if (emp.getProfileImage().getFilePath() != null && emp.getProfileImage().getFilePath().startsWith("http")) {
                    joinerImageUrl = emp.getProfileImage().getFilePath();
                } else {
                    joinerImageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                            .path("/api/uploads/")
                            .path(emp.getProfileImage().getFilename())
                            .toUriString();
                }
            }
            joiner.put("ImageURL", joinerImageUrl);
            return joiner;
        }).collect(Collectors.toList());
        
        // Get upcoming holidays
        LocalDate sixMonthsLater = today.plusDays(180);
        List<Holiday> upcomingHolidays = holidayRepository.findUpcomingHolidays(today, sixMonthsLater)
                .stream()
                .limit(maxHolidays)
                .collect(Collectors.toList());
        
        List<Map<String, Object>> holidays = upcomingHolidays.stream().map(holiday -> {
            Map<String, Object> h = new HashMap<>();
            h.put("ID", holiday.getId());
            h.put("Type", "holiday");
            h.put("Title", holiday.getTitle());
            h.put("Name", "");
            h.put("Position", "");
            h.put("Department", "");
            h.put("StartDate", "");
            h.put("Date", holiday.getHolidayDate().toString());
            h.put("Description", holiday.getDescription() != null ? holiday.getDescription() : "");
            h.put("ImageURL", "");
            return h;
        }).collect(Collectors.toList());
        
        // Get active announcements (published within last 30 days, excluding events)
        List<Announcement> activeAnnouncements = announcementRepository.findAll().stream()
                .filter(ann -> ann.getIsActive())
                .filter(ann -> ann.getType() != Announcement.AnnouncementType.EVENT)  // Exclude events
                .filter(ann -> !ann.getPublishDate().isBefore(thirtyDaysAgo) && !ann.getPublishDate().isAfter(today))
                .sorted((a1, a2) -> a2.getPublishDate().compareTo(a1.getPublishDate()))
                .limit(maxAnnouncements)
                .collect(Collectors.toList());
        
        // Get active events (show future events and past 30 days)
        LocalDate thirtyDaysFromNow = today.plusDays(30);
        List<Map<String, Object>> events = announcementRepository.findAll().stream()
                .filter(ann -> ann.getIsActive())
                .filter(ann -> ann.getType() == Announcement.AnnouncementType.EVENT)
                .filter(ann -> !ann.getPublishDate().isAfter(thirtyDaysFromNow))  // Show events up to 30 days in future
                .sorted((a1, a2) -> a1.getPublishDate().compareTo(a2.getPublishDate()))  // Sort by date ascending
                .map(ann -> {
                    Map<String, Object> e = new HashMap<>();
                    e.put("ID", ann.getId());
                    e.put("Type", ann.getType().toString());
                    e.put("Title", ann.getTitle());
                    e.put("Date", ann.getPublishDate().toString());
                    e.put("Description", ann.getDescription() != null ? ann.getDescription() : "");
                        String eventImageUrl = ann.getImage() != null ?
                            ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/uploads/")
                                .path(ann.getImage().getFilename()).toUriString() : "";
                        e.put("ImageURL", eventImageUrl);
                    return e;
                }).collect(Collectors.toList());
        
        List<Map<String, Object>> announcements = activeAnnouncements.stream()
                .map(ann -> {
                    Map<String, Object> a = new HashMap<>();
                    a.put("ID", ann.getId());
                    a.put("Type", ann.getType().toString());
                    a.put("Title", ann.getTitle());
                    a.put("Name", "");
                    a.put("Position", "");
                    a.put("Department", "");
                    a.put("StartDate", "");
                    a.put("Date", ann.getPublishDate().toString());
                    a.put("Description", ann.getDescription() != null ? ann.getDescription() : "");
                        String annImageUrl = ann.getImage() != null ?
                            ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/uploads/")
                                .path(ann.getImage().getFilename()).toUriString() : "";
                        a.put("ImageURL", annImageUrl);
                    a.put("Priority", ann.getPriority());
                    return a;
                }).collect(Collectors.toList());
        
        // Get breaking news
        List<Announcement> breakingNews = announcementRepository.findBreakingNews(today);
        List<Map<String, Object>> breaking = breakingNews.stream().map(ann -> {
            Map<String, Object> b = new HashMap<>();
            b.put("ID", ann.getId());
            b.put("Type", "breaking");
            b.put("Title", ann.getTitle());
            b.put("Description", ann.getDescription() != null ? ann.getDescription() : "");
            return b;
        }).collect(Collectors.toList());
        
        // Get active carousel slides
        List<CarouselSlide> carouselSlides = carouselSlideRepository
                .findByIsActiveOrderByDisplayOrderAscCreatedAtDesc(true)
                .stream()
                .limit(maxCarousel)
                .collect(Collectors.toList());
        
        List<Map<String, Object>> carousel = carouselSlides.stream().map(slide -> {
            Map<String, Object> c = new HashMap<>();
            c.put("ID", slide.getId());
            c.put("Title", slide.getTitle() != null ? slide.getTitle() : "");
            c.put("Subtitle", slide.getSubtitle() != null ? slide.getSubtitle() : "");
            String slideImageUrl = "";
            if (slide.getImage() != null) {
                slideImageUrl = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/uploads/")
                        .path(slide.getImage().getFilename()).toUriString();
            } else if (slide.getImageUrl() != null) {
                slideImageUrl = slide.getImageUrl();
            }
            c.put("ImageURL", slideImageUrl);
            c.put("DisplayOrder", slide.getDisplayOrder());
            return c;
        }).collect(Collectors.toList());
        
        // Calculate work anniversaries dynamically from employee start dates (if in current month, show until month end)
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());
        List<Map<String, Object>> celebrations = new java.util.ArrayList<>();
        
        // Get all active employees for calculating work anniversaries and birthdays
        List<Employee> allActiveEmployees = employeeRepository.findAll().stream()
                .filter(emp -> emp.getStatus() == Employee.EmployeeStatus.ACTIVE)
                .collect(Collectors.toList());
        
        // Calculate work anniversaries dynamically for all active employees
        // Show only the HIGHEST/MOST RECENT anniversary milestone reached
        // Data is derived directly from employee start dates for this endpoint.
        for (Employee emp : allActiveEmployees) {
            LocalDate startDate = emp.getStartDate();
            if (startDate == null || startDate.isAfter(today)) continue;
            
            // Calculate years of service (complete years passed)
            int yearsOfService = today.getYear() - startDate.getYear();
            
            // Adjust if anniversary hasn't occurred yet this year
            if (today.getMonthValue() < startDate.getMonthValue() || 
                (today.getMonthValue() == startDate.getMonthValue() && today.getDayOfMonth() < startDate.getDayOfMonth())) {
                yearsOfService--;
            }
            
            // Show only the HIGHEST milestone (not all prior ones)
            if (yearsOfService >= 1) {
                LocalDate anniversaryDate = startDate.plusYears(yearsOfService);
                
                // Include in celebrations if anniversary date falls within the current MONTH (1st to last day)
                // This includes anniversaries that already happened this month
                LocalDate startOfMonth = today.withDayOfMonth(1);
                if (!anniversaryDate.isBefore(startOfMonth) && !anniversaryDate.isAfter(endOfMonth)) {
                    Map<String, Object> anniversary = new HashMap<>();
                    anniversary.put("ID", emp.getId() + "-anniversary-" + yearsOfService);
                    anniversary.put("Type", "anniversary");
                    anniversary.put("Name", emp.getFullName());
                    anniversary.put("Date", anniversaryDate.toString());
                    anniversary.put("Years", yearsOfService);
                    anniversary.put("Department", emp.getDepartment());
                    String annImg = "";
                    if (emp.getProfileImage() != null) {
                        if (emp.getProfileImage().getFilePath() != null && emp.getProfileImage().getFilePath().startsWith("http")) {
                            annImg = emp.getProfileImage().getFilePath();
                        } else {
                            annImg = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/uploads/")
                                    .path(emp.getProfileImage().getFilename()).toUriString();
                        }
                    }
                    anniversary.put("ImageURL", annImg);
                    celebrations.add(anniversary);
                }
            }
        }
        
        // Calculate and add birthdays that fall within the CURRENT MONTH (1st through month end)
        for (Employee emp : allActiveEmployees) {
            if (emp.getBirthDate() == null) continue;

            LocalDate birthDate = emp.getBirthDate();

            // Safe construction of birthday in current year (handles Feb 29 -> Feb 28 on non-leap years)
            int year = today.getYear();
            int monthVal = birthDate.getMonthValue();
            int dayVal = birthDate.getDayOfMonth();
            int maxDay = java.time.Month.of(monthVal).length(java.time.Year.isLeap(year));
            int daySafe = Math.min(dayVal, maxDay);
            LocalDate birthdayThisYear = LocalDate.of(year, monthVal, daySafe);

            LocalDate startOfMonth = today.withDayOfMonth(1);

            // Include if birthdayThisYear falls within current month (including days earlier than today)
            if (!birthdayThisYear.isBefore(startOfMonth) && !birthdayThisYear.isAfter(endOfMonth)) {
                Map<String, Object> birthday = new HashMap<>();
                birthday.put("ID", emp.getId() + "-birthday");
                birthday.put("Type", "birthday");
                birthday.put("Name", emp.getFullName());
                birthday.put("Date", birthdayThisYear.toString());
                birthday.put("Department", emp.getDepartment());
                String bImg = "";
                if (emp.getProfileImage() != null) {
                    if (emp.getProfileImage().getFilePath() != null && emp.getProfileImage().getFilePath().startsWith("http")) {
                        bImg = emp.getProfileImage().getFilePath();
                    } else {
                        bImg = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/uploads/")
                                .path(emp.getProfileImage().getFilename()).toUriString();
                    }
                }
                birthday.put("ImageURL", bImg);
                celebrations.add(birthday);
            }
        }
        
        response.put("joiners", joiners);
        response.put("holidays", holidays);
        response.put("announcements", announcements);
        response.put("events", events);
        response.put("carousel", carousel);
        response.put("breakingNews", breaking);
        response.put("celebrations", celebrations);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/gallery/random")
    public ResponseEntity<List<Map<String, Object>>> getRandomGalleryImages(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String category) {
        
        List<org.ieee.hrintranet.entity.GalleryImage> galleryImages;
        
        if (category != null && !category.isEmpty()) {
            galleryImages = galleryImageRepository.findRandomActiveImagesByCategory(category, limit);
        } else {
            galleryImages = galleryImageRepository.findRandomActiveImages(limit);
        }
        
        List<Map<String, Object>> gallery = galleryImages.stream().map(img -> {
            Map<String, Object> g = new HashMap<>();
            g.put("ID", img.getId());
            g.put("Title", img.getTitle() != null ? img.getTitle() : "");
            g.put("Description", img.getDescription() != null ? img.getDescription() : "");
            g.put("Category", img.getCategory() != null ? img.getCategory() : "general");
            g.put("ImageURL", img.getImage() != null ? 
                             "/api/uploads/" + img.getImage().getFilename() : 
                             (img.getImageUrl() != null ? img.getImageUrl() : ""));
            return g;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(gallery);
    }
    
    @GetMapping("/gallery/categories")
    public ResponseEntity<List<String>> getGalleryCategories() {
        return ResponseEntity.ok(galleryImageRepository.findAllActiveCategories());
    }
    
    @GetMapping("/quick-links")
    public ResponseEntity<List<Map<String, Object>>> getQuickLinks(
            @RequestParam(required = false) String category) {
        
        List<org.ieee.hrintranet.entity.QuickLink> quickLinks;
        
        if (category != null && !category.isEmpty()) {
            quickLinks = quickLinkRepository.findByCategoryAndIsActiveOrderByDisplayOrderAscCreatedAtDesc(category, true);
        } else {
            quickLinks = quickLinkRepository.findByIsActiveOrderByDisplayOrderAscCreatedAtDesc(true);
        }
        
        List<Map<String, Object>> links = quickLinks.stream().map(link -> {
            Map<String, Object> l = new HashMap<>();
            l.put("ID", link.getId());
            l.put("Title", link.getTitle());
            l.put("URL", link.getUrl());
            l.put("Description", link.getDescription() != null ? link.getDescription() : "");
            l.put("Icon", link.getIcon() != null ? link.getIcon() : "bi-link-45deg");
            l.put("Category", link.getCategory() != null ? link.getCategory() : "general");
            l.put("OpenInNewTab", link.getOpenInNewTab());
            l.put("DisplayOrder", link.getDisplayOrder());
            return l;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(links);
    }
    
    @GetMapping("/quick-links/categories")
    public ResponseEntity<List<String>> getQuickLinkCategories() {
        return ResponseEntity.ok(quickLinkRepository.findAllActiveCategories());
    }
    
    @GetMapping("/emergency-contacts")
    public ResponseEntity<List<Map<String, Object>>> getEmergencyContacts(
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "false") boolean emergencyOnly) {
        
        List<org.ieee.hrintranet.entity.EmergencyContact> contacts;
        
        if (emergencyOnly) {
            contacts = emergencyContactRepository.findByIsEmergencyAndIsActiveOrderByDisplayOrderAscCreatedAtDesc(true, true);
        } else if (type != null && !type.isEmpty()) {
            try {
                org.ieee.hrintranet.entity.EmergencyContact.ContactType contactType = 
                    org.ieee.hrintranet.entity.EmergencyContact.ContactType.valueOf(type.toUpperCase());
                contacts = emergencyContactRepository.findByTypeAndIsActiveOrderByDisplayOrderAscCreatedAtDesc(contactType, true);
            } catch (IllegalArgumentException e) {
                contacts = emergencyContactRepository.findByIsActiveOrderByDisplayOrderAscCreatedAtDesc(true);
            }
        } else {
            contacts = emergencyContactRepository.findByIsActiveOrderByDisplayOrderAscCreatedAtDesc(true);
        }
        
        List<Map<String, Object>> contactList = contacts.stream().map(contact -> {
            Map<String, Object> c = new HashMap<>();
            c.put("ID", contact.getId());
            c.put("Title", contact.getTitle());
            c.put("ContactName", contact.getContactName());
            c.put("PhoneNumber", contact.getPhoneNumber());
            c.put("Email", contact.getEmail() != null ? contact.getEmail() : "");
            c.put("Description", contact.getDescription() != null ? contact.getDescription() : "");
            c.put("Type", contact.getType().toString());
            c.put("IsEmergency", contact.getIsEmergency());
            c.put("DisplayOrder", contact.getDisplayOrder());
            return c;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(contactList);
    }
    
    @GetMapping("/gallery/folders")
    public ResponseEntity<List<Map<String, Object>>> getActiveGalleryFolders() {
        List<org.ieee.hrintranet.entity.GalleryFolder> folders = 
                galleryFolderRepository.findByIsActiveOrderByDisplayOrderAsc(true);
        
        List<Map<String, Object>> folderList = folders.stream().map(folder -> {
            Map<String, Object> f = new HashMap<>();
            f.put("id", folder.getId());
            f.put("folderName", folder.getFolderName());
            f.put("displayTitle", folder.getDisplayTitle());
            f.put("description", folder.getDescription());
            f.put("folderPath", folder.getFolderPath());
            f.put("photoCount", folder.getPhotoCount());
            f.put("displayOrder", folder.getDisplayOrder());
            return f;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(folderList);
    }
    
    @GetMapping("/employees")
    public ResponseEntity<List<Map<String, String>>> getActiveEmployees() {
        List<Employee> activeEmployees = employeeRepository.findAll().stream()
                .filter(emp -> emp.getStatus() == Employee.EmployeeStatus.ACTIVE)
                .sorted((e1, e2) -> e1.getFullName().compareTo(e2.getFullName()))
                .collect(Collectors.toList());
        
        List<Map<String, String>> employees = activeEmployees.stream().map(emp -> {
            Map<String, String> employee = new HashMap<>();
            employee.put("id", emp.getId().toString());
            employee.put("name", emp.getFullName());
            employee.put("department", emp.getDepartment());
            employee.put("position", emp.getPosition());
            return employee;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(employees);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("message", "HR Intranet Portal API is running");
        status.put("timestamp", LocalDate.now().toString());
        return ResponseEntity.ok(status);
    }
}

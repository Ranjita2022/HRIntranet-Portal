package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.*;
import org.ieee.hrintranet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Comparator;
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

    @Value("${app.gallery.dir:src/main/webapp/images/gallery}")
    private String galleryDir;
    
    @GetMapping("/portal-data")
    public ResponseEntity<Map<String, Object>> getPortalData(
            @RequestParam(defaultValue = "8") int maxJoiners,
            @RequestParam(defaultValue = "50") int maxHolidays,
            @RequestParam(defaultValue = "10") int maxAnnouncements,
            @RequestParam(defaultValue = "2000") int maxCarousel) {
        
        Map<String, Object> response = new HashMap<>();
        
        // Get recent joiners (within 30 days of their start date)
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);
        List<Employee> recentJoiners = employeeRepository.findAll().stream()
                .filter(emp -> emp.getStatus() == Employee.EmployeeStatus.ACTIVE)
            .filter(emp -> emp.getStartDate() != null)
                .filter(emp -> !emp.getStartDate().isBefore(thirtyDaysAgo) && !emp.getStartDate().isAfter(today))
                .sorted((e1, e2) -> e2.getStartDate().compareTo(e1.getStartDate()))
                .limit(maxJoiners)
                .toList();

        List<Map<String, Object>> joiners = recentJoiners.stream().map(emp -> {
            Map<String, Object> joiner = new HashMap<>();
            joiner.put("ID", emp.getId());
            joiner.put("Type", "joiner");
            joiner.put("Title", "Welcome " + emp.getFullName() + " to Our Team!");
            joiner.put("Name", emp.getFullName());
            joiner.put("Position", emp.getPosition());
            joiner.put("Department", emp.getDepartment());
            joiner.put("StartDate", emp.getStartDate() != null ? emp.getStartDate().toString() : "");
            joiner.put("Date", "");
            joiner.put("Description", "We are excited to welcome " + emp.getFullName() + 
                                     " as our new " + emp.getPosition() + ".");
            String joinerImageUrl = resolveFileImageUrl(emp.getProfileImage());
            joiner.put("ImageURL", joinerImageUrl);
            return joiner;
        }).collect(Collectors.toList());
        
        // Get ALL upcoming holidays — no upper date limit
        List<Holiday> upcomingHolidays = holidayRepository.findFutureHolidays(today)
                .stream()
            .filter(holiday -> holiday.getHolidayDate() != null)
                .limit(maxHolidays)
                .toList();

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
        
        // Get active announcements (excluding events).
        // If expiry date is missing, default visibility window is 30 days from publish date.
        List<Announcement> activeAnnouncements = announcementRepository.findAll().stream()
            .filter(ann -> Boolean.TRUE.equals(ann.getIsActive()))
            .filter(ann -> ann.getType() != null && ann.getType() != Announcement.AnnouncementType.EVENT)
            .filter(ann -> ann.getPublishDate() != null && !ann.getPublishDate().isAfter(today))
            .filter(ann -> {
                LocalDate effectiveExpiry = ann.getExpiryDate() != null
                    ? ann.getExpiryDate()
                    : ann.getPublishDate().plusDays(30);
                return !effectiveExpiry.isBefore(today);
            })
            .sorted((a1, a2) -> a2.getPublishDate().compareTo(a1.getPublishDate()))
            .limit(maxAnnouncements)
            .toList();

        // Get active events (show future events and past 30 days)
        LocalDate thirtyDaysFromNow = today.plusDays(30);
        List<Map<String, Object>> events = announcementRepository.findAll().stream()
            .filter(ann -> Boolean.TRUE.equals(ann.getIsActive()))
            .filter(ann -> ann.getType() == Announcement.AnnouncementType.EVENT)
            .filter(ann -> ann.getPublishDate() != null)
                .filter(ann -> !ann.getPublishDate().isAfter(thirtyDaysFromNow))  // Show events up to 30 days in future
                .sorted(Comparator.comparing(Announcement::getPublishDate))  // Sort by date ascending
                .map(ann -> {
                    Map<String, Object> e = new HashMap<>();
                    e.put("ID", ann.getId());
                    e.put("Type", ann.getType().toString());
                    e.put("Title", ann.getTitle());
                    e.put("Date", ann.getPublishDate().toString());
                    e.put("Description", ann.getDescription() != null ? ann.getDescription() : "");
                        String eventImageUrl = resolveFileImageUrl(ann.getImage());
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
                        String annImageUrl = resolveFileImageUrl(ann.getImage());
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
            b.put("Date", ann.getPublishDate() != null ? ann.getPublishDate().toString() : "");
            b.put("EndDate", ann.getExpiryDate() != null ? ann.getExpiryDate().toString() : "");
            return b;
        }).collect(Collectors.toList());
        
        // Get active carousel slides
        List<CarouselSlide> carouselSlides = carouselSlideRepository
                .findByIsActiveOrderByDisplayOrderAscCreatedAtDesc(true)
                .stream()
                .limit(maxCarousel)
                .toList();

        List<Map<String, Object>> carousel = carouselSlides.stream().map(slide -> {
            Map<String, Object> c = new HashMap<>();
            c.put("ID", slide.getId());
            c.put("Title", slide.getTitle() != null ? slide.getTitle() : "");
            c.put("Subtitle", slide.getSubtitle() != null ? slide.getSubtitle() : "");
            String slideImageUrl = "";
            if (slide.getImage() != null) {
                slideImageUrl = resolveFileImageUrl(slide.getImage());
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
        
        // Calculate work anniversaries dynamically for active employees only
        // Show only the HIGHEST/MOST RECENT anniversary milestone reached
        // Data is derived directly from employee start dates for this endpoint.
        List<Employee> allEmployees = employeeRepository.findAll();
        List<Employee> allActiveEmployees = allEmployees.stream()
            .filter(emp -> emp.getStatus() == Employee.EmployeeStatus.ACTIVE)
            .toList();

        for (Employee emp : allActiveEmployees) {
            LocalDate startDate = emp.getStartDate();
            if (startDate == null || startDate.isAfter(today)) continue;
            
            // Calculate the anniversary date in the current year so every anniversary
            // that falls in this month is shown together, regardless of whether the
            // day has passed yet.
            int yearsOfService = today.getYear() - startDate.getYear();

            if (yearsOfService >= 1) {
                LocalDate anniversaryDate = safeAnniversaryDate(startDate, today.getYear());

                // Include in celebrations if anniversary date falls within the current MONTH
                LocalDate startOfMonth = today.withDayOfMonth(1);
                if (!anniversaryDate.isBefore(startOfMonth) && !anniversaryDate.isAfter(endOfMonth)) {
                    Map<String, Object> anniversary = new HashMap<>();
                    anniversary.put("ID", emp.getId() + "-anniversary-" + yearsOfService);
                    anniversary.put("Type", "anniversary");
                    anniversary.put("Name", emp.getFullName());
                    anniversary.put("Date", anniversaryDate.toString());
                    anniversary.put("Years", yearsOfService);
                    anniversary.put("Position", emp.getPosition() != null ? emp.getPosition() : "");
                    anniversary.put("Department", emp.getDepartment());
                    String annImg = resolveFileImageUrl(emp.getProfileImage());
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
                birthday.put("Position", emp.getPosition() != null ? emp.getPosition() : "");
                birthday.put("Department", emp.getDepartment());
                String bImg = resolveFileImageUrl(emp.getProfileImage());
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

    private LocalDate safeAnniversaryDate(LocalDate startDate, int year) {
        int month = startDate.getMonthValue();
        int day = startDate.getDayOfMonth();
        int maxDay = java.time.Month.of(month).length(java.time.Year.isLeap(year));
        int safeDay = Math.min(day, maxDay);
        return LocalDate.of(year, month, safeDay);
    }

    private String resolveFileImageUrl(Image image) {
        if (image == null) {
            return "";
        }

        if (image.getFilePath() != null && image.getFilePath().startsWith("http")) {
            return image.getFilePath();
        }

        if (image.getFilename() == null || image.getFilename().isBlank()) {
            return "";
        }

        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/uploads/")
                .path(image.getFilename())
                .toUriString();
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
            File folderDir = resolveFolderDirectory(folder.getFolderName());
            int actualPhotoCount = countImageFiles(folderDir);
            f.put("id", folder.getId());
            f.put("folderName", folder.getFolderName());
            f.put("displayTitle", folder.getDisplayTitle());
            f.put("description", folder.getDescription());
            f.put("folderPath", folder.getFolderPath());
            f.put("photoCount", actualPhotoCount);
            f.put("displayOrder", folder.getDisplayOrder());
            return f;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(folderList);
    }

    @GetMapping("/gallery/folders/{folderName}/images")
    public ResponseEntity<?> getFolderImages(@PathVariable String folderName) {
        try {
            File folderDir = resolveFolderDirectory(folderName);
            if (!folderDir.exists() || !folderDir.isDirectory()) {
                return ResponseEntity.ok(List.of());
            }

            File[] imageFiles = folderDir.listFiles((dir, name) -> isImageFilename(name));
            if (imageFiles == null) {
                return ResponseEntity.ok(List.of());
            }

            java.util.Arrays.sort(imageFiles, (a, b) -> a.getName().compareToIgnoreCase(b.getName()));

            List<Map<String, Object>> images = java.util.Arrays.stream(imageFiles)
                .map(file -> {
                    Map<String, Object> image = new HashMap<>();
                    image.put("filename", file.getName());
                    image.put("url", ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/public/gallery/image/")
                        .path(folderName)
                        .path("/")
                        .path(encodeUrlPathSegment(file.getName()))
                        .toUriString());
                    return image;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to load folder images: " + e.getMessage()));
        }
    }

    @GetMapping("/gallery/image/{folderName}/{filename:.+}")
    public ResponseEntity<Resource> getFolderImage(@PathVariable String folderName, @PathVariable String filename) {
        try {
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return ResponseEntity.badRequest().build();
            }

            File folderDir = resolveFolderDirectory(folderName);
            Path filePath = Paths.get(folderDir.getAbsolutePath(), filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=86400, public")
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/employees")
    public ResponseEntity<List<Map<String, String>>> getActiveEmployees() {
        List<Employee> activeEmployees = employeeRepository.findAll().stream()
                .filter(emp -> emp.getStatus() == Employee.EmployeeStatus.ACTIVE)
                .sorted(Comparator.comparing(Employee::getFullName))
                .toList();

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

    private File resolveFolderDirectory(String folderName) {
        return new File(getGalleryRootDirectory(), folderName);
    }

    private boolean isImageFilename(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")
            || lower.endsWith(".gif") || lower.endsWith(".webp");
    }

    private int countImageFiles(File folderDir) {
        if (folderDir == null || !folderDir.exists() || !folderDir.isDirectory()) {
            return 0;
        }

        File[] files = folderDir.listFiles((dir, name) -> isImageFilename(name));
        return files == null ? 0 : files.length;
    }

    private String encodeUrlPathSegment(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8).replace("+", "%20");
    }

    private File getGalleryRootDirectory() {
        File configured = new File(galleryDir);
        if (!configured.isAbsolute()) {
            configured = new File(System.getProperty("user.dir"), galleryDir);
        }

        if (!configured.exists()) {
            //noinspection ResultOfMethodCallIgnored
            configured.mkdirs();
        }

        return configured;
    }
}

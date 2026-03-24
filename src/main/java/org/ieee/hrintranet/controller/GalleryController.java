package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.GalleryImage;
import org.ieee.hrintranet.entity.GalleryFolder;
import org.ieee.hrintranet.entity.Image;
import org.ieee.hrintranet.repository.GalleryImageRepository;
import org.ieee.hrintranet.repository.GalleryFolderRepository;
import org.ieee.hrintranet.service.AuditService;
import org.ieee.hrintranet.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/admin/gallery")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GalleryController {
    
    private final GalleryImageRepository galleryImageRepository;
    private final GalleryFolderRepository galleryFolderRepository;
    private final FileStorageService fileStorageService;
    private final AuditService auditService;
    
    @GetMapping
    public ResponseEntity<List<GalleryImage>> getAllImages() {
        return ResponseEntity.ok(galleryImageRepository.findAll());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<GalleryImage>> getActiveImages() {
        return ResponseEntity.ok(galleryImageRepository.findByIsActiveOrderByCreatedAtDesc(true));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<GalleryImage>> getImagesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(galleryImageRepository.findByCategoryAndIsActiveOrderByCreatedAtDesc(category, true));
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(galleryImageRepository.findAllActiveCategories());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<GalleryImage> getImage(@PathVariable int id) {
        return galleryImageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> uploadGalleryImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false, defaultValue = "general") String category,
            Authentication authentication) {
        try {
            Image image = fileStorageService.storeImage(file, Image.ImageType.OTHER,
                                                       authentication.getName());
            
            GalleryImage galleryImage = new GalleryImage();
            galleryImage.setTitle(title);
            galleryImage.setDescription(description);
            galleryImage.setImage(image);
            galleryImage.setCategory(category);
            galleryImage.setIsActive(true);
            galleryImage.setCreatedBy(authentication.getName());
            
            GalleryImage saved = galleryImageRepository.save(galleryImage);
            auditService.logAction(authentication.getName(), "CREATE", "gallery_images", saved.getId(), null, saved);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUploadGalleryImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "category", required = false, defaultValue = "general") String category,
            Authentication authentication) {
        try {
            int successCount = 0;
            int failCount = 0;
            
            for (MultipartFile file : files) {
                try {
                    Image image = fileStorageService.storeImage(file, Image.ImageType.OTHER,
                                                               authentication.getName());
                    
                    GalleryImage galleryImage = new GalleryImage();
                    galleryImage.setTitle(file.getOriginalFilename());
                    galleryImage.setImage(image);
                    galleryImage.setCategory(category);
                    galleryImage.setIsActive(true);
                    galleryImage.setCreatedBy(authentication.getName());
                    
                    GalleryImage saved = galleryImageRepository.save(galleryImage);
                    auditService.logAction(authentication.getName(), "CREATE", "gallery_images", saved.getId(), null, saved);
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Bulk upload completed",
                "successCount", successCount,
                "failCount", failCount
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGalleryImage(@PathVariable int id, 
                                                @RequestBody GalleryImage galleryImage,
                                                Authentication authentication) {
        return galleryImageRepository.findById(id)
                .map(existing -> {
                    GalleryImage oldData = new GalleryImage();
                    oldData.setId(existing.getId());
                    oldData.setTitle(existing.getTitle());
                    
                    existing.setTitle(galleryImage.getTitle());
                    existing.setDescription(galleryImage.getDescription());
                    existing.setCategory(galleryImage.getCategory());
                    existing.setIsActive(galleryImage.getIsActive());
                    
                    GalleryImage updated = galleryImageRepository.save(existing);
                    auditService.logAction(authentication.getName(), "UPDATE", "gallery_images", updated.getId(), oldData, updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGalleryImage(@PathVariable int id, Authentication authentication) {
        return galleryImageRepository.findById(id)
                .map(galleryImage -> {
                    auditService.logAction(authentication.getName(), "DELETE", "gallery_images", galleryImage.getId(), galleryImage, null);
                    galleryImageRepository.delete(galleryImage);
                    return ResponseEntity.ok(Map.of("message", "Gallery image deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGalleryStats() {
        long totalImages = galleryImageRepository.countByIsActive(true);
        List<String> categories = galleryImageRepository.findAllActiveCategories();
        
        return ResponseEntity.ok(Map.of(
            "totalImages", totalImages,
            "categories", categories,
            "categoryCount", categories.size()
        ));
    }
    
    // Gallery Folder Management Endpoints
    
    @GetMapping("/folders")
    public ResponseEntity<List<GalleryFolder>> getAllFolders() {
        return ResponseEntity.ok(galleryFolderRepository.findAllByOrderByDisplayOrderAsc());
    }
    
    @PostMapping("/folders/scan")
    public ResponseEntity<?> scanGalleryFolders(Authentication authentication) {
        try {
            String galleryPath = "images/gallery";
            File galleryDir = new File(galleryPath);
            
            if (!galleryDir.exists() || !galleryDir.isDirectory()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Gallery directory not found: " + galleryPath));
            }
            
            List<Map<String, Object>> results = new ArrayList<>();
            File[] folders = galleryDir.listFiles(File::isDirectory);
            
            if (folders == null || folders.length == 0) {
                return ResponseEntity.ok(Map.of("message", "No folders found", "results", results));
            }
            
            int newCount = 0;
            int updatedCount = 0;
            
            for (File folder : folders) {
                String folderName = folder.getName();
                
                // Count image files in the folder
                File[] imageFiles = folder.listFiles((dir, name) -> {
                    String lower = name.toLowerCase();
                    return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || 
                           lower.endsWith(".png") || lower.endsWith(".gif");
                });
                int photoCount = (imageFiles != null) ? imageFiles.length : 0;
                
                // Check if folder already exists
                GalleryFolder existingFolder = galleryFolderRepository.findByFolderName(folderName).orElse(null);
                
                if (existingFolder != null) {
                    // Update existing folder
                    existingFolder.setPhotoCount(photoCount);
                    existingFolder.setFolderPath("images/gallery/" + folderName);
                    galleryFolderRepository.save(existingFolder);
                    
                    results.add(Map.of(
                        "folder", folderName,
                        "status", "updated",
                        "photoCount", photoCount
                    ));
                    updatedCount++;
                } else {
                    // Create new folder
                    GalleryFolder newFolder = new GalleryFolder();
                    newFolder.setFolderName(folderName);
                    newFolder.setDisplayTitle(formatFolderName(folderName));
                    newFolder.setDescription("Photo collection");
                    newFolder.setFolderPath("images/gallery/" + folderName);
                    newFolder.setPhotoCount(photoCount);
                    newFolder.setDisplayOrder(galleryFolderRepository.findAll().size() + 1);
                    newFolder.setIsActive(true);
                    newFolder.setCreatedBy(authentication.getName());
                    
                    galleryFolderRepository.save(newFolder);
                    
                    results.add(Map.of(
                        "folder", folderName,
                        "status", "new",
                        "photoCount", photoCount
                    ));
                    newCount++;
                }
            }
            
            auditService.logAction(authentication.getName(), "SCAN", "gallery_folders", 
                null, null, Map.of("newCount", newCount, "updatedCount", updatedCount));
            
            return ResponseEntity.ok(Map.of(
                "message", "Scan completed",
                "newCount", newCount,
                "updatedCount", updatedCount,
                "results", results
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Scan failed: " + e.getMessage()));
        }
    }
    
    @PutMapping("/folders/{id}")
    public ResponseEntity<?> updateFolder(
            @PathVariable int id,
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            GalleryFolder folder = galleryFolderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
            
            GalleryFolder oldData = new GalleryFolder();
            oldData.setId(folder.getId());
            oldData.setDisplayTitle(folder.getDisplayTitle());
            oldData.setDescription(folder.getDescription());
            oldData.setDisplayOrder(folder.getDisplayOrder());
            
            if (updates.containsKey("displayTitle")) {
                folder.setDisplayTitle((String) updates.get("displayTitle"));
            }
            if (updates.containsKey("description")) {
                folder.setDescription((String) updates.get("description"));
            }
            if (updates.containsKey("displayOrder")) {
                folder.setDisplayOrder((Integer) updates.get("displayOrder"));
            }
            
            GalleryFolder updated = galleryFolderRepository.save(folder);
            auditService.logAction(authentication.getName(), "UPDATE", "gallery_folders", 
                folder.getId(), oldData, updated);
            
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PatchMapping("/folders/{id}/toggle")
    public ResponseEntity<?> toggleFolderStatus(
            @PathVariable int id,
            Authentication authentication) {
        try {
            GalleryFolder folder = galleryFolderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
            
            Boolean oldStatus = folder.getIsActive();
            folder.setIsActive(!oldStatus);
            
            GalleryFolder updated = galleryFolderRepository.save(folder);
            auditService.logAction(authentication.getName(), "TOGGLE", "gallery_folders", 
                folder.getId(), Map.of("isActive", oldStatus), Map.of("isActive", updated.getIsActive()));
            
            return ResponseEntity.ok(Map.of(
                "message", "Folder status updated",
                "folder", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    private String formatFolderName(String folderName) {
        // Convert folder name to display title (e.g., "diwali" -> "Diwali")
        if (folderName == null || folderName.isEmpty()) {
            return folderName;
        }
        return folderName.substring(0, 1).toUpperCase() + folderName.substring(1);
    }
    
    /**
     * Create a new gallery folder
     */
    @PostMapping("/folders/create")
    public ResponseEntity<?> createFolder(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String folderName = request.get("folderName");
            String displayTitle = request.get("displayTitle");
            String description = request.get("description");
            
            if (folderName == null || folderName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Folder name is required"));
            }
            
            // Validate folder name (alphanumeric, hyphens, underscores only)
            if (!folderName.matches("^[a-zA-Z0-9_-]+$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Folder name can only contain letters, numbers, hyphens, and underscores"));
            }
            
            // Check if folder already exists in database
            if (galleryFolderRepository.findByFolderName(folderName).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Folder already exists"));
            }
            
            // Create physical directory
            String galleryPath = "images/gallery/" + folderName;
            File projectRoot = new File(System.getProperty("user.dir")).getParentFile();
            File directory = new File(projectRoot, galleryPath);
            if (directory.exists()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Folder already exists in filesystem"));
            }
            
            if (!directory.mkdirs()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create folder directory"));
            }
            
            // Create database record
            GalleryFolder galleryFolder = new GalleryFolder();
            galleryFolder.setFolderName(folderName);
            galleryFolder.setFolderPath(galleryPath);
            galleryFolder.setDisplayTitle(displayTitle != null && !displayTitle.isEmpty() ? displayTitle : formatFolderName(folderName));
            galleryFolder.setDescription(description);
            galleryFolder.setPhotoCount(0);
            galleryFolder.setDisplayOrder(0);
            galleryFolder.setIsActive(true);
            
            galleryFolder = galleryFolderRepository.save(galleryFolder);
            
            // Log audit
            auditService.logAction(
                authentication.getName(), 
                "CREATE", 
                "gallery_folders", 
                galleryFolder.getId(), 
                null, 
                galleryFolder
            );
            
            return ResponseEntity.ok(galleryFolder);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create folder: " + e.getMessage()));
        }
    }
    
    /**
     * Upload images to a gallery folder
     */
    @PostMapping("/folders/{folderId}/upload")
    public ResponseEntity<?> uploadImages(
            @PathVariable int folderId,
            @RequestParam("files") MultipartFile[] files,
            Authentication authentication) {
        try {
            // Find folder
            GalleryFolder folder = galleryFolderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
            
            // Use path relative to project root (parent of backend directory)
            String galleryPath = "images/gallery/" + folder.getFolderName();
            File projectRoot = new File(System.getProperty("user.dir")).getParentFile();
            File directory = new File(projectRoot, galleryPath);
            
            if (!directory.exists()) {
                directory.mkdirs();
            }
            
            // Count existing images to determine starting number
            File[] existingFiles = directory.listFiles((dir, name) -> 
                name.toLowerCase().matches("image-\\d+\\.(jpg|jpeg|png|gif)"));
            int currentCount = existingFiles != null ? existingFiles.length : 0;
            int startNumber = currentCount + 1;
            
            List<String> uploadedFiles = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            
            // Upload each file
            for (int i = 0; i < files.length; i++) {
                MultipartFile file = files[i];
                
                try {
                    // Validate file
                    if (file.isEmpty()) {
                        errors.add(file.getOriginalFilename() + ": File is empty");
                        continue;
                    }
                    
                    // Validate file type
                    String contentType = file.getContentType();
                    if (contentType == null || !contentType.startsWith("image/")) {
                        errors.add(file.getOriginalFilename() + ": Not an image file");
                        continue;
                    }
                    
                    // Validate file size (max 5MB)
                    if (file.getSize() > 5 * 1024 * 1024) {
                        errors.add(file.getOriginalFilename() + ": File too large (max 5MB)");
                        continue;
                    }
                    
                    // Determine file extension
                    String originalFilename = file.getOriginalFilename();
                    String extension = "";
                    if (originalFilename != null && originalFilename.contains(".")) {
                        extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    } else {
                        extension = ".jpg"; // default
                    }
                    
                    // Generate sequential filename
                    String newFilename = "image-" + (startNumber + i) + extension;
                    File destinationFile = new File(directory, newFilename);
                    
                    // Save file
                    file.transferTo(destinationFile);
                    uploadedFiles.add(newFilename);
                    
                } catch (Exception e) {
                    errors.add(file.getOriginalFilename() + ": " + e.getMessage());
                }
            }
            
            // Update folder photo count
            File[] allFiles = directory.listFiles((dir, name) -> 
                name.toLowerCase().matches("image-\\d+\\.(jpg|jpeg|png|gif)"));
            int totalCount = allFiles != null ? allFiles.length : 0;
            folder.setPhotoCount(totalCount);
            galleryFolderRepository.save(folder);
            
            // Log audit
            auditService.logAction(
                authentication.getName(), 
                "UPLOAD", 
                "gallery_folders", 
                folder.getId(), 
                null, 
                folder
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("uploadedCount", uploadedFiles.size());
            response.put("totalCount", totalCount);
            response.put("uploadedFiles", uploadedFiles);
            if (!errors.isEmpty()) {
                response.put("errors", errors);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload images: " + e.getMessage()));
        }
    }
}

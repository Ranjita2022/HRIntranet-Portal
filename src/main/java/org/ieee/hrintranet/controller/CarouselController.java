package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.CarouselSlide;
import org.ieee.hrintranet.entity.Image;
import org.ieee.hrintranet.repository.CarouselSlideRepository;
import org.ieee.hrintranet.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/carousel")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CarouselController {
    
    private final CarouselSlideRepository carouselSlideRepository;
    private final FileStorageService fileStorageService;
    private final org.ieee.hrintranet.service.AuditService auditService;
    
    @GetMapping
    public ResponseEntity<List<CarouselSlide>> getAllSlides() {
        return ResponseEntity.ok(carouselSlideRepository.findAll());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<CarouselSlide>> getActiveSlides() {
        return ResponseEntity.ok(carouselSlideRepository.findByIsActiveOrderByDisplayOrderAscCreatedAtDesc(true));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CarouselSlide> getSlide(@PathVariable Integer id) {
        return carouselSlideRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createSlide(@RequestParam(value = "file") MultipartFile file,
                                        @RequestParam(value = "title", required = false) String title,
                                        @RequestParam(value = "subtitle", required = false) String subtitle,
                                        @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder,
                                        Authentication authentication) {
        try {
            Image image = fileStorageService.storeImage(file, Image.ImageType.CAROUSEL, 
                                                       authentication.getName());
            
            CarouselSlide slide = new CarouselSlide();
            slide.setTitle(title);
            slide.setSubtitle(subtitle);
            slide.setImage(image);
            slide.setDisplayOrder(displayOrder);
            slide.setIsActive(true);
            slide.setCreatedBy(authentication.getName());
            
            CarouselSlide saved = carouselSlideRepository.save(slide);
            auditService.logAction(authentication.getName(), "CREATE", "carousel_slides", saved.getId(), null, saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSlide(@PathVariable Integer id, @RequestBody CarouselSlide slide, Authentication authentication) {
        return carouselSlideRepository.findById(id)
                .map(existing -> {
                    CarouselSlide oldData = new CarouselSlide();
                    oldData.setId(existing.getId());
                    oldData.setTitle(existing.getTitle());
                    
                    existing.setTitle(slide.getTitle());
                    existing.setSubtitle(slide.getSubtitle());
                    existing.setDisplayOrder(slide.getDisplayOrder());
                    existing.setIsActive(slide.getIsActive());
                    CarouselSlide updated = carouselSlideRepository.save(existing);
                    auditService.logAction(authentication.getName(), "UPDATE", "carousel_slides", updated.getId(), oldData, updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSlide(@PathVariable Integer id, Authentication authentication) {
        return carouselSlideRepository.findById(id)
                .map(slide -> {
                    auditService.logAction(authentication.getName(), "DELETE", "carousel_slides", slide.getId(), slide, null);
                    carouselSlideRepository.delete(slide);
                    return ResponseEntity.ok(Map.of("message", "Slide deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

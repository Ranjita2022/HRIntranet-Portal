package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.Holiday;
import org.ieee.hrintranet.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/holidays")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HolidayController {
    
    private final HolidayRepository holidayRepository;
    private final org.ieee.hrintranet.service.AuditService auditService;
    
    @GetMapping
    public ResponseEntity<List<Holiday>> getAllHolidays() {
        return ResponseEntity.ok(holidayRepository.findAll());
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<Holiday>> getUpcomingHolidays() {
        LocalDate today = LocalDate.now();
        LocalDate sixMonthsLater = today.plusDays(180);
        return ResponseEntity.ok(holidayRepository.findUpcomingHolidays(today, sixMonthsLater));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Holiday> getHoliday(@PathVariable int id) {
        return holidayRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createHoliday(@RequestBody Holiday holiday, Authentication authentication) {
        try {
            holiday.setCreatedBy(authentication.getName());
            Holiday saved = holidayRepository.save(holiday);
            auditService.logAction(authentication.getName(), "CREATE", "holidays", saved.getId(), null, saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateHoliday(@PathVariable int id, @RequestBody Holiday holiday, Authentication authentication) {
        return holidayRepository.findById(id)
                .map(existing -> {
                    Holiday oldData = new Holiday();
                    oldData.setId(existing.getId());
                    oldData.setTitle(existing.getTitle());
                    
                    existing.setTitle(holiday.getTitle());
                    existing.setHolidayDate(holiday.getHolidayDate());
                    existing.setDescription(holiday.getDescription());
                    existing.setIsActive(holiday.getIsActive());
                    Holiday updated = holidayRepository.save(existing);
                    auditService.logAction(authentication.getName(), "UPDATE", "holidays", updated.getId(), oldData, updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHoliday(@PathVariable int id, Authentication authentication) {
        return holidayRepository.findById(id)
                .map(holiday -> {
                    auditService.logAction(authentication.getName(), "DELETE", "holidays", holiday.getId(), holiday, null);
                    holidayRepository.delete(holiday);
                    return ResponseEntity.ok(Map.of("message", "Holiday deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

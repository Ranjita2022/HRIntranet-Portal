package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.OpenPosition;
import org.ieee.hrintranet.repository.OpenPositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Public Open Positions API
 * Provides open position data without authentication requirement
 * Used by kiosk, TV display, and public portal
 */
@RestController
@RequestMapping("/public/positions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicOpenPositionController {
    
    private final OpenPositionRepository openPositionRepository;
    
    /**
     * Get all published open positions
     */
    @GetMapping
    public ResponseEntity<List<OpenPosition>> getAllPublishedPositions() {
        List<OpenPosition> positions = openPositionRepository.findByStatusAndIsPublished(
            OpenPosition.PositionStatus.OPEN,
            true
        );
        // Sort by posting date descending
        positions.sort((p1, p2) -> p2.getPostingDate().compareTo(p1.getPostingDate()));
        return ResponseEntity.ok(positions);
    }

    /**
     * Get all positions (regardless of status) - for admin panel
     */
    @GetMapping("/all")
    public ResponseEntity<List<OpenPosition>> getAllPositions() {
        List<OpenPosition> positions = openPositionRepository.findAll();
        // Sort by posting date descending
        positions.sort((p1, p2) -> p2.getPostingDate().compareTo(p1.getPostingDate()));
        return ResponseEntity.ok(positions);
    }
    
    /**
     * Get positions posted in specific month and year
     * Query parameters: month (1-12), year (e.g., 2026)
     */
    @GetMapping("/by-month")
    public ResponseEntity<List<OpenPosition>> getPositionsByMonth(
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year) {
        
        LocalDate today = LocalDate.now();
        int searchMonth = month != null ? month : today.getMonthValue();
        int searchYear = year != null ? year : today.getYear();
        
        // Get first and last day of the month
        YearMonth yearMonth = YearMonth.of(searchYear, searchMonth);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<OpenPosition> positions = openPositionRepository.findByPostingDateBetweenAndIsPublished(
            startDate,
            endDate,
            true
        );
        
        // Sort by posting date descending
        positions.sort((p1, p2) -> p2.getPostingDate().compareTo(p1.getPostingDate()));
        return ResponseEntity.ok(positions);
    }
    
    /**
     * Get positions by opening status for display
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OpenPosition>> getPositionsByStatus(@PathVariable String status) {
        try {
            OpenPosition.PositionStatus posStatus = OpenPosition.PositionStatus.valueOf(status.toUpperCase());
            List<OpenPosition> positions = openPositionRepository.findByStatusAndIsPublished(posStatus, true);
            positions.sort((p1, p2) -> p2.getPostingDate().compareTo(p1.getPostingDate()));
            return ResponseEntity.ok(positions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get available months with open positions for kiosk/TV filtering
     */
    @GetMapping("/available-months")
    public ResponseEntity<List<String>> getAvailableMonths() {
        List<OpenPosition> allPositions = openPositionRepository.findByIsPublished(true);
        
        List<String> months = allPositions.stream()
            .map(p -> {
                LocalDate date = p.getPostingDate();
                return String.format("%04d-%02d", date.getYear(), date.getMonthValue());
            })
            .distinct()
            .sorted((m1, m2) -> m2.compareTo(m1)) // Sort descending
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(months);
    }
}

package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.OpenPosition;
import org.ieee.hrintranet.repository.OpenPositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Admin Controller for Open Positions Management
 * Requires admin authentication (via JWT token from frontend)
 */
@RestController
@RequestMapping("/admin/positions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OpenPositionController {
    
    private final OpenPositionRepository openPositionRepository;
    
    /**
     * Get all positions
     */
    @GetMapping
    public ResponseEntity<List<OpenPosition>> getAllPositions() {
        List<OpenPosition> positions = openPositionRepository.findAll();
        return ResponseEntity.ok(positions);
    }
    
    /**
     * Get position by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<OpenPosition> getPositionById(@PathVariable Integer id) {
        Optional<OpenPosition> position = openPositionRepository.findById(id);
        if (position.isPresent()) {
            return ResponseEntity.ok(position.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Create new position
     */
    @PostMapping
    public ResponseEntity<OpenPosition> createPosition(@RequestBody OpenPosition position) {
        OpenPosition savedPosition = openPositionRepository.save(position);
        return ResponseEntity.ok(savedPosition);
    }
    
    /**
     * Update existing position
     */
    @PutMapping("/{id}")
    public ResponseEntity<OpenPosition> updatePosition(@PathVariable Integer id, @RequestBody OpenPosition positionDetails) {
        Optional<OpenPosition> position = openPositionRepository.findById(id);
        if (position.isPresent()) {
            OpenPosition existingPosition = position.get();
            existingPosition.setRequisitionId(positionDetails.getRequisitionId());
            existingPosition.setRequisitionTitle(positionDetails.getRequisitionTitle());
            existingPosition.setLocation(positionDetails.getLocation());
            existingPosition.setPostingDate(positionDetails.getPostingDate());
            existingPosition.setClosingDate(positionDetails.getClosingDate());
            existingPosition.setDescription(positionDetails.getDescription());
            existingPosition.setRequirements(positionDetails.getRequirements());
            existingPosition.setStatus(positionDetails.getStatus());
            existingPosition.setIsPublished(positionDetails.getIsPublished());
            
            OpenPosition updatedPosition = openPositionRepository.save(existingPosition);
            return ResponseEntity.ok(updatedPosition);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Delete position
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePosition(@PathVariable Integer id) {
        if (openPositionRepository.existsById(id)) {
            openPositionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Get positions by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OpenPosition>> getPositionsByStatus(@PathVariable String status) {
        try {
            OpenPosition.PositionStatus posStatus = OpenPosition.PositionStatus.valueOf(status.toUpperCase());
            List<OpenPosition> positions = openPositionRepository.findByStatus(posStatus);
            return ResponseEntity.ok(positions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.Suggestion;
import org.ieee.hrintranet.repository.SuggestionRepository;
import org.ieee.hrintranet.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SuggestionController {

    private final SuggestionRepository suggestionRepository;
    private final AuditService auditService;

    // ─── PUBLIC: Submit a suggestion (no auth required) ──────────────
    @PostMapping("/public/suggestions")
    public ResponseEntity<?> submitSuggestion(@RequestBody Suggestion suggestion) {
        try {
            // Sanitise
            if (suggestion.getSuggestionText() == null || suggestion.getSuggestionText().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Suggestion text is required"));
            }
            if (Boolean.TRUE.equals(suggestion.getIsAnonymous())) {
                suggestion.setSubmitterName(null);
            } else if (suggestion.getSubmitterName() == null || suggestion.getSubmitterName().isBlank()) {
                suggestion.setIsAnonymous(true);
                suggestion.setSubmitterName(null);
            }
            if (suggestion.getCategory() == null) {
                suggestion.setCategory(Suggestion.SuggestionCategory.OTHER);
            }
            suggestion.setStatus(Suggestion.SuggestionStatus.NEW);
            suggestion.setAdminNotes(null);
            suggestion.setReviewedAt(null);
            suggestion.setReviewedBy(null);

            Suggestion saved = suggestionRepository.save(suggestion);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "message", "Thank you! Your suggestion has been submitted.", "id", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── ADMIN: Get all suggestions with stats ────────────────────────
    @GetMapping("/admin/suggestions")
    public ResponseEntity<?> getAllSuggestions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        try {
            List<Suggestion> suggestions;
            if (status != null && !status.isBlank()) {
                suggestions = suggestionRepository.findByStatusOrderBySubmittedAtDesc(
                        Suggestion.SuggestionStatus.valueOf(status.toUpperCase()));
            } else if (category != null && !category.isBlank()) {
                suggestions = suggestionRepository.findByCategoryOrderBySubmittedAtDesc(
                        Suggestion.SuggestionCategory.valueOf(category.toUpperCase()));
            } else {
                suggestions = suggestionRepository.findAllByOrderBySubmittedAtDesc();
            }

            Map<String, Object> response = Map.of(
                    "suggestions", suggestions,
                    "stats", Map.of(
                            "total", suggestionRepository.count(),
                            "newCount", suggestionRepository.countNew(),
                            "reviewed", suggestionRepository.countReviewed(),
                            "implemented", suggestionRepository.countImplemented(),
                            "dismissed", suggestionRepository.countDismissed()
                    )
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── ADMIN: Update status and/or admin notes ──────────────────────
    @PutMapping("/admin/suggestions/{id}")
    public ResponseEntity<?> updateSuggestion(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        return suggestionRepository.findById(id).map(suggestion -> {
            String newStatus = body.get("status");
            String adminNotes = body.get("adminNotes");

            if (newStatus != null && !newStatus.isBlank()) {
                suggestion.setStatus(Suggestion.SuggestionStatus.valueOf(newStatus.toUpperCase()));
                if (suggestion.getStatus() != Suggestion.SuggestionStatus.NEW) {
                    suggestion.setReviewedAt(LocalDateTime.now());
                    suggestion.setReviewedBy(authentication.getName());
                }
            }
            if (adminNotes != null) {
                suggestion.setAdminNotes(adminNotes.isBlank() ? null : adminNotes);
            }

            Suggestion updated = suggestionRepository.save(suggestion);
            auditService.logAction(authentication.getName(), "UPDATE", "suggestions", updated.getId(), null, updated);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── ADMIN: Delete a suggestion ───────────────────────────────────
    @DeleteMapping("/admin/suggestions/{id}")
    public ResponseEntity<?> deleteSuggestion(@PathVariable Integer id, Authentication authentication) {
        return suggestionRepository.findById(id).map(suggestion -> {
            auditService.logAction(authentication.getName(), "DELETE", "suggestions", suggestion.getId(), suggestion, null);
            suggestionRepository.delete(suggestion);
            return ResponseEntity.ok(Map.of("message", "Suggestion deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}


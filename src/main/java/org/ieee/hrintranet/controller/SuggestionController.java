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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SuggestionController {

    private final SuggestionRepository suggestionRepository;
    private final AuditService auditService;

    // ─── Format reference number: SUG-2026-0042 ──────────────────────
    private String refNumber(Suggestion s) {
        int year = s.getSubmittedAt() != null
                ? s.getSubmittedAt().getYear()
                : LocalDateTime.now().getYear();
        return String.format("SUG-%d-%04d", year, s.getId());
    }

    // ─── PUBLIC: Submit a suggestion ─────────────────────────────────
    @PostMapping("/public/suggestions")
    public ResponseEntity<?> submitSuggestion(@RequestBody Suggestion suggestion) {
        try {
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
            suggestion.setPublicNote(null);
            suggestion.setReviewedAt(null);
            suggestion.setReviewedBy(null);

            Suggestion saved = suggestionRepository.save(suggestion);
            String ref = refNumber(saved);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Thank you! Your suggestion has been submitted.");
            resp.put("id", saved.getId());
            resp.put("refNumber", ref);
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── PUBLIC: Status board — all suggestions (no internal data) ───
    @GetMapping("/public/suggestions/status")
    public ResponseEntity<?> getPublicStatus() {
        List<Suggestion> all = suggestionRepository.findAllByOrderBySubmittedAtDesc();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        List<Map<String, Object>> result = new ArrayList<>();
        for (Suggestion s : all) {
            Map<String, Object> m = new HashMap<>();
            m.put("refNumber",    refNumber(s));
            m.put("category",     s.getCategory().name());
            m.put("status",       s.getStatus().name());
            m.put("publicNote",   s.getPublicNote() != null ? s.getPublicNote() : "");
            m.put("submittedAt",  s.getSubmittedAt() != null ? s.getSubmittedAt().format(fmt) : "");
            // Summary: first 150 chars, no submitter name ever
            String text = s.getSuggestionText() != null ? s.getSuggestionText() : "";
            m.put("summary", text.length() > 150 ? text.substring(0, 150) + "…" : text);
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    // ─── ADMIN: Get all suggestions with stats ────────────────────────
    @GetMapping("/admin/suggestions")
    public ResponseEntity<?> getAllSuggestions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        try {
            List<Suggestion> suggestions;
            if (status != null && !status.isBlank() && !status.equals("ALL")) {
                suggestions = suggestionRepository.findByStatusOrderBySubmittedAtDesc(
                        Suggestion.SuggestionStatus.valueOf(status.toUpperCase()));
            } else if (category != null && !category.isBlank()) {
                suggestions = suggestionRepository.findByCategoryOrderBySubmittedAtDesc(
                        Suggestion.SuggestionCategory.valueOf(category.toUpperCase()));
            } else {
                suggestions = suggestionRepository.findAllByOrderBySubmittedAtDesc();
            }

            // Enrich each suggestion with refNumber
            List<Map<String, Object>> enriched = new ArrayList<>();
            for (Suggestion s : suggestions) {
                Map<String, Object> m = new HashMap<>();
                m.put("id",            s.getId());
                m.put("refNumber",     refNumber(s));
                m.put("submitterName", s.getSubmitterName());
                m.put("isAnonymous",   s.getIsAnonymous());
                m.put("category",      s.getCategory().name());
                m.put("suggestionText", s.getSuggestionText());
                m.put("status",        s.getStatus().name());
                m.put("adminNotes",    s.getAdminNotes());
                m.put("publicNote",    s.getPublicNote());
                m.put("reviewedAt",    s.getReviewedAt());
                m.put("reviewedBy",    s.getReviewedBy());
                m.put("submittedAt",   s.getSubmittedAt());
                enriched.add(m);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("suggestions", enriched);
            response.put("stats", Map.of(
                    "total",       suggestionRepository.count(),
                    "newCount",    suggestionRepository.countNew(),
                    "reviewed",    suggestionRepository.countReviewed(),
                    "implemented", suggestionRepository.countImplemented(),
                    "dismissed",   suggestionRepository.countDismissed()
            ));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── ADMIN: Update status, admin notes, public note ──────────────
    @PutMapping("/admin/suggestions/{id}")
    public ResponseEntity<?> updateSuggestion(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        return suggestionRepository.findById(id).map(suggestion -> {
            String newStatus  = body.get("status");
            String adminNotes = body.get("adminNotes");
            String publicNote = body.get("publicNote");

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
            if (publicNote != null) {
                suggestion.setPublicNote(publicNote.isBlank() ? null : publicNote);
            }

            Suggestion updated = suggestionRepository.save(suggestion);
            auditService.logAction(authentication.getName(), "UPDATE", "suggestions", updated.getId(), null, updated);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "refNumber", refNumber(updated)
            ));
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

package org.ieee.hrintranet.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "suggestions")
@Data
public class Suggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "submitter_name", length = 100)
    private String submitterName;

    @Column(name = "is_anonymous", nullable = false)
    private Boolean isAnonymous = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SuggestionCategory category = SuggestionCategory.OTHER;

    @Column(name = "suggestion_text", nullable = false, columnDefinition = "TEXT")
    private String suggestionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SuggestionStatus status = SuggestionStatus.NEW;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "public_note", length = 500)
    private String publicNote;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by", length = 100)
    private String reviewedBy;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    public enum SuggestionStatus {
        NEW, REVIEWED, IMPLEMENTED, DISMISSED
    }

    public enum SuggestionCategory {
        WORKPLACE, BENEFITS, CULTURE, PROCESS, TECHNOLOGY, OTHER
    }
}

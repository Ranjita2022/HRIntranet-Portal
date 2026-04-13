package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuggestionRepository extends JpaRepository<Suggestion, Integer> {

    List<Suggestion> findByStatusOrderBySubmittedAtDesc(Suggestion.SuggestionStatus status);

    List<Suggestion> findByCategoryOrderBySubmittedAtDesc(Suggestion.SuggestionCategory category);

    List<Suggestion> findAllByOrderBySubmittedAtDesc();

    @Query("SELECT COUNT(s) FROM Suggestion s WHERE s.status = 'NEW'")
    long countNew();

    @Query("SELECT COUNT(s) FROM Suggestion s WHERE s.status = 'REVIEWED'")
    long countReviewed();

    @Query("SELECT COUNT(s) FROM Suggestion s WHERE s.status = 'IMPLEMENTED'")
    long countImplemented();

    @Query("SELECT COUNT(s) FROM Suggestion s WHERE s.status = 'DISMISSED'")
    long countDismissed();
}


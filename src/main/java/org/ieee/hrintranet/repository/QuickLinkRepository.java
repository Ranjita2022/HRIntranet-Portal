package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.QuickLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuickLinkRepository extends JpaRepository<QuickLink, Integer> {
    
    List<QuickLink> findByIsActiveOrderByDisplayOrderAscCreatedAtDesc(Boolean isActive);
    
    List<QuickLink> findByCategoryAndIsActiveOrderByDisplayOrderAscCreatedAtDesc(String category, Boolean isActive);
    
    @Query("SELECT DISTINCT q.category FROM QuickLink q WHERE q.isActive = true ORDER BY q.category")
    List<String> findAllActiveCategories();
    
    long countByIsActive(Boolean isActive);
}

package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, Integer> {
    
    List<GalleryImage> findByIsActiveOrderByCreatedAtDesc(Boolean isActive);
    
    List<GalleryImage> findByCategoryAndIsActiveOrderByCreatedAtDesc(String category, Boolean isActive);
    
    Long countByIsActive(Boolean isActive);
    
    @Query(value = "SELECT * FROM gallery_images WHERE is_active = true ORDER BY RAND() LIMIT :limit", 
           nativeQuery = true)
    List<GalleryImage> findRandomActiveImages(@Param("limit") int limit);
    
    @Query(value = "SELECT * FROM gallery_images WHERE category = :category AND is_active = true ORDER BY RAND() LIMIT :limit", 
           nativeQuery = true)
    List<GalleryImage> findRandomActiveImagesByCategory(@Param("category") String category, 
                                                         @Param("limit") int limit);
    
    @Query("SELECT DISTINCT g.category FROM GalleryImage g WHERE g.isActive = true ORDER BY g.category")
    List<String> findAllActiveCategories();
}

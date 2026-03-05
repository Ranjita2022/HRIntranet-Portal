package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.GalleryFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GalleryFolderRepository extends JpaRepository<GalleryFolder, Integer> {
    
    List<GalleryFolder> findByIsActiveOrderByDisplayOrderAsc(Boolean isActive);
    
    List<GalleryFolder> findAllByOrderByDisplayOrderAsc();
    
    Optional<GalleryFolder> findByFolderName(String folderName);
    
    Long countByIsActive(Boolean isActive);
    
    boolean existsByFolderName(String folderName);
}

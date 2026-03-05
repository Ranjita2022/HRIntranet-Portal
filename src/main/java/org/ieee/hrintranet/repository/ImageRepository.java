package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Integer> {
    
    List<Image> findByImageTypeOrderByCreatedAtDesc(Image.ImageType imageType);
    
    List<Image> findByUploadedByOrderByCreatedAtDesc(String uploadedBy);
}

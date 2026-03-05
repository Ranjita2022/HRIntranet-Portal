package org.ieee.hrintranet.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "gallery_folders")
@Data
public class GalleryFolder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "folder_name", nullable = false, unique = true, length = 100)
    private String folderName;
    
    @Column(name = "display_title", length = 200)
    private String displayTitle;
    
    @Column(length = 500)
    private String description;
    
    @Column(name = "folder_path", nullable = false, length = 500)
    private String folderPath;
    
    @Column(name = "photo_count", nullable = false)
    private Integer photoCount = 0;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

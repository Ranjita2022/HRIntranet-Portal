package org.ieee.hrintranet.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "images")
@Data
public class Image {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false)
    private String filename;
    
    @Column(name = "original_filename", nullable = false)
    private String originalFilename;
    
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;
    
    @Column(name = "file_size", nullable = false)
    private Integer fileSize;
    
    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;
    
    private Integer width;
    
    private Integer height;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "image_type", nullable = false, length = 30)
    private ImageType imageType;
    
    @Column(name = "uploaded_by", length = 100)
    private String uploadedBy;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    public enum ImageType {
        EMPLOYEE_PROFILE, CAROUSEL, ANNOUNCEMENT, OTHER
    }
}

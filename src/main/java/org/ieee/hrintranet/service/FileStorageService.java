package org.ieee.hrintranet.service;

import org.ieee.hrintranet.entity.Image;
import org.ieee.hrintranet.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    
    private final ImageRepository imageRepository;
    
    @Value("${app.upload.dir}")
    private String uploadDir;
    
    @Value("${app.upload.allowed-types}")
    private String allowedTypes;
    
    @Value("${app.upload.max-dimension}")
    private int maxDimension;
    
    public Image storeImage(MultipartFile file, Image.ImageType imageType, String uploadedBy) throws IOException {
        // Validate file
        validateImage(file);
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Get image dimensions
        BufferedImage bufferedImage = ImageIO.read(filePath.toFile());
        int width = bufferedImage != null ? bufferedImage.getWidth() : 0;
        int height = bufferedImage != null ? bufferedImage.getHeight() : 0;
        
        // Create Image entity
        Image image = new Image();
        image.setFilename(filename);
        image.setOriginalFilename(originalFilename);
        image.setFilePath(filePath.toString());
        image.setFileSize((int) file.getSize());
        image.setMimeType(file.getContentType());
        image.setWidth(width);
        image.setHeight(height);
        image.setImageType(imageType);
        image.setUploadedBy(uploadedBy);
        
        return imageRepository.save(image);
    }
    
    private void validateImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }
        
        // Check file type
        List<String> allowedTypesList = Arrays.asList(allowedTypes.split(","));
        if (!allowedTypesList.contains(file.getContentType())) {
            throw new IOException("Invalid file type. Allowed types: " + allowedTypes);
        }
        
        // Check dimensions
        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null) {
            throw new IOException("Invalid image file");
        }
        
        if (image.getWidth() > maxDimension || image.getHeight() > maxDimension) {
            throw new IOException("Image dimensions exceed maximum allowed: " + maxDimension + "x" + maxDimension);
        }
    }
    
    public void deleteImage(Integer imageId) throws IOException {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new IOException("Image not found"));
        
        // Delete file from filesystem
        Path filePath = Paths.get(image.getFilePath());
        Files.deleteIfExists(filePath);
        
        // Delete from database
        imageRepository.delete(image);
    }
}

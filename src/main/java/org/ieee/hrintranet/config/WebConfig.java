package org.ieee.hrintranet.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Filesystem directory that holds gallery album sub-folders.
     * Dev:  images/gallery  (relative — resolves to {project.root}/images/gallery/)
     * Prod: /opt/hrintranet/gallery  (absolute — outside the WAR, survives re-deployments)
     */
    @Value("${app.gallery.dir:images/gallery}")
    private String galleryDir;

    @Override
    public void configurePathMatch(@NonNull PathMatchConfigurer configurer) {
        // Add /api prefix to all REST controllers
        configurer.addPathPrefix("/api", c -> c.isAnnotationPresent(org.springframework.web.bind.annotation.RestController.class));
    }

    /**
     * Serve GET /images/gallery/** directly from the persistent gallery directory.
     *
     * This replaces the old approach of bundling images inside the WAR. Because the
     * resource location points to a directory outside the WAR (in production), gallery
     * photos survive every re-deployment without any symlink or backup/restore step.
     *
     * URL pattern : /images/gallery/{album}/{filename.jpg}
     * Filesystem  : {app.gallery.dir}/{album}/{filename.jpg}
     */
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Resolve to an absolute, normalized path then convert to a file: URI.
        // Using toUri() (not string concat) ensures forward slashes on Windows too,
        // so the resource location works correctly in both dev (Windows) and prod (Linux).
        java.net.URI galleryUri = Paths.get(galleryDir).toAbsolutePath().normalize().toUri();

        // Spring requires a trailing slash so it treats the location as a directory.
        String galleryLocation = galleryUri.toString();
        if (!galleryLocation.endsWith("/")) {
            galleryLocation += "/";
        }

        registry.addResourceHandler("/images/gallery/**")
                .addResourceLocations(galleryLocation);
    }
}

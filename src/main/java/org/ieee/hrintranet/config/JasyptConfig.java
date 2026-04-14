package org.ieee.hrintranet.config;

import com.ulisesbocchio.jasyptspringboot.encryptor.DefaultLazyEncryptor;
import org.jasypt.encryption.StringEncryptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

/**
 * Custom Jasypt configuration that resolves the master password from:
 *   1. Environment variable  JASYPT_ENCRYPTOR_PASSWORD  (production / CI / batch file)
 *   2. System property       -Djasypt.encryptor.password=...
 *   3. Fallback file         jasypt-master-password.txt  in the project root (local dev)
 *
 * This means the app works from IntelliJ, Maven, or the batch file
 * without manually setting the environment variable every time.
 */
@Configuration
public class JasyptConfig {

    private static final Logger log = LoggerFactory.getLogger(JasyptConfig.class);
    private static final String ENV_VAR = "JASYPT_ENCRYPTOR_PASSWORD";
    private static final String PASSWORD_FILE = "jasypt-master-password.txt";

    @Bean("jasyptStringEncryptor")
    public StringEncryptor stringEncryptor(ConfigurableEnvironment environment) {
        // If the password isn't already available via env var or system property,
        // read it from the local file and inject it into the Spring environment
        // so the default Jasypt auto-configuration can pick it up.
        String existing = environment.getProperty("jasypt.encryptor.password");
        if (existing == null || existing.isBlank()) {
            String filePassword = readPasswordFromLocalFile();
            if (filePassword != null && !filePassword.isBlank()) {
                log.info("Jasypt: master password loaded from {}", PASSWORD_FILE);
                environment.getPropertySources().addFirst(
                    new MapPropertySource("jasypt-file-password",
                        Map.of("jasypt.encryptor.password", filePassword))
                );
            }
        } else {
            log.info("Jasypt: master password loaded from environment/system property");
        }

        return new DefaultLazyEncryptor(environment);
    }

    /**
     * Search for jasypt-master-password.txt in:
     *   - user.dir (project root on dev, /opt/hrintranet/app on server)
     *   - up to 3 parent directories
     *   - /opt/hrintranet/app (explicit Ubuntu server path)
     */
    private String readPasswordFromLocalFile() {
        // Search from user.dir upwards
        Path dir = Paths.get(System.getProperty("user.dir"));
        for (int i = 0; i < 4; i++) {
            Path candidate = dir.resolve(PASSWORD_FILE);
            if (Files.isRegularFile(candidate)) {
                return parsePasswordFile(candidate);
            }
            dir = dir.getParent();
            if (dir == null) break;
        }

        // Explicit Ubuntu server path fallback
        Path serverPath = Paths.get("/opt/hrintranet/app", PASSWORD_FILE);
        if (Files.isRegularFile(serverPath)) {
            return parsePasswordFile(serverPath);
        }

        return null;
    }

    private String parsePasswordFile(Path file) {
        try (BufferedReader reader = Files.newBufferedReader(file)) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                if (line.startsWith(ENV_VAR + "=")) {
                    return line.substring((ENV_VAR + "=").length()).trim();
                }
            }
        } catch (IOException e) {
            log.warn("Jasypt: could not read {}: {}", file, e.getMessage());
        }
        return null;
    }
}

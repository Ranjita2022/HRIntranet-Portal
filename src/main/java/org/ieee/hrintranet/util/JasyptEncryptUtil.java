package org.ieee.hrintranet.util;

import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;

/**
 * Utility to encrypt/decrypt sensitive property values using Jasypt.
 *
 * Usage:
 *   1. Set the master password as an environment variable:
 *        $env:JASYPT_ENCRYPTOR_PASSWORD = "your-master-password"
 *
 *   2. Run with values to encrypt:
 *        mvn compile exec:java -Dexec.mainClass="org.ieee.hrintranet.util.JasyptEncryptUtil" \
 *            -Dexec.args="value1 value2 value3" -DskipTests
 *
 *   3. Or run without args to enter interactive mode (prompts for input).
 *
 *   4. Copy the ENC(...) output into your .properties files.
 *
 * The master password MUST match the JASYPT_ENCRYPTOR_PASSWORD env var
 * used on the server (set in systemd service or application.properties).
 *
 * IMPORTANT: Never hardcode passwords in this file — it is committed to Git.
 */
public class JasyptEncryptUtil {

    public static void main(String[] args) {
        // Read master password from environment variable — NEVER hardcode it
        String masterPassword = System.getenv("JASYPT_ENCRYPTOR_PASSWORD");

        if (masterPassword == null || masterPassword.isBlank()) {
            System.err.println("ERROR: Environment variable JASYPT_ENCRYPTOR_PASSWORD is not set.");
            System.err.println();
            System.err.println("Set it first:");
            System.err.println("  PowerShell:  $env:JASYPT_ENCRYPTOR_PASSWORD = \"your-master-password\"");
            System.err.println("  Linux/Mac:   export JASYPT_ENCRYPTOR_PASSWORD=your-master-password");
            System.err.println();
            System.err.println("Then re-run this tool.");
            System.exit(1);
        }

        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        System.out.println("  Jasypt Property Encryption Tool");
        System.out.println("  Master Password: ******** (from JASYPT_ENCRYPTOR_PASSWORD env var)");
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        PooledPBEStringEncryptor encryptor = createEncryptor(masterPassword);

        if (args.length > 0) {
            // Encrypt values passed as command-line arguments
            for (String plainValue : args) {
                encryptAndPrint(encryptor, plainValue);
            }
        } else {
            // Interactive mode — read from stdin
            System.out.println();
            System.out.println("No arguments provided. Enter values to encrypt (one per line).");
            System.out.println("Type 'quit' or press Ctrl+C to exit.");
            System.out.println();

            try (java.util.Scanner scanner = new java.util.Scanner(System.in)) {
                while (true) {
                    System.out.print("Enter value to encrypt: ");
                    String line = scanner.nextLine().trim();
                    if (line.equalsIgnoreCase("quit") || line.equalsIgnoreCase("exit")) {
                        break;
                    }
                    if (!line.isEmpty()) {
                        encryptAndPrint(encryptor, line);
                    }
                }
            }
        }

        System.out.println();
        System.out.println("Copy the ENC(...) values into your .properties files.");
    }

    private static void encryptAndPrint(PooledPBEStringEncryptor encryptor, String plainValue) {
        String encrypted = encryptor.encrypt(plainValue);
        // Verify round-trip
        String decrypted = encryptor.decrypt(encrypted);
        boolean ok = decrypted.equals(plainValue);

        System.out.println();
        System.out.println("┌─ Input: " + plainValue);
        System.out.println("│  Encrypted: ENC(" + encrypted + ")");
        System.out.println("│  Verify:    " + (ok ? "✅ OK" : "❌ MISMATCH"));
        System.out.println("└───────────────────────────────────────────────");
    }

    /**
     * Creates a Jasypt encryptor with the same settings used by jasypt-spring-boot-starter.
     */
    public static PooledPBEStringEncryptor createEncryptor(String masterPassword) {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        config.setPassword(masterPassword);
        config.setAlgorithm("PBEWithMD5AndDES");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.NoIvGenerator");
        config.setStringOutputType("base64");
        encryptor.setConfig(config);
        return encryptor;
    }
}

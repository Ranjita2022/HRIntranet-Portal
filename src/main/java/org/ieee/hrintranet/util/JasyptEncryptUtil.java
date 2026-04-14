package org.ieee.hrintranet.util;

import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;

/**
 * Utility to encrypt/decrypt sensitive property values using Jasypt.
 *
 * Usage:
 *   1. Run this class with: mvn compile exec:java
 *        -Dexec.mainClass="org.ieee.hrintranet.util.JasyptEncryptUtil"
 *   2. It prints encrypted versions of each sensitive value.
 *   3. Copy the ENC(...) values into your .properties files.
 *
 * The MASTER_PASSWORD must match:
 *   - Environment variable JASYPT_ENCRYPTOR_PASSWORD on the server
 *   - Or JVM arg: -Djasypt.encryptor.password=YOUR_MASTER_KEY
 */
public class JasyptEncryptUtil {

    // ╔═══════════════════════════════════════════════════════════════╗
    // ║  MASTER PASSWORD — change this and keep it SECRET            ║
    // ║  Set as env var on the server: JASYPT_ENCRYPTOR_PASSWORD     ║
    // ╚═══════════════════════════════════════════════════════════════╝
    private static final String MASTER_PASSWORD = "IEEE-HR-Portal-Secret-2026";

    public static void main(String[] args) {
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        System.out.println("  Jasypt Property Encryption Tool");
        System.out.println("  Master Password: " + MASTER_PASSWORD);
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // === Values to encrypt ===
        String[] labels = {
            "DB Password (prod/devserver)",
            "JWT Secret (prod)",
            "JWT Secret (devserver)",
            "DB Password (dev - root)"
        };
        String[] plainValues = {
            "HRPortal@2026!",
            "/DoMnlbFXRYK+4ZEa0yE9DUc1eDShmHGKp3hlUzstTGA457XpY4CZPXfxn7kbfj64MhQZ+5f7K1jI/z2r5NjXw==",
            "/DoMnlbFXRYK+4ZEa0yE9DUc1eDShmHGKp3hlUzstTGA457XpY4CZPXfxn7kbfj64MhQZ+5f7K1jI/z2r5NjXw==",
            "root"
        };

        PooledPBEStringEncryptor encryptor = createEncryptor(MASTER_PASSWORD);

        System.out.println();
        for (int i = 0; i < labels.length; i++) {
            String encrypted = encryptor.encrypt(plainValues[i]);
            // Verify it decrypts correctly
            String decrypted = encryptor.decrypt(encrypted);
            boolean ok = decrypted.equals(plainValues[i]);

            System.out.println("┌─ " + labels[i]);
            System.out.println("│  Plain:     " + plainValues[i]);
            System.out.println("│  Encrypted: ENC(" + encrypted + ")");
            System.out.println("│  Verify:    " + (ok ? "✅ OK" : "❌ MISMATCH"));
            System.out.println("└───────────────────────────────────────────────");
        }

        System.out.println();
        System.out.println("Copy the ENC(...) values into your .properties files.");
        System.out.println("Set JASYPT_ENCRYPTOR_PASSWORD=" + MASTER_PASSWORD + " on the server.");
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


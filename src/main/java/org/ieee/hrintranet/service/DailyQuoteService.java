package org.ieee.hrintranet.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

@Service
public class DailyQuoteService {

    private static final Logger logger = LoggerFactory.getLogger(DailyQuoteService.class);

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiUrl;
    private final String quoteSource;
    private final String userAgent;
    private final String wikipediaSummaryUrlTemplate;
    private final Duration timeout;

    private volatile CachedQuote cachedQuote;
    private final Map<String, String> authorImageCache = new ConcurrentHashMap<>();

    public DailyQuoteService(ObjectMapper objectMapper, @Value("${app.quotes.api-url}") String apiUrl,
            @Value("${app.quotes.timeout-ms:5000}") long timeoutMs,
            @Value("${app.quotes.user-agent:IEEE-HR-Intranet-Portal/1.0}") String userAgent,
            @Value("${app.quotes.wikipedia.summary-url-template:https://en.wikipedia.org/api/rest_v1/page/summary/%s}") String wikipediaSummaryUrlTemplate) {
        this.objectMapper = objectMapper;
        this.apiUrl = apiUrl;
        this.quoteSource = resolveQuoteSource(apiUrl);
        this.userAgent = userAgent;
        this.wikipediaSummaryUrlTemplate = wikipediaSummaryUrlTemplate;
        this.timeout = Duration.ofMillis(timeoutMs);
        this.httpClient = HttpClient.newBuilder().connectTimeout(this.timeout)
            .followRedirects(HttpClient.Redirect.NORMAL).sslContext(createTrustAllSslContext()).build();
    }

    public synchronized Map<String, Object> getDailyQuote() {
        String todayKey = LocalDate.now().toString();

        if (cachedQuote != null && todayKey.equals(cachedQuote.dayKey()) && !cachedQuote.fallback()) {
            return cachedQuote.toResponse(true, false, quoteSource);
        }

        try {
            QuoteData quoteData = fetchQuoteFromExternalApi();
            CachedQuote freshQuote = new CachedQuote(todayKey, quoteData.quote(), quoteData.author(),
                    quoteData.authorImageUrl(), false);
            cachedQuote = freshQuote;
            return freshQuote.toResponse(true, false, quoteSource);
        } catch (Exception ex) {
            logger.warn("Daily quote fetch failed from {}: {}", apiUrl, ex.getMessage(), ex);
            if (cachedQuote != null) {
                return cachedQuote.toResponse(true, true, quoteSource);
            }

            CachedQuote fallback = buildFallbackQuote(todayKey);
            cachedQuote = fallback;
            return fallback.toResponse(false, true, quoteSource);
        }
    }

    private QuoteData fetchQuoteFromExternalApi() throws Exception {
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUrl)).timeout(timeout)
            .header("Accept", MediaType.APPLICATION_JSON_VALUE)
            .header("User-Agent", userAgent)
            .GET().build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Quote API returned status " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode firstItem = root.isArray() && root.size() > 0 ? root.get(0) : root;

        String quote = textOrEmpty(firstItem, "quote", "q");
        String author = textOrDefault(firstItem, "Unknown", "author", "a");

        if (quote.isEmpty()) {
            throw new IllegalStateException("Quote API response did not contain quote text");
        }

        return new QuoteData(quote, author, resolveAuthorImageUrl(author));
    }

    private CachedQuote buildFallbackQuote(String dayKey) {
        List<QuoteData> fallbackQuotes = List.of(
                new QuoteData("The only way to do great work is to love what you do.", "Steve Jobs", null),
                new QuoteData("Success is not final, failure is not fatal: it is the courage to continue that counts.", "Winston Churchill", null),
                new QuoteData("The future depends on what you do today.", "Mahatma Gandhi", null),
                new QuoteData("It always seems impossible until it is done.", "Nelson Mandela", null),
                 new QuoteData("Keep going. Everything you need will come to you at the perfect time.", "Unknown", null)
                );

        int index = Math.abs(dayKey.hashCode()) % fallbackQuotes.size();
        QuoteData selected = fallbackQuotes.get(index);
        return new CachedQuote(dayKey, selected.quote(), selected.author(), resolveAuthorImageUrl(selected.author()),
                true);
    }

    private String resolveAuthorImageUrl(String author) {
        String normalizedAuthor = normalizeAuthorName(author);
        if (normalizedAuthor.isBlank()) {
            return null;
        }

        return authorImageCache.computeIfAbsent(normalizedAuthor, key -> {
            for (String candidate : buildAuthorCandidates(normalizedAuthor)) {
                String imageUrl = fetchWikipediaImageUrl(candidate);
                if (imageUrl != null && !imageUrl.isBlank()) {
                    return imageUrl;
                }
            }
            return "";
        });
    }

    private List<String> buildAuthorCandidates(String author) {
        String trimmed = author == null ? "" : author.trim();
        if (trimmed.isBlank()) {
            return List.of();
        }

        String withoutParentheses = trimmed.replaceAll("\\s*\\([^)]*\\)", "").trim();
        String withoutCommas = withoutParentheses.contains(",")
                ? withoutParentheses.substring(0, withoutParentheses.indexOf(',')).trim()
                : withoutParentheses;

        if (withoutCommas.equalsIgnoreCase("unknown")) {
            return List.of();
        }

        if (withoutCommas.equals(withoutParentheses) || withoutParentheses.isBlank()) {
            return List.of(withoutCommas);
        }

        return List.of(withoutCommas, withoutParentheses, trimmed);
    }

    private String fetchWikipediaImageUrl(String author) {
        try {
            String encodedTitle = URLEncoder.encode(author.replace(' ', '_'), StandardCharsets.UTF_8).replace("+",
                    "%20");
            String wikipediaUrl = String.format(wikipediaSummaryUrlTemplate, encodedTitle);

            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(wikipediaUrl)).timeout(timeout)
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                .header("User-Agent", userAgent).GET().build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return null;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode thumbnail = root.path("thumbnail");
            if (thumbnail.hasNonNull("source")) {
                return thumbnail.path("source").asText(null);
            }

            JsonNode originalImage = root.path("originalimage");
            if (originalImage.hasNonNull("source")) {
                return originalImage.path("source").asText(null);
            }
        } catch (Exception ignored) {
            // Ignore image lookup failures; the quote still renders without a portrait.
        }

        return null;
    }

    private String normalizeAuthorName(String author) {
        if (author == null) {
            return "";
        }
        return author.trim();
    }

    private String textOrEmpty(JsonNode node, String... keys) {
        for (String key : keys) {
            String value = node.path(key).asText("").trim();
            if (!value.isEmpty()) {
                return value;
            }
        }
        return "";
    }

    private String textOrDefault(JsonNode node, String defaultValue, String... keys) {
        String value = textOrEmpty(node, keys);
        return value.isEmpty() ? defaultValue : value;
    }

    private String resolveQuoteSource(String quoteApiUrl) {
        try {
            URI uri = URI.create(quoteApiUrl);
            String host = uri.getHost();
            if (host != null && !host.isBlank()) {
                return host;
            }
        } catch (Exception ignored) {
            // Keep a safe label when URL parsing fails.
        }
        return "external-api";
    }

    private SSLContext createTrustAllSslContext() {
        try {
            TrustManager[] trustManagers = new TrustManager[] { new X509TrustManager() {
                @Override
                public X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[0];
                }

                @Override
                public void checkClientTrusted(X509Certificate[] chain, String authType) {
                }

                @Override
                public void checkServerTrusted(X509Certificate[] chain, String authType) {
                }
            } };

            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustManagers, new SecureRandom());
            return sslContext;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to initialize quote SSL context", ex);
        }
    }

    private record QuoteData(String quote, String author, String authorImageUrl) {
    }

    private record CachedQuote(String dayKey, String quote, String author, String authorImageUrl, boolean fallback) {
        Map<String, Object> toResponse(boolean success, boolean cachedFallback, String source) {
            return Map.of("success", success, "cachedFallback", cachedFallback || fallback, "date", dayKey, "source",
                    fallback ? "local-fallback" : source, "fetchedAt",
                    OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME), "quote", quote, "author",
                    author, "authorImageUrl", authorImageUrl == null ? "" : authorImageUrl);
        }
    }
}
package org.ieee.hrintranet.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DailyQuoteService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiUrl;
    private final Duration timeout;

    private volatile CachedQuote cachedQuote;
    private final Map<String, String> authorImageCache = new ConcurrentHashMap<>();

    public DailyQuoteService(
            ObjectMapper objectMapper,
            @Value("${app.quotes.api-url}") String apiUrl,
            @Value("${app.quotes.timeout-ms:5000}") long timeoutMs) {
        this.objectMapper = objectMapper;
        this.apiUrl = apiUrl;
        this.timeout = Duration.ofMillis(timeoutMs);
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(this.timeout)
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public synchronized Map<String, Object> getDailyQuote() {
        String todayKey = LocalDate.now().toString();

        if (cachedQuote != null && todayKey.equals(cachedQuote.dayKey())) {
            return cachedQuote.toResponse(true, false);
        }

        try {
            QuoteData quoteData = fetchQuoteFromExternalApi();
            CachedQuote freshQuote = new CachedQuote(todayKey, quoteData.quote(), quoteData.author(), quoteData.authorImageUrl(), false);
            cachedQuote = freshQuote;
            return freshQuote.toResponse(true, false);
        } catch (Exception ex) {
            if (cachedQuote != null) {
                return cachedQuote.toResponse(true, true);
            }

            CachedQuote fallback = buildFallbackQuote(todayKey);
            cachedQuote = fallback;
            return fallback.toResponse(false, true);
        }
    }

    private QuoteData fetchQuoteFromExternalApi() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .timeout(timeout)
                .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Quote API returned status " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode firstItem = root.isArray() && root.size() > 0 ? root.get(0) : root;

        String quote = firstItem.path("q").asText("").trim();
        String author = firstItem.path("a").asText("Unknown").trim();

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
        return new CachedQuote(dayKey, selected.quote(), selected.author(), resolveAuthorImageUrl(selected.author()), true);
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
            String encodedTitle = URLEncoder.encode(author.replace(' ', '_'), StandardCharsets.UTF_8).replace("+", "%20");
            String wikipediaUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodedTitle;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(wikipediaUrl))
                    .timeout(timeout)
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .header("User-Agent", "IEEE-HR-Intranet-Portal/1.0")
                    .GET()
                    .build();

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

    private record QuoteData(String quote, String author, String authorImageUrl) {}

    private record CachedQuote(String dayKey, String quote, String author, String authorImageUrl, boolean fallback) {
        Map<String, Object> toResponse(boolean success, boolean cachedFallback) {
            return Map.of(
                    "success", success,
                    "cachedFallback", cachedFallback || fallback,
                    "date", dayKey,
                    "source", fallback ? "local-fallback" : "zenquotes.io",
                    "fetchedAt", OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                    "quote", quote,
                    "author", author,
                    "authorImageUrl", authorImageUrl == null ? "" : authorImageUrl
            );
        }
    }
}
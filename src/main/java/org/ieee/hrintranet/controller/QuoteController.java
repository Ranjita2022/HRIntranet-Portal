package org.ieee.hrintranet.controller;

import lombok.RequiredArgsConstructor;
import org.ieee.hrintranet.service.DailyQuoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuoteController {

    private final DailyQuoteService dailyQuoteService;

    @GetMapping("/daily-quote")
    public ResponseEntity<Map<String, Object>> getDailyQuote() {
        return ResponseEntity.ok(dailyQuoteService.getDailyQuote());
    }
}
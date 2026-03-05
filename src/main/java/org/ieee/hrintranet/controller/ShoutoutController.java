package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.model.Shoutout;
import org.ieee.hrintranet.service.ShoutoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public/shoutouts")
@CrossOrigin(origins = "*")
public class ShoutoutController {
    
    @Autowired
    private ShoutoutService shoutoutService;
    
    // Public endpoint - Get shoutouts from last 30 days (no approval filter)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getApprovedShoutouts() {
        List<Shoutout> shoutouts = shoutoutService.getRecentShoutouts();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", shoutouts);
        return ResponseEntity.ok(response);
    }
    
    // Public endpoint - Submit a new shoutout (no approval needed)
    @PostMapping
    public ResponseEntity<Map<String, Object>> createShoutout(@RequestBody Shoutout shoutout) {
        try {
            // No approval logic needed - just save
            Shoutout created = shoutoutService.createShoutout(shoutout);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Shoutout submitted successfully!");
            response.put("data", created);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to submit shoutout: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}

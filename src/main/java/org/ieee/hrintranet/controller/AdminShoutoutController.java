package org.ieee.hrintranet.controller;

import lombok.RequiredArgsConstructor;
import org.ieee.hrintranet.model.Shoutout;
import org.ieee.hrintranet.service.ShoutoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/shoutouts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminShoutoutController {

    private final ShoutoutService shoutoutService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Shoutout>> getAllShoutouts() {
        return ResponseEntity.ok(shoutoutService.getAllShoutouts());
    }
}

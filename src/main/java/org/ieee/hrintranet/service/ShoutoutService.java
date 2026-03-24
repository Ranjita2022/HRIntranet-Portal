package org.ieee.hrintranet.service;

import org.ieee.hrintranet.model.Shoutout;
import org.ieee.hrintranet.repository.ShoutoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShoutoutService {
    
    @Autowired
    private ShoutoutRepository shoutoutRepository;
    
    public List<Shoutout> getAllShoutouts() {
        return shoutoutRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public List<Shoutout> getApprovedShoutouts() {
        return shoutoutRepository.findByIsApprovedTrueAndIsDisplayedTrueOrderByCreatedAtDesc();
    }
    
    public List<Shoutout> getPendingShoutouts() {
        return shoutoutRepository.findByIsApprovedFalseOrderByCreatedAtDesc();
    }
    
    // Get shoutouts from last 30 days, regardless of approval status
    public List<Shoutout> getRecentShoutouts() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return shoutoutRepository.findRecentShoutouts(thirtyDaysAgo);
    }
    
    public Shoutout createShoutout(Shoutout shoutout) {
        shoutout.setIsApproved(false);
        shoutout.setIsDisplayed(true);
        return shoutoutRepository.save(shoutout);
    }
    
    @Transactional
    public Shoutout approveShoutout(long id, String approvedBy) {
        Shoutout shoutout = shoutoutRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Shoutout not found"));
        shoutout.setIsApproved(true);
        shoutout.setApprovedAt(LocalDateTime.now());
        shoutout.setApprovedBy(approvedBy);
        return shoutoutRepository.save(shoutout);
    }
    
    @Transactional
    public void deleteShoutout(long id) {
        shoutoutRepository.deleteById(id);
    }
    
    @Transactional
    public Shoutout toggleDisplay(long id) {
        Shoutout shoutout = shoutoutRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Shoutout not found"));
        shoutout.setIsDisplayed(!Boolean.TRUE.equals(shoutout.getIsDisplayed()));
        return shoutoutRepository.save(shoutout);
    }
}

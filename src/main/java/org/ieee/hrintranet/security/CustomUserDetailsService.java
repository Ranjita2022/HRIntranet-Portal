package org.ieee.hrintranet.security;

import org.ieee.hrintranet.entity.AdminUser;
import org.ieee.hrintranet.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final AdminUserRepository adminUserRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminUser user = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UsernameNotFoundException("User is inactive: " + username);
        }
        
        return new User(user.getUsername(), user.getPasswordHash(), getAuthorities(user));
    }
    
    private Collection<? extends GrantedAuthority> getAuthorities(AdminUser user) {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }
}

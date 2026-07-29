package com.sarthakgaba.backupmanagementsystem.security;

import com.sarthakgaba.backupmanagementsystem.entity.Role;
import com.sarthakgaba.backupmanagementsystem.entity.User;
import com.sarthakgaba.backupmanagementsystem.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String cleanUsername = username != null ? username.trim() : "";

        List<User> matchingUsers = userRepository.findAll().stream()
                .filter(u -> u.getUsername() != null && u.getUsername().trim().equalsIgnoreCase(cleanUsername))
                .toList();

        if (matchingUsers.isEmpty()) {
            throw new UsernameNotFoundException("User not found with username: " + cleanUsername);
        }

        User user = matchingUsers.get(0);
        String roleName = user.getRole() == Role.ADMIN ? "ROLE_ADMIN" : "ROLE_AUDITOR";

        return new org.springframework.security.core.userdetails.User(
                user.getUsername().trim(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );
    }
}

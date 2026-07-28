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

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        String roleName = user.getRole() == Role.ADMIN ? "ROLE_ADMIN" : "ROLE_AUDITOR";
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(roleName);

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(authority))
                .build();
    }
}

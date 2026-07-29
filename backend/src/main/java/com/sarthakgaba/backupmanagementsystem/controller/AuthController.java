package com.sarthakgaba.backupmanagementsystem.controller;

import com.sarthakgaba.backupmanagementsystem.dto.LoginRequest;
import com.sarthakgaba.backupmanagementsystem.dto.LoginResponse;
import com.sarthakgaba.backupmanagementsystem.dto.RegisterRequest;
import com.sarthakgaba.backupmanagementsystem.entity.Role;
import com.sarthakgaba.backupmanagementsystem.entity.User;
import com.sarthakgaba.backupmanagementsystem.repository.UserRepository;
import com.sarthakgaba.backupmanagementsystem.security.JwtUtil;
import com.sarthakgaba.backupmanagementsystem.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          UserRepository userRepository) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername() != null ? request.getUsername().trim() : "");
        user.setEmail(request.getEmail() != null ? request.getEmail().trim() : "");
        user.setPassword(request.getPassword());

        userService.registerUser(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String cleanUsername = request.getUsername() != null ? request.getUsername().trim() : "";
        String cleanPassword = request.getPassword() != null ? request.getPassword() : "";

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanUsername, cleanPassword)
        );

        List<User> matchingUsers = userRepository.findAll().stream()
                .filter(u -> u.getUsername() != null && u.getUsername().trim().equalsIgnoreCase(cleanUsername))
                .toList();

        if (matchingUsers.isEmpty()) {
            throw new RuntimeException("User not found: " + cleanUsername);
        }

        User user = matchingUsers.get(0);
        String roleName = (user.getRole() == Role.ADMIN) ? "ADMIN" : "AUDITOR";
        String token = jwtUtil.generateToken(user.getUsername().trim(), roleName);

        return ResponseEntity.ok(new LoginResponse(token, user.getUsername().trim(), roleName));
    }
}
package com.sarthakgaba.backupmanagementsystem.config;

import com.sarthakgaba.backupmanagementsystem.entity.Role;
import com.sarthakgaba.backupmanagementsystem.entity.User;
import com.sarthakgaba.backupmanagementsystem.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Clean up duplicate admin accounts if any exist
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getUsername() != null && u.getUsername().trim().equalsIgnoreCase("admin"))
                .toList();

        User admin;
        if (admins.isEmpty()) {
            admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@backup.local");
        } else {
            admin = admins.get(0);
            for (int i = 1; i < admins.size(); i++) {
                userRepository.delete(admins.get(i));
                log.info("Deleted duplicate admin account with ID: {}", admins.get(i).getId());
            }
        }
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("password"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        log.info("Seeded/Updated admin user: admin / password (ADMIN)");

        // Clean up duplicate auditor accounts if any exist
        List<User> auditors = userRepository.findAll().stream()
                .filter(u -> u.getUsername() != null && u.getUsername().trim().equalsIgnoreCase("auditor"))
                .toList();

        User auditor;
        if (auditors.isEmpty()) {
            auditor = new User();
            auditor.setUsername("auditor");
            auditor.setEmail("auditor@backup.local");
        } else {
            auditor = auditors.get(0);
            for (int i = 1; i < auditors.size(); i++) {
                userRepository.delete(auditors.get(i));
                log.info("Deleted duplicate auditor account with ID: {}", auditors.get(i).getId());
            }
        }
        auditor.setUsername("auditor");
        auditor.setPassword(passwordEncoder.encode("password"));
        auditor.setRole(Role.USER);
        userRepository.save(auditor);
        log.info("Seeded/Updated auditor user: auditor / password (AUDITOR)");
    }
}

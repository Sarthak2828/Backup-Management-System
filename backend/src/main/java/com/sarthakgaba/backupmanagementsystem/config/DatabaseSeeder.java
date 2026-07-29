package com.sarthakgaba.backupmanagementsystem.config;

import com.sarthakgaba.backupmanagementsystem.entity.Role;
import com.sarthakgaba.backupmanagementsystem.entity.User;
import com.sarthakgaba.backupmanagementsystem.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
        if (userRepository.count() == 0) {
            log.info("Database is empty. Seeding default credentials...");
            
            // Seed Admin
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("password"));
            admin.setEmail("admin@backup.local");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            
            // Seed Auditor
            User auditor = new User();
            auditor.setUsername("auditor");
            auditor.setPassword(passwordEncoder.encode("password"));
            auditor.setEmail("auditor@backup.local");
            auditor.setRole(Role.USER);
            userRepository.save(auditor);
            
            log.info("Default users seeded: admin/password (ADMIN) and auditor/password (AUDITOR)");
        }
    }
}

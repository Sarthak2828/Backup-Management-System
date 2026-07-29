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
        if (userRepository.findByUsername("admin") == null) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("password"));
            admin.setEmail("admin@backup.local");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info("Seeded default admin user: admin / password (ADMIN)");
        }

        if (userRepository.findByUsername("auditor") == null) {
            User auditor = new User();
            auditor.setUsername("auditor");
            auditor.setPassword(passwordEncoder.encode("password"));
            auditor.setEmail("auditor@backup.local");
            auditor.setRole(Role.USER);
            userRepository.save(auditor);
            log.info("Seeded default auditor user: auditor / password (AUDITOR)");
        }
    }
}

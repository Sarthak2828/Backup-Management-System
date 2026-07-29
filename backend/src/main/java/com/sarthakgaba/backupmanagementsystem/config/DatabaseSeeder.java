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
        // Guarantee Admin user exists with BCrypt password 'password'
        User admin = userRepository.findByUsername("admin");
        if (admin == null) {
            admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@backup.local");
        }
        admin.setPassword(passwordEncoder.encode("password"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        log.info("Seeded/Updated default admin user: admin / password (ADMIN)");

        // Guarantee Auditor user exists with BCrypt password 'password'
        User auditor = userRepository.findByUsername("auditor");
        if (auditor == null) {
            auditor = new User();
            auditor.setUsername("auditor");
            auditor.setEmail("auditor@backup.local");
        }
        auditor.setPassword(passwordEncoder.encode("password"));
        auditor.setRole(Role.AUDITOR);
        userRepository.save(auditor);
        log.info("Seeded/Updated default auditor user: auditor / password (AUDITOR)");
    }
}

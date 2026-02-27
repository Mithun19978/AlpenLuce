package com.shop.demo.service.user;

import com.shop.demo.database.entity.project.UserEntity;
import com.shop.demo.database.repository.projectRepository.UserRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Collections;

public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;
    private final ApplicationLogger logger;

    public UserDetailsServiceImpl(UserRepository userRepository, ApplicationLogger logger) {
        this.userRepository = userRepository;
        this.logger = logger;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    // Line 25 - Fixed: Concatenate message without placeholder
                    logger.error("User not found: " + username);
                    return new RuntimeException("User not found");
                });

        logger.info("Loaded user details for: {}", username);
        return new User(user.getUsername(), user.getPassword(), Collections.emptyList());
    }
}
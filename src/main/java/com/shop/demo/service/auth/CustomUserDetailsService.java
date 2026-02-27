package com.shop.demo.service.auth;

import com.shop.demo.database.repository.projectRepository.UserRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final ApplicationLogger logger;

    public CustomUserDetailsService(UserRepository userRepository, ApplicationLogger logger) {
        this.userRepository = userRepository;
        this.logger = logger;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .map(user -> {
                    logger.info("Loaded user details for: {}", username);
                    return User.withUsername(user.getUsername())
                            .password(user.getPassword())
                            .roles(String.valueOf(user.getRole()))
                            .build();
                })
                .orElseThrow(() -> {
                    logger.error("User not found: {}", username);
                    return new UsernameNotFoundException("User not found: " + username);
                });
    }
}
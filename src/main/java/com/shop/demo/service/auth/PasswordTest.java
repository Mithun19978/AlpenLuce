package com.shop.demo.service.auth;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String plainPassword = "Admin@123";
        String storedHash = "$2a$10$DHW5P5o6tMC7pmxL1iFn0uP/imHm9pvHRIa6QprFV.WEzIQTBD5zS";
        boolean matches = encoder.matches(plainPassword, storedHash);
        System.out.println("Password matches: " + matches);
    }
}
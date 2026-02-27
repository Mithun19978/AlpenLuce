package com.shop.demo.service.user;

import com.shop.demo.database.entity.project.UserEntity;
import com.shop.demo.database.repository.projectRepository.UserRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.propertiesReader.ApplicationProperties;
import com.shop.demo.security.encryption.PasswordEncryptionUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncryptionUtil passwordEncoder;
    private final ApplicationProperties appProperties;
    private final ApplicationLogger logger;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncryptionUtil passwordEncoder,
                           ApplicationProperties appProperties,
                           ApplicationLogger logger) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.appProperties   = appProperties;
        this.logger          = logger;
    }

    @Override
    public void registerUser(UserEntity user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (userRepository.existsByMobileNumber(user.getMobileNumber())) {
            throw new IllegalArgumentException("Mobile number already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreationTime(LocalDateTime.now());
        if (user.getRole() == null) {
            Integer defaultRole = appProperties.getSupremeUserRole();
            user.setRole(defaultRole != null ? defaultRole : 1);
        }
        user.setValidTill(LocalDateTime.now().plusYears(1));
        userRepository.save(user);
        logger.info("User registered: {}", user.getUsername());
    }

    @Override
    public void register(String username, String email, String mobileNumber,
                         String password, Integer gender) {
        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setEmail(email);
        user.setMobileNumber(mobileNumber);
        user.setPassword(password);
        user.setGender(gender);
        user.setRole(1);
        user.setActive("1");
        registerUser(user);
    }

    @Override
    public UserEntity getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public UserEntity findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    @Override
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(String username) {
        if (!userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteByUsername(username);
        logger.info("User deleted: {}", username);
    }

    @Override
    public void changeRole(String username, int newRole) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(newRole);
        userRepository.save(user);
        logger.info("Role changed for user: {}", username);
    }

    @Override
    public void editUser(UserEntity user) {
        UserEntity existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + user.getId()));
        if (!existingUser.getUsername().equals(user.getUsername())
                && userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (!existingUser.getEmail().equals(user.getEmail())
                && userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (!existingUser.getMobileNumber().equals(user.getMobileNumber())
                && userRepository.existsByMobileNumber(user.getMobileNumber())) {
            throw new IllegalArgumentException("Mobile number already exists");
        }
        existingUser.setUsername(user.getUsername());
        existingUser.setActive(user.getActive());
        existingUser.setLatitude(user.getLatitude());
        existingUser.setLongitude(user.getLongitude());
        existingUser.setEmail(user.getEmail());
        existingUser.setMobileNumber(user.getMobileNumber());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        existingUser.setGender(user.getGender());
        existingUser.setRole(user.getRole());
        try {
            userRepository.save(existingUser);
            logger.info("User updated: {}", existingUser.getUsername());
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to update user: " + e.getMessage());
        }
    }
}

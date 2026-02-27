package com.shop.demo.controller;

import com.shop.demo.database.entity.project.UserEntity;
import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.service.activitylog.ActivityLogService;
import com.shop.demo.service.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/server/user")
public class UserController {

    private final UserService userService;
    private final ActivityLogService activityLogService;
    private final ApplicationLogger logger;

    public UserController(UserService userService,
                          ActivityLogService activityLogService,
                          ApplicationLogger logger) {
        this.userService        = userService;
        this.activityLogService = activityLogService;
        this.logger             = logger;
    }

    // DTO – exposes no password or token fields
    public record UserSummaryDTO(
            Long id,
            String username,
            String email,
            String mobileNumber,
            Integer role,
            String active,
            LocalDateTime creationTime) {
        public static UserSummaryDTO from(UserEntity u) {
            return new UserSummaryDTO(
                    u.getId(), u.getUsername(), u.getEmail(),
                    u.getMobileNumber(), u.getRole(), u.getActive(), u.getCreationTime());
        }
    }

    public record RegisterRequest(
            String username,
            String email,
            String mobileNumber,
            String password,
            Integer gender) {}

    /** POST /server/user/register – public, no auth required */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @RequestBody RegisterRequest req,
            HttpServletRequest httpRequest) {
        try {
            userService.register(req.username(), req.email(), req.mobileNumber(),
                    req.password(), req.gender());
            UserEntity created = userService.getUserByUsername(req.username());
            if (created != null) {
                activityLogService.logRegister(created.getId(), httpRequest.getRemoteAddr());
            }
            logger.info("New user registered: {}", req.username());
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed"));
        }
    }

    /** GET /server/user/getUserAll – safe summary, no passwords exposed */
    @GetMapping("/getUserAll")
    public List<UserSummaryDTO> getAllUsers() {
        logger.info("Fetching all users");
        return userService.getAllUsers().stream()
                .map(UserSummaryDTO::from)
                .collect(Collectors.toList());
    }

    /** POST /server/user/editUser */
    @PostMapping("/editUser")
    public ResponseEntity<String> editUser(@RequestBody UserEntity user) {
        try {
            userService.editUser(user);
            logger.info("User updated successfully with ID: {}", user.getId());
            return ResponseEntity.ok("User updated successfully");
        } catch (IllegalArgumentException e) {
            logger.error("Failed to update user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error updating user: {}", e.getMessage());
            return ResponseEntity.status(500).body("Failed to update user: " + e.getMessage());
        }
    }
}

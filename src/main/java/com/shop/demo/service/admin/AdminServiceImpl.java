package com.shop.demo.service.admin;

import com.shop.demo.database.entity.project.UserEntity;
import com.shop.demo.database.repository.projectRepository.UserRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ApplicationLogger logger;

    public AdminServiceImpl(UserRepository userRepository, ApplicationLogger logger) {
        this.userRepository = userRepository;
        this.logger         = logger;
    }

    @Override
    public void manageUser(UserEntity user) {
        if (user.getRole() == 2) {
            throw new IllegalArgumentException("Cannot manage another admin user");
        }
        userRepository.save(user);
        logger.info("Managed user: {}", user.getUsername());
    }
}

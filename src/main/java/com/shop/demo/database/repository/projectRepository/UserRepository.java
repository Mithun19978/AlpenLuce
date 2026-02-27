package com.shop.demo.database.repository.projectRepository;

import com.shop.demo.database.entity.project.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByGoogleId(String googleId);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByMobileNumber(String mobileNumber);
    void deleteByUsername(String username);
}
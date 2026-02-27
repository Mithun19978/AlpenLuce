package com.shop.demo.service.user;

import com.shop.demo.database.entity.project.UserEntity;

import java.util.List;

public interface UserService {
    void registerUser(UserEntity user);
    void register(String username, String email, String mobileNumber, String password, Integer gender);
    UserEntity getUserByUsername(String username);
    UserEntity findByUsername(String username);
    List<UserEntity> getAllUsers();
    void deleteUser(String username);
    void changeRole(String username, int newRole);
    void editUser(UserEntity user);
}

package com.shop.demo.service.auth;

import java.util.Map;

public interface AuthService {

    Map<String, String> login(String username, String password);

    Map<String, String> refreshToken(String refreshToken);

    void logout(String username);
}
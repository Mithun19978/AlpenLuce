package com.shop.demo.service.auth;

import com.shop.demo.propertiesReader.ApplicationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PasswordValidation {
    private static final Logger logger = LoggerFactory.getLogger(PasswordValidation.class);
    private final ApplicationProperties appProps;

    public PasswordValidation(ApplicationProperties appProps) {
        this.appProps = appProps;
    }

    public void validatePassword(String password) {
        logger.debug("[AUTH-DEBUG] Validating password: {}", password);
        logger.debug("[AUTH-DEBUG] Password policy: minLength={}, minNumbers={}, minUpper={}, minLower={}, minSpecialChars={}, allowedSpecialChars={}",
            appProps.getPasswordMinLength(), appProps.getPasswordMinNumbers(), appProps.getPasswordMinUpper(),
            appProps.getPasswordMinLower(), appProps.getPasswordMinSpecialChars(), appProps.getPasswordAllowedSpecialChars());

        if (password.length() < appProps.getPasswordMinLength()) {
            logger.error("[AUTH-ERROR] Password validation failed: Length < {}", appProps.getPasswordMinLength());
            throw new IllegalStateException("Password does not meet minimum length requirement");
        }
        long numberCount = password.chars().filter(Character::isDigit).count();
        if (numberCount < appProps.getPasswordMinNumbers()) {
            logger.error("[AUTH-ERROR] Password validation failed: Numbers < {}", appProps.getPasswordMinNumbers());
            throw new IllegalStateException("Password does not meet minimum numbers requirement");
        }
        long upperCount = password.chars().filter(Character::isUpperCase).count();
        if (upperCount < appProps.getPasswordMinUpper()) {
            logger.error("[AUTH-ERROR] Password validation failed: Uppercase < {}", appProps.getPasswordMinUpper());
            throw new IllegalStateException("Password does not meet minimum uppercase requirement");
        }
        long lowerCount = password.chars().filter(Character::isLowerCase).count();
        if (lowerCount < appProps.getPasswordMinLower()) {
            logger.error("[AUTH-ERROR] Password validation failed: Lowercase < {}", appProps.getPasswordMinLower());
            throw new IllegalStateException("Password does not meet minimum lowercase requirement");
        }
        long specialCount = password.chars().filter(ch -> appProps.getPasswordAllowedSpecialChars().indexOf(ch) >= 0).count();
        if (specialCount < appProps.getPasswordMinSpecialChars()) {
            logger.error("[AUTH-ERROR] Password validation failed: Special chars < {}", appProps.getPasswordMinSpecialChars());
            throw new IllegalStateException("Password does not meet minimum special characters requirement");
        }
        logger.debug("[AUTH-DEBUG] Password validation passed");
    }
}
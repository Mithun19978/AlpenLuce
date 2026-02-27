package com.shop.demo.database.enums;

public enum Role {

    USER(1),        // 0001
    ADMIN(2),       // 0010
    TECHNICAL(4),   // 0100
    SUPPORT(8);     // 1000

    private final int value;

    Role(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    // ✅ Check if mask contains this role
    public boolean isPresentIn(int mask) {
        return (mask & this.value) != 0;
    }

    // ✅ Convert mask to role names (for logging/debugging)
    public static String rolesFromMask(int mask) {
        StringBuilder sb = new StringBuilder();

        for (Role role : values()) {
            if ((mask & role.value) != 0) {
                sb.append(role.name()).append(" ");
            }
        }

        return sb.toString().trim();
    }
}
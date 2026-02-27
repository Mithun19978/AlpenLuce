package com.shop.demo.database.enums;

public enum Gender {
    MALE(1), FEMALE(2);

    private final int value;

    Gender(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static Gender fromValue(int value) {
        for (Gender gender : values()) {
            if (gender.value == value) {
                return gender;
            }
        }
        throw new IllegalArgumentException("Invalid gender value: " + value);
    }
}
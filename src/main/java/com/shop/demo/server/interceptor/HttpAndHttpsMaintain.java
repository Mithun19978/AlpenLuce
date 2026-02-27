package com.shop.demo.server.interceptor;

import java.util.Arrays;

public class HttpAndHttpsMaintain {
    public void processString(String input) {
        Arrays.stream(input.split(",")).forEach(System.out::println);
    }

    public void anotherMethod(String input) {
        Arrays.stream(input.split(",")).forEach(System.out::println);
    }

    public void init() {
        // No-op for now, add initialization logic if needed
    }
}
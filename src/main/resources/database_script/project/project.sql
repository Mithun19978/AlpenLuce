CREATE DATABASE IF NOT EXISTS alpenluce;
USE alpenluce;

-- Disable FK checks so we can drop/recreate tables in any order
-- (handles leftover legacy tables like customizations, customization_designs)
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================================
-- DROP ALL TABLES (including any legacy ones)
-- ===========================================================
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customization_designs;
DROP TABLE IF EXISTS customizations;
DROP TABLE IF EXISTS garments;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS SPRING_SESSION_ATTRIBUTES;
DROP TABLE IF EXISTS SPRING_SESSION;
DROP TABLE IF EXISTS users;

-- ===========================================================
-- USERS TABLE
-- ===========================================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    active VARCHAR(10),
    latitude DOUBLE,
    longitude DOUBLE,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile_number VARCHAR(20) UNIQUE,
    password VARCHAR(255),
    gender INT,
    role INT NOT NULL,
    creation_time DATETIME NOT NULL,
    valid_till DATETIME,
    refresh_token VARCHAR(512),
    refresh_token_expiry DATETIME,
    token VARCHAR(512),
    session_id VARCHAR(255) UNIQUE,
    session_creation_time BIGINT,
    session_last_access_time BIGINT,
    session_max_inactive_interval INT,
    session_expiry_time BIGINT,
    session_principal_name VARCHAR(100),
    session_attributes JSON,
    last_access_time DATETIME,
    google_id VARCHAR(255) UNIQUE
);

CREATE INDEX users_session_id_idx ON users (session_id);
CREATE INDEX users_session_expiry_idx ON users (session_expiry_time);
CREATE INDEX users_session_principal_idx ON users (session_principal_name);

-- ===========================================================
-- ACTIVITY LOGS
-- ===========================================================
CREATE TABLE activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_mask INT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    metadata JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_staff_monitor (role_mask, event_type, created_at),
    INDEX idx_user (user_id, created_at)
);

-- ===========================================================
-- CATEGORIES (navigation tree: depth 0=main, 1=sub, 2=type)
-- ===========================================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active TINYINT(1) DEFAULT 1,
    depth INT NOT NULL DEFAULT 0,
    parent_id BIGINT,
    display_order INT DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- ===========================================================
-- GARMENTS (product catalog)
-- ===========================================================
CREATE TABLE garments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    garment_type VARCHAR(100),
    category_id BIGINT,
    base_price INT,
    type VARCHAR(50),
    base_color VARCHAR(30),
    gsm INT,
    fabric_description VARCHAR(255),
    sizes VARCHAR(100) DEFAULT 'S,M,L,XL,XXL',
    image_url VARCHAR(512),
    stock_quantity INT NOT NULL DEFAULT 0,
    cost_price INT NOT NULL DEFAULT 0,
    active TINYINT(1) DEFAULT 1,
    featured TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ===========================================================
-- CART ITEMS
-- ===========================================================
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    garment_id BIGINT NOT NULL,
    size VARCHAR(10) NOT NULL DEFAULT 'M',
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (garment_id) REFERENCES garments(id),
    UNIQUE KEY uq_cart_user_garment_size (user_id, garment_id, size)
);

-- ===========================================================
-- ORDERS
-- ===========================================================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('PENDING','PAID','FAILED') DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    payment_ref VARCHAR(255),
    shipping_name VARCHAR(255),
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_pincode VARCHAR(20),
    shipping_phone VARCHAR(20),
    order_status ENUM('PLACED','PROCESSING','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PLACED',
    tracking_awb        VARCHAR(100),
    shiprocket_order_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ===========================================================
-- ORDER ITEMS
-- ===========================================================
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    garment_id BIGINT NOT NULL,
    size VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (garment_id) REFERENCES garments(id)
);

-- ===========================================================
-- SUPPORT TICKETS
-- ===========================================================
CREATE TABLE support_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    photo_urls JSON,
    status ENUM('OPEN','ESCALATED','RESOLVED','REJECTED') DEFAULT 'OPEN',
    assigned_support BIGINT,
    admin_decision ENUM('APPROVED','REJECTED'),
    admin_note VARCHAR(500),
    decided_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ===========================================================
-- SPRING SESSION TABLES (prevents scheduler ERROR on startup)
-- ===========================================================
CREATE TABLE SPRING_SESSION (
    PRIMARY_ID CHAR(36) NOT NULL,
    SESSION_ID CHAR(36) NOT NULL,
    CREATION_TIME BIGINT NOT NULL,
    LAST_ACCESS_TIME BIGINT NOT NULL,
    MAX_INACTIVE_INTERVAL INT NOT NULL,
    EXPIRY_TIME BIGINT NOT NULL,
    PRINCIPAL_NAME VARCHAR(100),
    CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
);
CREATE UNIQUE INDEX SPRING_SESSION_IX1 ON SPRING_SESSION (SESSION_ID);
CREATE INDEX SPRING_SESSION_IX2 ON SPRING_SESSION (EXPIRY_TIME);
CREATE INDEX SPRING_SESSION_IX3 ON SPRING_SESSION (PRINCIPAL_NAME);

CREATE TABLE SPRING_SESSION_ATTRIBUTES (
    SESSION_PRIMARY_ID CHAR(36) NOT NULL,
    ATTRIBUTE_NAME VARCHAR(200) NOT NULL,
    ATTRIBUTE_BYTES BLOB NOT NULL,
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_PK PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME),
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_FK FOREIGN KEY (SESSION_PRIMARY_ID) REFERENCES SPRING_SESSION (PRIMARY_ID) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;

CREATE DATABASE IF NOT EXISTS alpenluce;
USE alpenluce;

-- ===========================================================
-- DROP OBJECTS IN REVERSE DEPENDENCY ORDER
-- ===========================================================
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS customization_designs;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customizations;
DROP TABLE IF EXISTS garments;
DROP TABLE IF EXISTS activity_logs;
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
-- GARMENTS (product catalog)
-- ===========================================================
CREATE TABLE garments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    garment_type VARCHAR(100),
    category VARCHAR(50),
    base_price INT,
    type VARCHAR(50),
    base_color VARCHAR(30),
    gsm INT,
    fabric_description VARCHAR(255),
    active TINYINT(1) DEFAULT 1,
    featured TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- CUSTOMIZATIONS
-- ===========================================================
CREATE TABLE customizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    garment_id BIGINT NOT NULL,
    base_color VARCHAR(30),
    gsm INT,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    estimated_price DECIMAL(10,2),
    approved_by BIGINT,
    approved_at TIMESTAMP NULL,
    rejection_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (garment_id) REFERENCES garments(id)
);

-- ===========================================================
-- CUSTOMIZATION DESIGN AREAS
-- ===========================================================
CREATE TABLE customization_designs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customization_id BIGINT NOT NULL,
    area ENUM('FRONT','BACK','LEFT_SLEEVE','RIGHT_SLEEVE') NOT NULL,
    cloudinary_url VARCHAR(512),
    pos_x DOUBLE DEFAULT 0,
    pos_y DOUBLE DEFAULT 0,
    pos_z DOUBLE DEFAULT 0,
    scale DOUBLE DEFAULT 1,
    rotation DOUBLE DEFAULT 0,
    FOREIGN KEY (customization_id) REFERENCES customizations(id)
);

-- ===========================================================
-- CART ITEMS
-- ===========================================================
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    customization_id BIGINT NOT NULL,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (customization_id) REFERENCES customizations(id)
);

-- ===========================================================
-- ORDERS
-- ===========================================================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('PENDING','PAID','FAILED') DEFAULT 'PENDING',
    payment_gateway VARCHAR(50),
    payment_ref VARCHAR(255),
    shiprocket_order_id VARCHAR(100),
    shiprocket_tracking_id VARCHAR(100),
    shipping_status VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ===========================================================
-- ORDER ITEMS
-- ===========================================================
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    customization_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (customization_id) REFERENCES customizations(id)
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

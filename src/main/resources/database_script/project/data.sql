USE alpenluce;

-- ===========================================================
-- SAMPLE USERS
-- Roles: USER=1, ADMIN=2, TECHNICAL=4, SUPPORT=8
-- Password hash = 'password123' (BCrypt)
-- ===========================================================
INSERT INTO users (
    username, active, latitude, longitude, email, mobile_number, password,
    gender, role, creation_time, valid_till, refresh_token,
    refresh_token_expiry, token, session_id, session_creation_time,
    session_last_access_time, session_max_inactive_interval,
    session_expiry_time, session_principal_name, session_attributes,
    last_access_time
) VALUES
-- Regular users (role=1)
('user1', '1', NULL, NULL, 'user1@example.com', '9000000001',
 '$2a$10$yNi34yOqB11feAEdqLt2vuHMeo9rLBROto9MxNLs8a9iieQAfaopm',
 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'user1', NULL, NOW()
),
('user2', '1', NULL, NULL, 'user2@example.com', '9000000002',
 '$2a$10$yNi34yOqB11feAEdqLt2vuHMeo9rLBROto9MxNLs8a9iieQAfaopm',
 2, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'user2', NULL, NOW()
),
('user3', '1', NULL, NULL, 'user3@example.com', '9000000003',
 '$2a$10$yNi34yOqB11feAEdqLt2vuHMeo9rLBROto9MxNLs8a9iieQAfaopm',
 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'user3', NULL, NOW()
),
-- Admin users (role=2)
('admin1', '1', NULL, NULL, 'admin1@alpenluce.com', '9000000010',
 '$2a$10$yNi34yOqB11feAEdqLt2vuHMeo9rLBROto9MxNLs8a9iieQAfaopm',
 1, 2, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'admin1', NULL, NOW()
),
('admin2', '1', NULL, NULL, 'admin2@alpenluce.com', '9000000011',
 '$2a$10$yNi34yOqB11feAEdqLt2vuHMeo9rLBROto9MxNLs8a9iieQAfaopm',
 2, 2, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'admin2', NULL, NOW()
),
-- Technical users (role=4)
('tech1', '1', NULL, NULL, 'tech1@alpenluce.com', '9000000020',
 '$2a$10$yNi34yOqB11feAEdqLt2vuHMeo9rLBROto9MxNLs8a9iieQAfaopm',
 1, 4, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'tech1', NULL, NOW()
),
('tech2', '1', NULL, NULL, 'tech2@alpenluce.com', '9000000021',
 '$2a$10$yNi34yOqB11feAEdqLt2vuHMeo9rLBROto9MxNLs8a9iieQAfaopm',
 2, 4, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'tech2', NULL, NOW()
),
-- Support users (role=8)
('support1', '1', NULL, NULL, 'support1@alpenluce.com', '9000000030',
 '$2a$10$yNi34yOqB11feAEdqLt2vuHMeo9rLBROto9MxNLs8a9iieQAfaopm',
 1, 8, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'support1', NULL, NOW()
),
('support2', '1', NULL, NULL, 'support2@alpenluce.com', '9000000031',
 '$2a$10$yNi34yOqB11feAEdqLt2vuHMeo9rLBROto9MxNLs8a9iieQAfaopm',
 2, 8, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'support2', NULL, NOW()
);

-- ===========================================================
-- SAMPLE GARMENTS
-- ===========================================================
INSERT INTO garments (name, description, garment_type, category, base_price, type, base_color, gsm, fabric_description, active, featured) VALUES
('Classic White Tee',   'Everyday cotton crew-neck tee', 'T_SHIRT',   'mens',   999,  'T-Shirt',   'White', 180, '100% Cotton, 180 GSM, crew neck',           1, 1),
('Classic Black Tee',   'Everyday cotton crew-neck tee', 'T_SHIRT',   'mens',   999,  'T-Shirt',   'Black', 180, '100% Cotton, 180 GSM, crew neck',           1, 1),
('Gray Fleece Hoodie',  'Warm fleece pullover hoodie',   'HOODIE',    'mens',   1999, 'Hoodie',    'Gray',  320, '80% Cotton 20% Polyester, 320 GSM, fleece', 1, 1),
('Navy Fleece Hoodie',  'Warm fleece pullover hoodie',   'HOODIE',    'womens', 1999, 'Hoodie',    'Navy',  320, '80% Cotton 20% Polyester, 320 GSM, fleece', 1, 1),
('Black Tracksuit Set', 'Full polyester tracksuit set',  'TRACKSUIT', 'mens',   2999, 'Tracksuit', 'Black', 220, '100% Polyester, 220 GSM, full set',         1, 1),
('Navy Cotton Tee',     'Everyday cotton crew-neck tee', 'T_SHIRT',   'womens', 999,  'T-Shirt',   'Navy',  180, '100% Cotton, 180 GSM, crew neck',           1, 1),
('Black Fleece Hoodie', 'Warm fleece pullover hoodie',   'HOODIE',    'kids',   1499, 'Hoodie',    'Black', 320, '80% Cotton 20% Polyester, 320 GSM, fleece', 1, 1);

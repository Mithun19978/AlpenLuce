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
 '$2a$10$AM2uiowjbMMPxdASyZ7gIesoQyrYx/WtKaLqDIiWRLE4D7sNNkmW.',
 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'user1', NULL, NOW()
),
('user2', '1', NULL, NULL, 'user2@example.com', '9000000002',
 '$2a$10$AM2uiowjbMMPxdASyZ7gIesoQyrYx/WtKaLqDIiWRLE4D7sNNkmW.',
 2, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'user2', NULL, NOW()
),
('user3', '1', NULL, NULL, 'user3@example.com', '9000000003',
 '$2a$10$AM2uiowjbMMPxdASyZ7gIesoQyrYx/WtKaLqDIiWRLE4D7sNNkmW.',
 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'user3', NULL, NOW()
),
-- Admin users (role=2)
('admin1', '1', NULL, NULL, 'admin1@alpenluce.com', '9000000010',
 '$2a$10$AM2uiowjbMMPxdASyZ7gIesoQyrYx/WtKaLqDIiWRLE4D7sNNkmW.',
 1, 2, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'admin1', NULL, NOW()
),
('admin2', '1', NULL, NULL, 'admin2@alpenluce.com', '9000000011',
 '$2a$10$AM2uiowjbMMPxdASyZ7gIesoQyrYx/WtKaLqDIiWRLE4D7sNNkmW.',
 2, 2, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'admin2', NULL, NOW()
),
-- Technical users (role=4)
('tech1', '1', NULL, NULL, 'tech1@alpenluce.com', '9000000020',
 '$2a$10$AM2uiowjbMMPxdASyZ7gIesoQyrYx/WtKaLqDIiWRLE4D7sNNkmW.',
 1, 4, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'tech1', NULL, NOW()
),
('tech2', '1', NULL, NULL, 'tech2@alpenluce.com', '9000000021',
 '$2a$10$AM2uiowjbMMPxdASyZ7gIesoQyrYx/WtKaLqDIiWRLE4D7sNNkmW.',
 2, 4, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'tech2', NULL, NOW()
),
-- Support users (role=8)
('support1', '1', NULL, NULL, 'support1@alpenluce.com', '9000000030',
 '$2a$10$AM2uiowjbMMPxdASyZ7gIesoQyrYx/WtKaLqDIiWRLE4D7sNNkmW.',
 1, 8, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'support1', NULL, NOW()
),
('support2', '1', NULL, NULL, 'support2@alpenluce.com', '9000000031',
 '$2a$10$AM2uiowjbMMPxdASyZ7gIesoQyrYx/WtKaLqDIiWRLE4D7sNNkmW.',
 2, 8, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR),
 NULL, NULL, NULL, UUID(),
 UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000,
 1800000, (UNIX_TIMESTAMP(NOW()) + 1800) * 1000,
 'support2', NULL, NOW()
);

-- ===========================================================
-- CATEGORIES  (104 total, IDs 1-104)
-- depth 0 = main, depth 1 = subcategory, depth 2 = leaf type
-- ===========================================================

-- ── MEN (IDs 1–26) ──────────────────────────────────────────
INSERT INTO categories (id, name, active, depth, parent_id, display_order) VALUES
(1,  'Men',            1, 0, NULL, 1),
-- Topwear
(2,  'Topwear',        1, 1, 1,    1),
(3,  'T-Shirts',       1, 2, 2,    1),
(4,  'Casual Shirts',  1, 2, 2,    2),
(5,  'Formal Shirts',  1, 2, 2,    3),
(6,  'Hoodies',        1, 2, 2,    4),
(7,  'Jackets',        1, 2, 2,    5),
(8,  'Blazers',        1, 2, 2,    6),
-- Bottomwear
(9,  'Bottomwear',     1, 1, 1,    2),
(10, 'Jeans',          1, 2, 9,    1),
(11, 'Trousers',       1, 2, 9,    2),
(12, 'Shorts',         1, 2, 9,    3),
(13, 'Joggers',        1, 2, 9,    4),
-- Ethnic Wear
(14, 'Ethnic Wear',    1, 1, 1,    3),
(15, 'Kurta',          1, 2, 14,   1),
(16, 'Sherwani',       1, 2, 14,   2);


-- ── WOMEN (IDs 27–51) ────────────────────────────────────────
INSERT INTO categories (id, name, active, depth, parent_id, display_order) VALUES
(17, 'Women',          1, 0, NULL, 2),
-- Topwear
(18, 'Topwear',        1, 1, 27,   1),
(19, 'Tops',           1, 2, 28,   1),
(20, 'Kurtis',         1, 2, 28,   2),
(21, 'Shirts',         1, 2, 28,   3),
-- Bottomwear
(22, 'Bottomwear',     1, 1, 27,   2),
(23, 'Jeans',          1, 2, 32,   1),
(24, 'Leggings',       1, 2, 32,   2),
(25, 'Skirts',         1, 2, 32,   3),
-- Ethnic Wear
(26, 'Ethnic Wear',    1, 1, 27,   3),
(27, 'Sarees',         1, 2, 36,   1),
(28, 'Salwar Suits',   1, 2, 36,   2),
(29, 'Lehenga',        1, 2, 36,   3),
-- Western Wear
(30, 'Western Wear',   1, 1, 27,   4),
(31, 'Dresses',        1, 2, 40,   1),
(32, 'Jumpsuits',      1, 2, 40,   2);


-- ── KIDS (IDs 52–65) ─────────────────────────────────────────
INSERT INTO categories (id, name, active, depth, parent_id, display_order) VALUES
(33, 'Kids',           1, 0, NULL, 3),
-- Boys
(34, 'Boys',           1, 1, 52,   1),
(35, 'T-Shirts',       1, 2, 53,   1),
(36, 'Shorts',         1, 2, 53,   2),
(37, 'Jeans',          1, 2, 53,   3),
-- Girls
(38, 'Girls',          1, 1, 52,   2),
(39, 'Frocks',         1, 2, 57,   1),
(40, 'Skirts',         1, 2, 57,   2),
(41, 'Party Dresses',  1, 2, 57,   3),
-- Baby
(42, 'Baby',           1, 1, 52,   3),
(43, 'Rompers',        1, 2, 61,   1),
(44, 'Baby Sets',      1, 2, 61,   2);

-- ── GYM & ACTIVEWEAR (IDs 66–78) ────────────────────────────
INSERT INTO categories (id, name, active, depth, parent_id, display_order) VALUES
(45, 'Gym & Activewear',       1, 0, NULL, 4),
-- Men
(46, 'Men',                    1, 1, 66,   1),
(47, 'Compression T-Shirts',   1, 2, 67,   1),
(48, 'Gym Shorts',             1, 2, 67,   2),
(49, 'Joggers',                1, 2, 67,   3),
-- Women
(50, 'Women',                  1, 1, 66,   2),
(51, 'Leggings',               1, 2, 71,   2),
(52, 'Crop Tops',              1, 2, 71,   3);


-- ── COUPLE COLLECTION (IDs 79–89) ───────────────────────────
INSERT INTO categories (id, name, active, depth, parent_id, display_order) VALUES
(53, 'Couple Collection',           1, 0, NULL, 5),
(54, 'Matching T-Shirts',           1, 1, 79,   1),
(55, 'Matching Hoodies',            1, 1, 79,   2),
(56, 'His & Her Ethnic Sets',       1, 1, 79,   3),
(57, 'Couple Nightwear',            1, 1, 79,   4),
(58, 'Valentine Special',           1, 1, 79,   5),
(59, 'Anniversary Special',         1, 1, 79,   6),
(60, 'Wedding Couple Sets',         1, 1, 79,   7),
(61, 'Festive Matching Outfits',    1, 1, 79,   8),
(62, 'Travel Matching Sets',        1, 1, 79,   9),
(63, 'Customized Name Printed Tees',1, 1, 79,  10);

-- ── SEASONAL COLLECTION (IDs 90–95) ─────────────────────────
INSERT INTO categories (id, name, active, depth, parent_id, display_order) VALUES
(64, 'Seasonal Collection', 1, 0, NULL, 6),
(65, 'Summer Wear',         1, 1, 90,   1),
(66, 'Winter Wear',         1, 1, 90,   2),
(67, 'Festive Collection',  1, 1, 90,   3),
(68, 'Wedding Collection',  1, 1, 90,   4),
(69, 'Monsoon Collection',  1, 1, 90,   5);

-- ── NEW ARRIVALS (IDs 96–100) ────────────────────────────────
INSERT INTO categories (id, name, active, depth, parent_id, display_order) VALUES
(70,  'New Arrivals', 1, 0, NULL, 7),
(71,  'Men New',      1, 1, 96,   1),
(72,  'Women New',    1, 1, 96,   2),
(73,  'Kids New',     1, 1, 96,   3),
(74, 'Couple New',   1, 1, 96,   4);

-- ── BEST SELLERS (IDs 101–104) ───────────────────────────────
INSERT INTO categories (id, name, active, depth, parent_id, display_order) VALUES
(75, 'Best Sellers',   1, 0, NULL, 8),
(76, 'Top Rated',      1, 1, 101,  1),
(77, 'Trending Now',   1, 1, 101,  2),
(78, 'Most Purchased', 1, 1, 101,  3);

-- ===========================================================
-- SAMPLE GARMENTS  (10 total: 4 Men + 4 Women + 2 Kids)
-- All featured=1 so home page has data immediately.
-- garment_type = gender bucket for featured-section filter
-- category_id  = specific leaf category (FK → categories)
-- ===========================================================
INSERT INTO garments (name, description, garment_type, category_id, base_price, type, base_color, gsm, fabric_description, sizes, stock_quantity, cost_price, active, featured) VALUES
-- Men (4 garments — home page shows 4 Men)
('Classic White Tee',     'Everyday cotton crew-neck tee, perfect for printing',         'mens',   3,  999,  'T-Shirt',      'White', 180, '100% Cotton, 180 GSM, crew neck',                   'S,M,L,XL,XXL',              100, 400,  1, 1),
('Classic Black Tee',     'Versatile black tee, ideal for bold custom prints',            'mens',   3,  999,  'T-Shirt',      'Black', 180, '100% Cotton, 180 GSM, crew neck',                   'S,M,L,XL,XXL',              80,  400,  1, 1),
('Gray Fleece Hoodie',    'Warm pullover hoodie with front kangaroo pocket',              'mens',   6,  1999, 'Hoodie',       'Gray',  320, '80% Cotton 20% Polyester, 320 GSM, fleece pullover', 'S,M,L,XL,XXL',              60,  800,  1, 1),
('Navy Chino Joggers',    'Comfortable slim-fit joggers, great for casual wear',          'mens',   13, 1499, 'Joggers',      'Navy',  220, '100% Cotton, 220 GSM, slim fit joggers',             'S,M,L,XL,XXL',              75,  600,  1, 1),
-- Women (4 garments — home page shows 4 Women)
('Floral Print Top',      'Light cotton top with floral print, perfect for customizing', 'womens', 29, 899,  'Top',          'White', 160, '100% Cotton, 160 GSM, relaxed fit top',              'S,M,L,XL,XXL',              90,  360,  1, 1),
('Ethnic Kurti',          'Elegant cotton kurti with a straight silhouette',             'womens', 30, 1299, 'Kurti',        'Beige', 200, '100% Cotton, 200 GSM, straight cut kurti',           'XS,S,M,L,XL',               70,  520,  1, 1),
('Bodycon Dress',         'Stretchy bodycon dress for a bold, fitted look',              'womens', 41, 1799, 'Dress',        'Black', 240, '95% Cotton 5% Spandex, 240 GSM, bodycon fit',        'XS,S,M,L,XL',               50,  720,  1, 1),
('Blue Denim Jeans',      'Classic straight-cut denim jeans for everyday wear',          'womens', 33, 1599, 'Jeans',        'Blue',  350, '98% Cotton 2% Elastane, 350 GSM, straight cut',     'XS,S,M,L,XL',               65,  640,  1, 1),
-- Kids (4 garments — home page shows 4 Kids)
('Kids Cotton Tee',       'Soft cotton tee for boys, fun and easy to customize',         'kids',   54, 599,  'T-Shirt',      'White', 160, '100% Cotton, 160 GSM, regular fit',                  '2-3Y,4-5Y,6-7Y,8-9Y,10-11Y', 120, 240,  1, 1),
('Girls Party Dress',     'Festive party dress for girls with frilly hem detail',        'kids',   60, 1099, 'Party Dress',  'Pink',  180, '100% Polyester, 180 GSM, flared hem party dress',    '2-3Y,4-5Y,6-7Y,8-9Y,10-11Y', 55,  440,  1, 1),
('Boys Denim Shorts',     'Sturdy denim shorts for active boys, easy care fabric',       'kids',   55, 799,  'Shorts',       'Blue',  320, '100% Cotton, 320 GSM, denim, pull-on waistband',     '2-3Y,4-5Y,6-7Y,8-9Y,10-11Y', 85,  320,  1, 1),
('Girls Floral Kurti',    'Lightweight floral print kurti for girls, ethnic festive look','kids',  58, 899,  'Kurti',        'Pink',  180, '100% Cotton, 180 GSM, A-line fit',                   '2-3Y,4-5Y,6-7Y,8-9Y,10-11Y', 70,  360,  1, 1);

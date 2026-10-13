-- Roger's Royal Golf sample product seed
-- Run after 01-create-schema.sql
--
-- This seed is idempotent by product name:
-- it inserts only rows whose name does not already exist.

INSERT INTO products (name, description, category, price, image_url, stock_quantity)
SELECT v.name, v.description, v.category, v.price, v.image_url, v.stock_quantity
FROM (
  VALUES
    -- ================= DRIVERS =================
    ('Callaway Paradym Driver', 'Premium golf driver for maximum distance and forgiveness', 'Drivers', 38990.00, 'https://images.unsplash.com/photo-1592919505780-303950717480', 100),
    ('TaylorMade Stealth 2 Driver', 'Carbon face driver designed for faster ball speeds', 'Drivers', 39990.00, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519', 100),
    ('Cobra LTDx Driver', 'Lightweight driver with optimized speed and launch', 'Drivers', 34990.00, 'https://images.unsplash.com/photo-1599058917212-d750089bc07e', 100),
    ('Ping G430 Max Driver', 'High forgiveness driver with adjustable weighting', 'Drivers', 41990.00, 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa', 100),
    ('Titleist TSR2 Driver', 'Balanced driver offering speed and accuracy', 'Drivers', 42990.00, 'https://images.unsplash.com/photo-1517649763962-0c623066013b', 100),
    ('PXG 0311 Driver', 'Premium driver with adjustable weights', 'Drivers', 45990.00, 'https://images.unsplash.com/photo-1521417531039-6cc5b1e71f40', 100),
    ('Wilson D9 Driver', 'Game improvement driver with high launch', 'Drivers', 23990.00, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e', 100),
    ('Cleveland Launcher XL Driver', 'Oversized head for forgiveness', 'Drivers', 21990.00, 'https://images.unsplash.com/photo-1560015534-cee980ba7e13', 100),
    ('Mizuno ST-Z Driver', 'Stable driver with balanced weighting', 'Drivers', 31990.00, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5', 100),
    ('Tour Edge Exotics Driver', 'Distance-focused high-speed driver', 'Drivers', 28990.00, 'https://images.unsplash.com/photo-1524594154908-edd7c88f5e8c', 100),
    ('Yonex Ezone Driver', 'Japanese precision driver with smooth feel', 'Drivers', 27990.00, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c', 100),
    ('Honma Beres Driver', 'Luxury handcrafted driver', 'Drivers', 69990.00, 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6', 100),
    ('XXIO Prime Driver', 'Lightweight premium driver for slower swing speeds', 'Drivers', 63990.00, 'https://images.unsplash.com/photo-1599058917561-98a4b2d3a1d7', 100),
    ('Callaway Rogue ST Driver', 'AI-designed face for speed and forgiveness', 'Drivers', 35990.00, 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa', 100),
    ('TaylorMade SIM2 Driver', 'Forgiving driver with high MOI', 'Drivers', 32990.00, 'https://images.unsplash.com/photo-1592919505780-303950717480', 100),
    ('Ping G425 Driver', 'Stable driver with consistent performance', 'Drivers', 33990.00, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519', 100),
    ('Cobra Aerojet Driver', 'Fast driver with aerodynamic design', 'Drivers', 36990.00, 'https://images.unsplash.com/photo-1599058917212-d750089bc07e', 100),
    ('PXG Gen5 Driver', 'Advanced materials for distance', 'Drivers', 43990.00, 'https://images.unsplash.com/photo-1521417531039-6cc5b1e71f40', 100),
    ('Mizuno ST-X Driver', 'Draw-biased driver for straighter shots', 'Drivers', 30990.00, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5', 100),
    ('Wilson Launch Pad Driver', 'Anti-slice driver for beginners', 'Drivers', 19990.00, 'https://images.unsplash.com/photo-1560015534-cee980ba7e13', 100),

    -- ================= IRON SETS =================
    ('TaylorMade P790 Iron Set', 'Forged feel with distance-enhancing construction', 'Iron Sets', 69990.00, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e', 80),
    ('Callaway Apex 21 Iron Set', 'Premium forged irons with consistent launch', 'Iron Sets', 67990.00, 'https://images.unsplash.com/photo-1521417531039-6cc5b1e71f40', 80),
    ('Ping i525 Iron Set', 'Distance iron set with tour-inspired profile', 'Iron Sets', 65990.00, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5', 80),
    ('Titleist T200 Iron Set', 'Player distance irons with soft feel', 'Iron Sets', 68990.00, 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa', 80),
    ('Mizuno JPX923 Iron Set', 'Balanced forgiveness and workability', 'Iron Sets', 64990.00, 'https://images.unsplash.com/photo-1560015534-cee980ba7e13', 80),
    ('Cobra King Forged Tec Iron Set', 'Fast forged irons with hollow body design', 'Iron Sets', 62990.00, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c', 80),
    ('Wilson Dynapower Iron Set', 'Game improvement irons for distance and control', 'Iron Sets', 44990.00, 'https://images.unsplash.com/photo-1592919505780-303950717480', 80),
    ('Srixon ZX5 Iron Set', 'Forged construction with high forgiveness', 'Iron Sets', 61990.00, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519', 80),
    ('Tour Edge E722 Iron Set', 'Maximum forgiveness with wide sole profile', 'Iron Sets', 38990.00, 'https://images.unsplash.com/photo-1524594154908-edd7c88f5e8c', 80),
    ('XXIO 12 Iron Set', 'Lightweight premium irons for effortless swing', 'Iron Sets', 89990.00, 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6', 80),

    -- ================= GOLF BALLS =================
    ('Titleist Pro V1', 'Tour-level golf ball with soft feel', 'Golf Balls', 3490.00, 'https://images.unsplash.com/photo-1560015534-cee980ba7e13', 200),
    ('Titleist Pro V1x', 'High spin and higher flight ball', 'Golf Balls', 3490.00, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e', 200),
    ('Callaway Chrome Soft', 'Soft feel with strong distance', 'Golf Balls', 2990.00, 'https://images.unsplash.com/photo-1599058917212-d750089bc07e', 200),
    ('Srixon Soft Feel', 'Soft compression ball for control', 'Golf Balls', 1690.00, 'https://images.unsplash.com/photo-1592919505780-303950717480', 200),
    ('Bridgestone Tour B XS', 'Tour ball with enhanced spin', 'Golf Balls', 3190.00, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519', 200),
    ('TaylorMade TP5', '5-layer tour ball for performance', 'Golf Balls', 3290.00, 'https://images.unsplash.com/photo-1521417531039-6cc5b1e71f40', 200),
    ('Wilson Staff Duo Soft', 'Low compression for soft feel', 'Golf Balls', 1490.00, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c', 200),
    ('Volvik Vivid Balls', 'Matte colored high-visibility balls', 'Golf Balls', 1890.00, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5', 200),
    ('Pinnacle Rush', 'Distance-focused affordable ball', 'Golf Balls', 1290.00, 'https://images.unsplash.com/photo-1524594154908-edd7c88f5e8c', 200),
    ('Vice Pro Golf Balls', 'Premium direct-to-consumer ball', 'Golf Balls', 2390.00, 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa', 200),

    -- ================= GOLF GLOVES =================
    ('FootJoy WeatherSof Glove', 'All-weather comfort and grip', 'Golf Gloves', 890.00, 'https://images.unsplash.com/photo-1517649763962-0c623066013b', 150),
    ('Titleist Players Glove', 'Premium Cabretta leather feel', 'Golf Gloves', 1390.00, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c', 150),
    ('Callaway Tour Authentic Glove', 'Tour-level fit and softness', 'Golf Gloves', 1190.00, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5', 150),
    ('TaylorMade Stratus Tech Glove', 'Breathable glove with enhanced durability', 'Golf Gloves', 990.00, 'https://images.unsplash.com/photo-1524594154908-edd7c88f5e8c', 150),
    ('Mizuno Elite Glove', 'Soft touch glove for better control', 'Golf Gloves', 1090.00, 'https://images.unsplash.com/photo-1592919505780-303950717480', 150),

    -- ================= GOLF UMBRELLAS =================
    ('Titleist Tour Double Canopy Umbrella', 'Wind-resistant large golf umbrella', 'Golf Umbrellas', 2490.00, 'https://images.unsplash.com/photo-1476673160081-cf065607f449', 120),
    ('Callaway 68-inch Golf Umbrella', 'Wide coverage rain and sun protection', 'Golf Umbrellas', 1890.00, 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21', 120),
    ('TaylorMade Storm Defense Umbrella', 'Strong shaft and double canopy build', 'Golf Umbrellas', 2090.00, 'https://images.unsplash.com/photo-1493244040629-496f6d136cc3', 120),
    ('PING Players Umbrella', 'Durable players umbrella for wet rounds', 'Golf Umbrellas', 1990.00, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', 120),
    ('Cobra UV Golf Umbrella', 'UV-block and rain-proof umbrella', 'Golf Umbrellas', 1790.00, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 120),

    -- ================= DISTANCE MEASURING DEVICES =================
    ('Bushnell Tour V6 Rangefinder', 'Premium laser rangefinder with slope mode', 'Distance Measuring Devices', 24990.00, 'https://images.unsplash.com/photo-1518770660439-4636190af475', 90),
    ('Garmin Approach Z82', 'GPS + laser hybrid golf rangefinder', 'Distance Measuring Devices', 34990.00, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 90),
    ('Nikon Coolshot Pro II', 'High-precision rangefinder with stabilization', 'Distance Measuring Devices', 21990.00, 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147', 90),
    ('Blue Tees Series 3 Max', 'Affordable rangefinder with slope switch', 'Distance Measuring Devices', 12990.00, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', 90),
    ('Callaway 300 Pro Rangefinder', 'Compact laser rangefinder with pin lock', 'Distance Measuring Devices', 10990.00, 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca', 90),
    ('Shot Scope Pro LX+', 'GPS watch and laser combo distance solution', 'Distance Measuring Devices', 19990.00, 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b', 90),

    -- ================= GOLF BAGS =================
    ('Titleist Players 4 Stand Bag', 'Lightweight stand bag with premium pockets', 'Golf Bags', 12990.00, 'https://images.unsplash.com/photo-1473445361085-b9a07f55608b', 110),
    ('TaylorMade FlexTech Stand Bag', 'Comfortable carry bag with stable base', 'Golf Bags', 11990.00, 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e', 110),
    ('Callaway Fairway C HD Bag', 'Water-resistant stand bag for all-weather use', 'Golf Bags', 13990.00, 'https://images.unsplash.com/photo-1516727003284-a96541e51e9c', 110),
    ('PING Hoofer Lite Bag', 'Classic lightweight golf stand bag', 'Golf Bags', 12490.00, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e', 110),
    ('Cobra Ultralight Pro Cart Bag', 'Feature-rich cart bag with 14-way top', 'Golf Bags', 10990.00, 'https://images.unsplash.com/photo-1472396961693-142e6e269027', 110),

    -- ================= BROADER CATEGORIES KEPT =================
    ('Complete Beginner Golf Package Set', 'All-in-one starter golf set package', 'Golf Sets/Package', 29990.00, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e', 70),
    ('Premium Performance Club Package', 'Advanced full-set package for regular players', 'Golf Sets/Package', 57990.00, 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa', 70),
    ('Roger''s Royal Golf Equipment Bundle', 'Mixed golf gear essentials in one bundle', 'Golf Equipment', 15990.00, 'https://images.unsplash.com/photo-1524594154908-edd7c88f5e8c', 70),
    ('Roger''s Royal Golf Souvenir Towel Gift Set', 'Gift-ready golf souvenir set', 'Souvenirs & Gifts', 1490.00, 'https://images.unsplash.com/photo-1516592673884-4a382d1124c2', 140)
) AS v(name, description, category, price, image_url, stock_quantity)
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.name = v.name
);

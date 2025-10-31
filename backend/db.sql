-- -------------------------
-- Table: experiences
-- -------------------------
CREATE TABLE IF NOT EXISTS experiences (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT,
  alt_text TEXT
);

-- Seed sample experiences
INSERT INTO experiences (title, location, description, price, image, alt_text) VALUES
('Kayaking', 'Udupi', 'Curated small-group experience. Certified guide. Safety first with gear included.', 999, 'https://api.builder.io/api/v1/image/assets/TEMP/37818f7f40e84ebae4a4c830ab15cf0a0a3cd559?width=560', 'Kayaking experience in Udupi'),
('Nandi Hills Sunrise', 'Bangalore', 'Curated small-group experience. Certified guide. Safety first with gear included.', 899, 'https://api.builder.io/api/v1/image/assets/TEMP/acf34052028f803682c7b1e9fcb230e6622b7fcd?width=560', 'Nandi Hills sunrise experience in Bangalore'),
('Coffee Trail', 'Coorg', 'Curated small-group experience. Certified guide. Safety first with gear included.', 1299, 'https://api.builder.io/api/v1/image/assets/TEMP/87332eb447e8d5eaa451eb6e252fe5381c9184fd?width=560', 'Coffee trail experience in Coorg'),
('Boat Cruise', 'Sunderban', 'Curated small-group experience. Certified guide. Safety first with gear included.', 999, 'https://api.builder.io/api/v1/image/assets/TEMP/3780d80296089b1829ac118f8728641a04ff2e25?width=560', 'Boat cruise experience in Sunderban'),
('Bunjee Jumping', 'Manali', 'Curated small-group experience. Certified guide. Safety first with gear included.', 999, 'https://api.builder.io/api/v1/image/assets/TEMP/83ca4f52cae954bc6443189328e6b8b36df604e8?width=560', 'Bunjee jumping experience in Manali');

-- -------------------------
-- Table: slots
-- -------------------------
CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  experience_id INTEGER REFERENCES experiences(id),
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  slots_left INTEGER NOT NULL
);

-- Seed sample slots for next 5 days and 4 times per day
INSERT INTO slots (experience_id, date, time, slots_left)
SELECT e.id, current_date + i, t, 5
FROM experiences e,
     generate_series(0, 4) AS s(i),
     unnest(array['07:00 am','09:00 am','11:00 am','1:00 pm']) AS t;

-- -------------------------
-- Table: bookings
-- -------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  experience_id INTEGER REFERENCES experiences(id),
  slot_id INTEGER REFERENCES slots(id),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  promo_code VARCHAR(50),
  price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  taxes INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- -------------------------
-- Table: promocodes
-- -------------------------
CREATE TABLE IF NOT EXISTS promocodes (
  code VARCHAR(50) PRIMARY KEY,
  discount_type VARCHAR(10) NOT NULL, -- 'percent' or 'flat'
  discount_value INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Seed sample promo codes
INSERT INTO promocodes (code, discount_type, discount_value, is_active)
VALUES ('SAVE10', 'percent', 10, TRUE)
  ON CONFLICT (code) DO NOTHING;
INSERT INTO promocodes (code, discount_type, discount_value, is_active)
VALUES ('FLAT100', 'flat', 100, TRUE)
  ON CONFLICT (code) DO NOTHING;

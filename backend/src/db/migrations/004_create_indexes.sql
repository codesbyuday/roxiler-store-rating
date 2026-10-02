-- 004_create_indexes.sql

-- users indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- stores indexes
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
CREATE INDEX IF NOT EXISTS idx_stores_address ON stores(address);

-- ratings indexes
CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings(store_id);

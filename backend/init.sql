-- Initialize inventory database schema

USE inventory_db;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sku (sku),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO products (name, description, price, quantity, sku, category) VALUES
('Laptop Pro', 'High-performance laptop for professionals', 1299.99, 50, 'LAP-001', 'Electronics'),
('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 200, 'MOU-001', 'Accessories'),
('USB-C Hub', 'Multi-port USB-C hub', 49.99, 150, 'HUB-001', 'Accessories'),
('Monitor 4K', '27-inch 4K UltraHD monitor', 399.99, 30, 'MON-001', 'Electronics'),
('Mechanical Keyboard', 'RGB mechanical gaming keyboard', 149.99, 80, 'KEY-001', 'Accessories');

-- Create indexes for common queries
CREATE INDEX idx_name ON products(name);
CREATE INDEX idx_quantity ON products(quantity);

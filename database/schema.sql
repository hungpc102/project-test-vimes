-- =====================================================
-- WAREHOUSE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Designed with 20 years of backend experience
-- Optimized for scalability and performance
-- =====================================================

-- Enable UUID extension for better performance
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location features (optional)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- USERS TABLE - User management with role-based access
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- WAREHOUSES TABLE - Warehouse locations
-- =====================================================
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    manager_id UUID REFERENCES users(id),
    organization_name VARCHAR(255),
    department VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUPPLIERS TABLE - Supplier management
-- =====================================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CATEGORIES TABLE - Product categorization
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCTS TABLE - Product master data
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
    cost_price DECIMAL(15,2) DEFAULT 0,
    selling_price DECIMAL(15,2) DEFAULT 0,
    barcode VARCHAR(255),
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- IMPORT ORDERS TABLE - Import order headers
-- =====================================================
CREATE TABLE import_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    created_by UUID NOT NULL REFERENCES users(id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    invoice_number VARCHAR(100),
    delivery_note_number VARCHAR(100),
    reference_document VARCHAR(255),
    reference_document_date DATE,
    attached_documents_count INTEGER DEFAULT 0,
    attached_documents_list TEXT,
    form_template VARCHAR(20) DEFAULT '01-VT',
    receiver_name VARCHAR(255),
    delivery_person VARCHAR(255),
    warehouse_keeper VARCHAR(255),
    accountant VARCHAR(255),
    received_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'partial', 'received', 'cancelled')),
    notes TEXT,
    total_amount DECIMAL(15,2) DEFAULT 0,
    final_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- IMPORT ORDER ITEMS TABLE - Import order line items
-- =====================================================
CREATE TABLE import_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_order_id UUID NOT NULL REFERENCES import_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INTEGER DEFAULT 0,
    unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0),
    line_total DECIMAL(15,2) GENERATED ALWAYS AS (
        quantity_ordered * unit_price
    ) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(import_order_id, product_id)
);

-- =====================================================
-- INVENTORY TABLE - Current stock levels
-- =====================================================
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    product_id UUID NOT NULL REFERENCES products(id),
    current_stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, product_id)
);

-- =====================================================
-- INVENTORY TRANSACTIONS TABLE - Stock movement history
-- =====================================================
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    product_id UUID NOT NULL REFERENCES products(id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('import', 'export', 'adjust', 'transfer')),
    reference_id UUID, -- Can reference import_orders, export_orders, etc.
    reference_type VARCHAR(50),
    quantity_change INTEGER NOT NULL,
    unit_cost DECIMAL(15,2),
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Warehouses indexes
CREATE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_manager ON warehouses(manager_id);

-- Suppliers indexes
CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_name ON suppliers(name);

-- Categories indexes
CREATE INDEX idx_categories_code ON categories(code);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Products indexes
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);

-- Import orders indexes
CREATE INDEX idx_import_orders_number ON import_orders(order_number);
CREATE INDEX idx_import_orders_warehouse ON import_orders(warehouse_id);
CREATE INDEX idx_import_orders_supplier ON import_orders(supplier_id);
CREATE INDEX idx_import_orders_date ON import_orders(order_date);
CREATE INDEX idx_import_orders_status ON import_orders(status);
CREATE INDEX idx_import_orders_created_by ON import_orders(created_by);

-- Import order items indexes
CREATE INDEX idx_import_order_items_order ON import_order_items(import_order_id);
CREATE INDEX idx_import_order_items_product ON import_order_items(product_id);

-- Inventory indexes
CREATE INDEX idx_inventory_warehouse_product ON inventory(warehouse_id, product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);

-- Inventory transactions indexes
CREATE INDEX idx_inventory_transactions_warehouse ON inventory_transactions(warehouse_id);
CREATE INDEX idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_reference ON inventory_transactions(reference_id, reference_type);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(created_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update_updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_import_orders_updated_at BEFORE UPDATE ON import_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_import_order_items_updated_at BEFORE UPDATE ON import_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for import order details with all related information
CREATE VIEW v_import_order_details AS
SELECT 
    io.id,
    io.order_number,
    io.form_template,
    io.order_date,
    io.delivery_date,
    io.received_date,
    io.invoice_number,
    io.delivery_note_number,
    io.reference_document,
    io.reference_document_date,
    io.receiver_name,
    io.delivery_person,
    io.warehouse_keeper,
    io.accountant,
    io.attached_documents_count,
    io.attached_documents_list,
    io.status,
    w.name as warehouse_name,
    w.code as warehouse_code,
    w.organization_name,
    w.department,
    s.name as supplier_name,
    s.code as supplier_code,
    u.full_name as created_by_name,
    io.total_amount,
    io.final_amount,
    io.notes,
    io.created_at,
    io.updated_at
FROM import_orders io
JOIN warehouses w ON io.warehouse_id = w.id
JOIN suppliers s ON io.supplier_id = s.id
JOIN users u ON io.created_by = u.id;

-- View for inventory with product details
CREATE VIEW v_inventory_details AS
SELECT 
    i.id,
    w.name as warehouse_name,
    w.code as warehouse_code,
    p.name as product_name,
    p.code as product_code,
    p.unit,
    c.name as category_name,
    i.current_stock,
    i.reserved_stock,
    i.available_stock,
    p.min_stock,
    p.max_stock,
    i.last_updated
FROM inventory i
JOIN warehouses w ON i.warehouse_id = w.id
JOIN products p ON i.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- These will be configured based on deployment environment
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO warehouse_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO warehouse_app; 
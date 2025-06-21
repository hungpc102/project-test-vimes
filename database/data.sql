-- =====================================================
-- SAMPLE DATA FOR WAREHOUSE MANAGEMENT SYSTEM
-- Professional test data for development and testing
-- =====================================================

-- Insert sample users
INSERT INTO users (id, username, email, password_hash, full_name, phone, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@vimes.com', '$2b$10$rKGbKtjdqFpQ.5xpq8x9.ug6aIQTRjmJf5HCjzNQMQkMwBOhZyWyG', 'Quản trị viên', '0901234567', 'admin'),
('550e8400-e29b-41d4-a716-446655440001', 'manager1', 'manager1@vimes.com', '$2b$10$rKGbKtjdqFpQ.5xpq8x9.ug6aIQTRjmJf5HCjzNQMQkMwBOhZyWyG', 'Nguyễn Văn Quản', '0901234568', 'manager'),
('550e8400-e29b-41d4-a716-446655440002', 'user1', 'user1@vimes.com', '$2b$10$rKGbKtjdqFpQ.5xpq8x9.ug6aIQTRjmJf5HCjzNQMQkMwBOhZyWyG', 'Trần Thị Nhập', '0901234569', 'user');

-- Insert sample warehouses
INSERT INTO warehouses (id, code, name, address, phone, manager_id) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'WH01', 'Kho Trung Tâm', '123 Đường ABC, Quận 1, TP.HCM', '028-1234567', '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440001', 'WH02', 'Kho Phía Bắc', '456 Đường XYZ, Quận Hà Đông, Hà Nội', '024-1234567', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample suppliers
INSERT INTO suppliers (id, code, name, contact_person, email, phone, address, tax_code) VALUES
('770e8400-e29b-41d4-a716-446655440000', 'SUP001', 'Công ty TNHH Điện Tử ABC', 'Nguyễn Văn A', 'contact@abc.com', '028-2345678', '789 Đường DEF, Quận 3, TP.HCM', '0123456789'),
('770e8400-e29b-41d4-a716-446655440001', 'SUP002', 'Công ty CP Máy Tính XYZ', 'Trần Thị B', 'info@xyz.com', '024-2345678', '101 Đường GHI, Quận Ba Đình, Hà Nội', '0987654321');

-- Insert sample categories
INSERT INTO categories (id, code, name, description) VALUES
('880e8400-e29b-41d4-a716-446655440000', 'CAT001', 'Điện Tử', 'Thiết bị điện tử tiêu dùng'),
('880e8400-e29b-41d4-a716-446655440001', 'CAT002', 'Máy Tính', 'Máy tính và phụ kiện'),
('880e8400-e29b-41d4-a716-446655440002', 'CAT003', 'Điện Thoại', 'Điện thoại di động và phụ kiện');

-- Insert sample products
INSERT INTO products (id, code, name, description, category_id, unit, cost_price, selling_price, min_stock, max_stock) VALUES
('990e8400-e29b-41d4-a716-446655440000', 'PRD001', 'iPhone 15 Pro', 'Điện thoại thông minh iPhone 15 Pro 256GB', '880e8400-e29b-41d4-a716-446655440002', 'chiếc', 25000000, 28000000, 10, 100),
('990e8400-e29b-41d4-a716-446655440001', 'PRD002', 'Samsung Galaxy S24', 'Điện thoại Samsung Galaxy S24 256GB', '880e8400-e29b-41d4-a716-446655440002', 'chiếc', 20000000, 23000000, 10, 100),
('990e8400-e29b-41d4-a716-446655440002', 'PRD003', 'MacBook Pro M3', 'Laptop MacBook Pro M3 14 inch', '880e8400-e29b-41d4-a716-446655440001', 'chiếc', 45000000, 50000000, 5, 50),
('990e8400-e29b-41d4-a716-446655440003', 'PRD004', 'iPad Air', 'Máy tính bảng iPad Air 11 inch', '880e8400-e29b-41d4-a716-446655440000', 'chiếc', 15000000, 18000000, 8, 80),
('990e8400-e29b-41d4-a716-446655440004', 'PRD005', 'AirPods Pro', 'Tai nghe không dây AirPods Pro', '880e8400-e29b-41d4-a716-446655440000', 'chiếc', 5000000, 6000000, 20, 200);

-- Insert sample import orders
INSERT INTO import_orders (
    id, order_number, warehouse_id, supplier_id, created_by, 
    order_date, delivery_date, invoice_number, delivery_note_number, 
    receiver_name, delivery_person, warehouse_keeper, accountant,
    status, notes, total_amount, final_amount
) VALUES
(
    'aa0e8400-e29b-41d4-a716-446655440000', 'IMP-2024-001', 
    '660e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 
    '550e8400-e29b-41d4-a716-446655440002',
    '2024-01-15', '2024-01-16', 'INV-2024-001', 'DN-2024-001',
    'Trần Thị Nhập', 'Nguyễn Văn Giao', 'Lê Thị Kho', 'Phạm Văn Kế',
    'received', 'Nhập hàng đầu tháng - Đã hoàn thành', 150000000, 150000000
),
(
    'aa0e8400-e29b-41d4-a716-446655440001', 'IMP-2024-002', 
    '660e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', 
    '550e8400-e29b-41d4-a716-446655440002',
    '2024-01-20', '2024-01-22', 'INV-2024-002', 'DN-2024-002',
    'Trần Thị Nhập', 'Hoàng Văn Chuyển', 'Lê Thị Kho', 'Phạm Văn Kế',
    'pending', 'Nhập hàng laptop - Đang chờ giao', 200000000, 200000000
),
(
    'aa0e8400-e29b-41d4-a716-446655440002', 'IMP-2024-003', 
    '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440000', 
    '550e8400-e29b-41d4-a716-446655440001',
    '2024-01-25', '2024-01-26', 'INV-2024-003', 'DN-2024-003',
    'Nguyễn Văn Quản', 'Trần Văn Vận', 'Đỗ Thị Quản', 'Lý Văn Toán',
    'draft', 'Nhập hàng phụ kiện - Đang soạn thảo', 75000000, 75000000
);

-- Insert sample import order items
INSERT INTO import_order_items (id, import_order_id, product_id, quantity_ordered, quantity_received, unit_price, notes) VALUES
('bb0e8400-e29b-41d4-a716-446655440000', 'aa0e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', 3, 3, 25000000, 'Hàng chính hãng, nguyên seal'),
('bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440001', 2, 2, 20000000, 'Màu xanh và trắng'),
('bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440004', 5, 5, 5000000, 'Bao gồm case bảo vệ'),
('bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 4, 0, 45000000, 'Cấu hình cao, SSD 1TB'),
('bb0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', 1, 0, 15000000, 'Màu bạc, WiFi + Cellular'),
('bb0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440004', 10, 0, 5000000, 'Phụ kiện đi kèm'),
('bb0e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440000', 1, 0, 25000000, 'Màu titan tự nhiên'),
('bb0e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', 1, 0, 20000000, 'Màu đen');

-- Insert sample inventory (for received items)
INSERT INTO inventory (warehouse_id, product_id, current_stock) VALUES
('660e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', 3),
('660e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440001', 2),
('660e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440004', 5);

-- Insert sample inventory transactions
INSERT INTO inventory_transactions (warehouse_id, product_id, transaction_type, reference_id, reference_type, quantity_change, previous_stock, new_stock, created_by, notes) VALUES
('660e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', 'import', 'aa0e8400-e29b-41d4-a716-446655440000', 'import_order', 3, 0, 3, '550e8400-e29b-41d4-a716-446655440002', 'Nhập từ đơn IMP-2024-001'),
('660e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440001', 'import', 'aa0e8400-e29b-41d4-a716-446655440000', 'import_order', 2, 0, 2, '550e8400-e29b-41d4-a716-446655440002', 'Nhập từ đơn IMP-2024-001'),
('660e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440004', 'import', 'aa0e8400-e29b-41d4-a716-446655440000', 'import_order', 5, 0, 5, '550e8400-e29b-41d4-a716-446655440002', 'Nhập từ đơn IMP-2024-001'); 
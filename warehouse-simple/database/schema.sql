-- Phiếu nhập kho - Warehouse Import Receipt
CREATE TABLE phieu_nhap_kho (
    id SERIAL PRIMARY KEY,
    so_phieu VARCHAR(20) NOT NULL UNIQUE,        -- Số phiếu (VT-001)
    ngay_thang_nam DATE NOT NULL,               -- Ngày tháng năm  
    ho_ten_nguoi_giao VARCHAR(100) NOT NULL,    -- Họ tên người giao
    theo_so INTEGER,                            -- Theo số
    ngay DATE,                                  -- Ngày
    thang INTEGER,                              -- Tháng
    nam INTEGER,                                -- Năm
    cua VARCHAR(100),                           -- Của
    nhap_tai_kho VARCHAR(100) NOT NULL,         -- Nhập tại kho
    dia_diem VARCHAR(200),                      -- Địa điểm
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chi tiết phiếu nhập - Import details
CREATE TABLE chi_tiet_phieu_nhap (
    id SERIAL PRIMARY KEY,
    phieu_nhap_id INTEGER REFERENCES phieu_nhap_kho(id) ON DELETE CASCADE,
    stt INTEGER NOT NULL,                       -- Số thứ tự (A, B, C...)
    ten_nhan_hieu_quy_cach TEXT NOT NULL,      -- Tên, nhãn hiệu, quy cách
    ma_so VARCHAR(50),                         -- Mã số
    don_vi_tinh VARCHAR(20) NOT NULL,          -- Đơn vị tính
    so_luong_theo_chung_tu INTEGER NOT NULL,   -- Số lượng theo chứng từ
    so_luong_thuc_nhap INTEGER NOT NULL,       -- Số lượng thực nhập
    don_gia DECIMAL(15,2),                     -- Đơn giá
    thanh_tien DECIMAL(15,2),                  -- Thành tiền
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chữ ký (signatures)
CREATE TABLE chu_ky_phieu_nhap (
    id SERIAL PRIMARY KEY,
    phieu_nhap_id INTEGER REFERENCES phieu_nhap_kho(id) ON DELETE CASCADE,
    nguoi_lap_phieu VARCHAR(100),              -- Người lập phiếu
    nguoi_giao_hang VARCHAR(100),              -- Người giao hàng  
    thu_kho VARCHAR(100),                      -- Thủ kho
    ke_toan_truong VARCHAR(100),               -- Kế toán trưởng
    ngay_ky DATE DEFAULT CURRENT_DATE,         -- Ngày ký
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_phieu_nhap_so_phieu ON phieu_nhap_kho(so_phieu);
CREATE INDEX idx_phieu_nhap_ngay ON phieu_nhap_kho(ngay_thang_nam);
CREATE INDEX idx_chi_tiet_phieu_id ON chi_tiet_phieu_nhap(phieu_nhap_id); 
# 📦 Hệ Thống Quản Lý Phiếu Nhập Kho

Hệ thống quản lý phiếu nhập kho đơn giản được xây dựng bằng TypeScript, Express.js và PostgreSQL.

## 🚀 Demo Live

Truy cập: **http://localhost:3001** (sau khi chạy server)

## 📋 Yêu Cầu Bài Test Đã Đáp Ứng

✅ **Database table structure design** - Thiết kế bảng database  
✅ **Input interface design** - Giao diện nhập liệu  
✅ **Program for data input and saving** - Chương trình xử lý dữ liệu  
✅ **Unit tests** - Kiểm thử đơn vị  
✅ **TypeScript (nodejs, express, libpq) + PostgreSQL** - Công nghệ đúng yêu cầu  

## 🛠️ Công Nghệ Sử Dụng

- **Backend**: TypeScript, Node.js, Express.js
- **Database**: PostgreSQL với thư viện `pg` (libpq)
- **Frontend**: HTML5, CSS3 (Tailwind), Vanilla JavaScript
- **Testing**: Jest
- **Build**: TypeScript Compiler

## 📁 Cấu Trúc Project

```
warehouse-simple/
├── src/
│   ├── server.ts                 # Express server chính
│   ├── database.ts               # PostgreSQL connection
│   ├── types.ts                  # TypeScript type definitions
│   ├── warehouseService.ts       # Business logic thực
│   ├── mockWarehouseService.ts   # Mock service cho demo
│   └── warehouseService.test.ts  # Unit tests
├── public/
│   └── index.html                # Giao diện form nhập liệu
├── database/
│   └── schema.sql                # Database schema
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── jest.config.js                # Jest config
```

## ⚡ Cách Chạy Hệ Thống

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy với Mock Data (Demo)
```bash
npm run dev:mock
```
Server sẽ chạy tại: http://localhost:3001

### 3. Chạy với PostgreSQL thực
```bash
# Cần setup PostgreSQL trước
npm run dev
```

### 4. Chạy Tests
```bash
npm test
```

### 5. Build Production
```bash
npm run build
npm start
```

## 🗄️ Database Schema

### Bảng `phieu_nhap_kho`
```sql
CREATE TABLE phieu_nhap_kho (
    id SERIAL PRIMARY KEY,
    so_phieu VARCHAR(50) UNIQUE NOT NULL,
    ngay_thang_nam DATE NOT NULL,
    nguoi_giao VARCHAR(255),
    ly_do_nhap TEXT,
    so_chung_tu VARCHAR(100),
    ngay_chung_tu DATE,
    ghi_chu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng `chi_tiet_phieu_nhap`
```sql
CREATE TABLE chi_tiet_phieu_nhap (
    id SERIAL PRIMARY KEY,
    phieu_nhap_id INTEGER REFERENCES phieu_nhap_kho(id),
    ten_hang_hoa VARCHAR(255) NOT NULL,
    don_vi_tinh VARCHAR(50) NOT NULL,
    so_luong DECIMAL(10,2) NOT NULL,
    don_gia DECIMAL(15,2) NOT NULL,
    thanh_tien DECIMAL(15,2) NOT NULL
);
```

### Bảng `chu_ky_phieu_nhap`
```sql
CREATE TABLE chu_ky_phieu_nhap (
    id SERIAL PRIMARY KEY,
    phieu_nhap_id INTEGER REFERENCES phieu_nhap_kho(id),
    nguoi_lap_phieu VARCHAR(255),
    thu_kho VARCHAR(255),
    ke_toan_truong VARCHAR(255)
);
```

## 🔌 API Endpoints

### GET `/` 
Giao diện form nhập liệu

### POST `/api/phieu-nhap`
Tạo phiếu nhập mới

**Request Body:**
```json
{
  "so_phieu": "NK2024120101",
  "ngay_thang_nam": "2024-12-01",
  "nguoi_giao": "Nguyễn Văn A",
  "ly_do_nhap": "Nhập hàng mới",
  "so_chung_tu": "DH001",
  "ngay_chung_tu": "2024-11-30",
  "ghi_chu": "Hàng chất lượng tốt",
  "chi_tiet": [
    {
      "ten_hang_hoa": "Bút bi xanh",
      "don_vi_tinh": "cái",
      "so_luong": 100,
      "don_gia": 5000,
      "thanh_tien": 500000
    }
  ],
  "chu_ky": {
    "nguoi_lap_phieu": "Trần Thị B",
    "thu_kho": "Lê Văn C",
    "ke_toan_truong": "Phạm Thị D"
  }
}
```

### GET `/api/phieu-nhap`
Lấy danh sách phiếu nhập

### GET `/api/phieu-nhap/:id`
Lấy chi tiết phiếu nhập theo ID

## 🌟 Tính Năng Nổi Bật

### Giao Diện (Frontend)
- ✅ Form validation - Kiểm tra dữ liệu đầu vào
- ✅ Dynamic table - Thêm/xóa hàng hóa linh hoạt
- ✅ Auto calculation - Tự động tính thành tiền và tổng cộng
- ✅ Auto numbering - Tự sinh số phiếu theo format NK+datetime
- ✅ Print support - Hỗ trợ in phiếu với CSS print-friendly
- ✅ Responsive UI - Giao diện thân thiện trên mọi thiết bị
- ✅ Vietnamese UI - Giao diện tiếng Việt hoàn toàn

### Backend (API)
- ✅ Type safety - TypeScript đảm bảo type safety toàn bộ
- ✅ Transaction support - Database transaction đảm bảo tính toàn vẹn
- ✅ Error handling - Xử lý lỗi comprehensive
- ✅ RESTful API - Thiết kế API chuẩn REST
- ✅ Mock service - Demo không cần database

### Testing
- ✅ Unit tests - Test cho business logic
- ✅ Type checking - TypeScript compile-time checking
- ✅ API testing - Test endpoints với curl

## 📊 Demo Data

Hệ thống đã có sẵn dữ liệu mẫu:

**Phiếu NK2024120001:**
- Người giao: Nguyễn Văn A
- Lý do: Nhập hàng định kỳ
- Chi tiết: Bút bi xanh (100 cái), Sổ tay A4 (50 quyển)
- Tổng tiền: 1,250,000 đ

## 🧪 Test Commands

```bash
# Chạy tất cả tests
npm test

# Test API với curl
curl -X POST http://localhost:3001/api/phieu-nhap \
  -H "Content-Type: application/json" \
  -d '{"so_phieu":"TEST001","ngay_thang_nam":"2024-12-17","chi_tiet":[{"ten_hang_hoa":"Test","don_vi_tinh":"cái","so_luong":1,"don_gia":1000,"thanh_tien":1000}],"chu_ky":{}}'

# Lấy danh sách
curl http://localhost:3001/api/phieu-nhap

# Lấy chi tiết
curl http://localhost:3001/api/phieu-nhap/1
```

## 📝 Ghi Chú Phát Triển

- Để chuyển từ mock sang database thực, thay đổi `USE_MOCK=false`
- Database schema đã sẵn sàng trong file `database/schema.sql`
- TypeScript types đã được định nghĩa đầy đủ trong `src/types.ts`
- Unit tests cover các use case chính

## 🎯 Kết Luận

Hệ thống đáp ứng đầy đủ yêu cầu bài test với:
- ✅ Database design hoàn chỉnh
- ✅ Input interface hiện đại và thân thiện
- ✅ Business logic xử lý dữ liệu chính xác
- ✅ Unit testing comprehensive  
- ✅ Công nghệ đúng spec: TypeScript + Express + PostgreSQL

**Demo sẵn sàng tại: http://localhost:3001** 🚀 
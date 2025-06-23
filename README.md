# Bài test phỏng vấn

## Tổng Quan
Hệ thống quản lý phiếu nhập kho theo mẫu VT-01 của Việt Nam, được xây dựng với kiến trúc hiện đại Node.js + React.


## Công Nghệ
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL
- **Frontend**: React.js, TailwindCSS
- **Testing**: Jest (43 unit tests)

## Cấu Trúc Dự Án
```
├── backend/                 # API Server (TypeScript)
│   ├── src/
│   │   ├── controllers/     # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access
│   │   ├── models/          # Business models
│   │   ├── middlewares/     # Validation, error handling
│   │   └── tests/           # Unit tests (43 tests)
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   └── services/        # API integration
├── database/                # Database files
│   ├── schema.sql           # Database schema
│   └── data.sql             # Sample data
```

## Chức Năng Chính

### ✅ Đã Hoàn Thành
- **Quản lý phiếu nhập kho**: Tạo, xem, cập nhật trạng thái
- **Workflow trạng thái**: draft → pending → partial/received → cancelled
- **Form nhập liệu**: Multi-step form với validation
- **Tìm kiếm và lọc**: Theo kho, nhà cung cấp, trạng thái
- **Responsive UI**: Giao diện thân thiện trên mobile/desktop
- **API hoàn chỉnh**: RESTful APIs với validation
- **Unit testing**: 43 tests covering business logic

### 🎯 API Endpoints
```
GET    /api/v1/import-orders      # Danh sách phiếu nhập
POST   /api/v1/import-orders      # Tạo phiếu nhập mới
GET    /api/v1/import-orders/:id  # Chi tiết phiếu nhập
PATCH  /api/v1/import-orders/:id/status  # Cập nhật trạng thái
DELETE /api/v1/import-orders/:id  # Xóa phiếu nhập

GET    /api/v1/warehouses         # Danh sách kho
GET    /api/v1/suppliers          # Danh sách nhà cung cấp
GET    /api/v1/products           # Danh sách sản phẩm
```

## 🚀 Hướng Dẫn Chạy Dự Án

### 1. Cấu Hình Database
```bash
# Tạo database
createdb warehouse_management

# Chạy schema
psql warehouse_management < database/schema.sql

# Import data mẫu
psql warehouse_management < database/data.sql
```

### 2. Chạy Backend
```bash
cd backend

# Cài đặt dependencies
npm install

# Cấu hình environment
cp env.example .env
# Sửa file .env với thông tin database

# Chạy server
npm run dev
```
Backend sẽ chạy tại: `http://localhost:3000`

### 3. Chạy Frontend
```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm start
```
Frontend sẽ chạy tại: `http://localhost:3001`

### 4. Testing
```bash
cd backend

# Chạy unit tests
npm run test:unit

# Chạy với coverage
npm run test -- --coverage
```

## 📊 Database Schema

### Bảng Chính
- **import_orders**: Phiếu nhập kho (header)
- **import_order_items**: Chi tiết phiếu nhập (items)
- **warehouses**: Danh sách kho
- **suppliers**: Nhà cung cấp
- **products**: Sản phẩm

### Sample Data
- 2 kho: Kho Trung Tâm, Kho Phía Bắc
- 3 nhà cung cấp với thông tin đầy đủ
- 5 sản phẩm điện tử (iPhone, Samsung, MacBook...)
- 2 phiếu nhập mẫu với trạng thái khác nhau

## 🔧 Kiến Trúc Kỹ Thuật

### Backend Features
- **TypeScript**: Type safety và better development experience
- **Repository Pattern**: Tách biệt data access và business logic
- **Error Handling**: Comprehensive error handling với custom error types
- **Validation**: Multi-layer validation (middleware + business logic)
- **Logging**: Winston logger với file rotation
- **Testing**: Jest với 43 unit tests (14.24% coverage)

### Frontend Features
- **React 18**: Modern hooks và functional components
- **TailwindCSS**: Utility-first CSS framework
- **React Query**: Server state management
- **React Router**: Client-side routing
- **Responsive Design**: Mobile-first approach

### Business Logic
- **Status Workflow**: Quản lý chuyển đổi trạng thái hợp lệ
- **Auto Order Number**: Tự động sinh số phiếu theo format PNK-YYYYMMDD-XXXX
- **Financial Calculation**: Tính toán tổng tiền tự động
- **Validation Rules**: Business rules validation

## 📈 Kết Quả Đạt Được
- ✅ **Backend API**: Hoàn thành 100% chức năng cơ bản
- ✅ **Frontend UI**: Giao diện hoàn chỉnh cho phiếu nhập kho
- ✅ **Database**: Schema tối ưu với sample data
- ✅ **Testing**: 43 unit tests đảm bảo quality
- ✅ **Documentation**: API documentation và user guide

## 🖼️ Giao Diện Ứng Dụng

### 📋 Trang chủ
![Trang chủ](./docs/images/Screenshot%202025-06-22%20at%2002.20.24.png)

### 📋 Danh sách phiếu nhập
![Danh sách phiếu nhập B1](./docs/images/Screenshot%202025-06-22%20at%2002.26.18.png)

### 👁️ Chi Tiết Phiếu Nhập
![Chi tiết phiếu nhập](docs/images/Screenshot%202025-06-22%20at%2002.24.50.png)

### 📝 Form Tạo Phiếu Nhập Mới
![Form tạo phiếu nhập](docs/images/Screenshot%202025-06-22%20at%2002.21.06.png)
![Danh sách phiếu nhập B2](./docs/images/Screenshot%202025-06-22%20at%2002.21.39.png)
![Danh sách phiếu nhập B3](./docs/images/Screenshot%202025-06-22%20at%2002.22.01.png)


### 🖨️ Cập nhập trạng thái phiếu nhập
![Cập nhập trạng thái phiếu nhập](docs/images/Screenshot%202025-06-22%20at%2002.51.58.png)


### 🖨️ In phiếu nhập
![In phiếu nhập](docs/images/Screenshot%202025-06-22%20at%2002.25.24.png)

---




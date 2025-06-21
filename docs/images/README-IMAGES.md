# Hướng Dẫn Chụp Ảnh Cho README

## Danh Sách Ảnh Cần Chụp

### 1. `import-orders-list.png` - Danh Sách Phiếu Nhập
**Màn hình:** Trang chủ danh sách phiếu nhập
**Nội dung cần có:**
- Header với tiêu đề "Quản Lý Phiếu Nhập Kho"
- Statistics cards (tổng số phiếu, chờ xử lý, v.v.)
- Search box và status filter
- Bảng danh sách với các cột: Mã phiếu, Nhà cung cấp, Kho, Ngày tạo, Trạng thái, Tổng tiền
- Ít nhất 3-4 rows dữ liệu với trạng thái khác nhau
- Nút "Tạo Phiếu Nhập Mới"

### 2. `create-import-order.png` - Form Tạo Phiếu Nhập
**Màn hình:** Form tạo phiếu nhập mới (step 2 - chọn sản phẩm)
**Nội dung cần có:**
- Multi-step progress indicator (Step 1, 2, 3)
- Form fields: Warehouse, Supplier dropdown
- Product selection table với quantity inputs
- Nút "Quay lại", "Tiếp tục"
- Validation messages nếu có

### 3. `import-order-detail.png` - Chi Tiết Phiếu Nhập
**Màn hình:** Trang chi tiết một phiếu nhập
**Nội dung cần có:**
- Header với mã phiếu và status badge
- Thông tin nhà cung cấp và kho
- Bảng sản phẩm chi tiết
- Tổng kết (tổng số lượng, tổng tiền)
- Action buttons: Cập nhật trạng thái, In phiếu, Chỉnh sửa, Xóa

### 4. `print-preview.png` - Giao Diện In
**Màn hình:** Preview khi bấm Ctrl+P hoặc Print Preview
**Nội dung cần có:**
- Chỉ có nội dung phiếu nhập (không có sidebar, header, footer)
- Format giống phiếu VT-01
- Thông tin đầy đủ để in

### 5. `mobile-interface.png` - Giao Diện Mobile
**Màn hình:** Responsive mobile view
**Nội dung cần có:**
- Navigation drawer/hamburger menu
- Card layout thay vì table
- Touch-friendly buttons
- Mobile-optimized spacing

### 6. `search-filters.png` - Tìm Kiếm và Lọc
**Màn hình:** Danh sách với search và filter đang active
**Nội dung cần có:**
- Search box có text
- Status filter đã chọn
- Kết quả filtered
- Clear filters button

## Yêu Cầu Kỹ Thuật

### Kích Thước Ảnh
- **Width**: 1200-1400px (desktop screenshots)
- **Mobile**: 375-414px width
- **Format**: PNG
- **Quality**: High resolution, rõ nét

### Thiết Lập Trước Khi Chụp
1. **Dữ liệu mẫu**: Đảm bảo có ít nhất 5-6 phiếu nhập với:
   - Trạng thái khác nhau (draft, pending, received, cancelled)
   - Nhà cung cấp khác nhau
   - Kho khác nhau
   - Ngày tạo khác nhau

2. **Browser setup**:
   - Zoom 100%
   - Full screen mode
   - Hide bookmarks bar
   - Clean, professional appearance

3. **Data cho demo**:
   - Tên nhà cung cấp: "Công ty TNHH ABC", "Nhà cung cấp XYZ"
   - Tên kho: "Kho Trung Tâm", "Kho Phía Bắc"
   - Sản phẩm: iPhone, Samsung, MacBook, v.v.

## Lưu Ý
- Ảnh phải thể hiện được tính năng chính của từng màn hình
- Avoid personal information hoặc data thật
- Consistent styling và professional appearance
- Capture full screen context, không crop quá nhiều 
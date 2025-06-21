import { Router } from 'express';

const router = Router();

// Sample suppliers data
const suppliers = [
  {
    id: '770e8400-e29b-41d4-a716-446655440000',
    code: 'SUP001',
    name: 'Công ty TNHH ABC Electronics',
    address: '123 Đường Nguyễn Văn Cừ, Q.5, TP.HCM',
    phone: '028-38123456',
    email: 'contact@abc-electronics.com',
    contact_person: 'Nguyễn Văn A',
    tax_code: '0123456789',
    is_active: true
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    code: 'SUP002', 
    name: 'Tập đoàn XYZ Technology',
    address: '456 Đường Lê Văn Việt, Q.9, TP.HCM',
    phone: '028-38654321',
    email: 'info@xyz-tech.com.vn',
    contact_person: 'Trần Thị B',
    tax_code: '0987654321',
    is_active: true
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    code: 'SUP003',
    name: 'Công ty Cổ phần DEF Mobile',
    address: '789 Đường Hoàng Văn Thụ, Q.Tân Bình, TP.HCM',
    phone: '028-38789012',
    email: 'sales@def-mobile.vn',
    contact_person: 'Lê Văn C',
    tax_code: '0112233445',
    is_active: true
  }
];

router.get('/', (req, res) => {
    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: suppliers,
        message: 'Suppliers retrieved successfully',
        meta: {
            total: suppliers.length,
            page: 1,
            limit: 50
        }
    });
});

router.get('/health', (req, res) => {
    res.json({ status: 'suppliers module healthy' });
});

export default router; 
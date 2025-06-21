import express from 'express';
import cors from 'cors';
import path from 'path';
import { WarehouseService } from './warehouseService';
import { MockWarehouseService } from './mockWarehouseService';
import { PhieuNhapInput, ApiResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3000;

// Sử dụng mock service để demo (chuyển sang WarehouseService khi có database)
const warehouseService = process.env.USE_MOCK === 'true' ? new MockWarehouseService() : new WarehouseService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes

// Health check và API info
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Warehouse Management API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      documentation: '/api-docs'
    },
    correlationId: Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  });
});

// Trang chủ - Form nhập liệu
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API: Tạo phiếu nhập kho
app.post('/api/phieu-nhap', async (req, res) => {
  try {
    const data = req.body;
    
    // Validation cơ bản
    if (!data.so_phieu || !data.chi_tiet || !Array.isArray(data.chi_tiet)) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu không hợp lệ: thiếu số phiếu hoặc chi tiết hàng hóa'
      });
    }
    
    // Transform data to match database schema
    const phieuInput: PhieuNhapInput = {
      phieu_nhap: {
        so_phieu: data.so_phieu,
        ngay_thang_nam: data.ngay_thang_nam,
        nguoi_giao: data.nguoi_giao || null,
        ly_do_nhap: data.ly_do_nhap || null,
        so_chung_tu: data.so_chung_tu || null,
        ngay_chung_tu: data.ngay_chung_tu || null,
        ghi_chu: data.ghi_chu || null
      },
      chi_tiet: data.chi_tiet,
      chu_ky: data.chu_ky || {}
    };
    
    const result = await warehouseService.createPhieuNhap(phieuInput);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Tạo phiếu nhập kho thành công'
    };
    
    res.status(201).json(response);
    
  } catch (error) {
    console.error('Error creating phieu nhap:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi server'
    };
    
    res.status(500).json(response);
  }
});

// API: Lấy danh sách phiếu nhập
app.get('/api/phieu-nhap', async (req, res) => {
  try {
    const data = await warehouseService.getPhieuNhapList();
    
    const response: ApiResponse = {
      success: true,
      data,
      message: 'Lấy danh sách thành công'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error getting phieu nhap list:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi server'
    };
    
    res.status(500).json(response);
  }
});

// API: Lấy chi tiết phiếu nhập theo ID
app.get('/api/phieu-nhap/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID không hợp lệ'
      });
    }
    
    const data = await warehouseService.getPhieuNhapById(id);
    
    const response: ApiResponse = {
      success: true,
      data,
      message: 'Lấy chi tiết thành công'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error getting phieu nhap detail:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi server'
    };
    
    res.status(500).json(response);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📝 Form nhập liệu: http://localhost:${PORT}`);
  console.log(`🔗 API Endpoint: http://localhost:${PORT}/api/phieu-nhap`);
});

export default app; 
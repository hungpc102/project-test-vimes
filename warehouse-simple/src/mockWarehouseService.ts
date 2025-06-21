import { PhieuNhapInput } from './types';

// Mock data storage
let mockData: any[] = [
  {
    id: 1,
    so_phieu: 'NK2024120001',
    ngay_thang_nam: '2024-12-01',
    nguoi_giao: 'Nguyễn Văn A',
    ly_do_nhap: 'Nhập hàng định kỳ',
    so_chung_tu: 'DH001',
    ngay_chung_tu: '2024-11-30',
    ghi_chu: 'Hàng chất lượng cao',
    tong_tien: 1250000,
    chi_tiet: [
      {
        id: 1,
        ten_hang_hoa: 'Bút bi xanh',
        don_vi_tinh: 'cái',
        so_luong: 100,
        don_gia: 5000,
        thanh_tien: 500000
      },
      {
        id: 2,
        ten_hang_hoa: 'Sổ tay A4',
        don_vi_tinh: 'quyển',
        so_luong: 50,
        don_gia: 15000,
        thanh_tien: 750000
      }
    ],
    chu_ky: {
      nguoi_lap_phieu: 'Trần Thị B',
      thu_kho: 'Lê Văn C',
      ke_toan_truong: 'Phạm Thị D'
    }
  }
];

let nextId = 2;

export class MockWarehouseService {
  
  // Tạo phiếu nhập kho mới (mock)
  async createPhieuNhap(input: PhieuNhapInput) {
    const id = nextId++;
    
    // Tính tổng tiền
    const tongTien = input.chi_tiet.reduce((sum, item) => sum + item.thanh_tien, 0);
    
    const newPhieu = {
      id,
      ...input.phieu_nhap,
      tong_tien: tongTien,
      chi_tiet: input.chi_tiet.map((item, index) => ({
        id: index + 1,
        phieu_nhap_id: id,
        ...item
      })),
      chu_ky: {
        id: 1,
        phieu_nhap_id: id,
        ...input.chu_ky
      }
    };
    
    mockData.push(newPhieu);
    
    return {
      id,
      phieu_nhap: input.phieu_nhap,
      chi_tiet: input.chi_tiet,
      chu_ky: input.chu_ky
    };
  }
  
  // Lấy danh sách phiếu nhập (mock)
  async getPhieuNhapList() {
    return mockData.map(item => ({
      id: item.id,
      so_phieu: item.so_phieu,
      ngay_thang_nam: item.ngay_thang_nam,
      nguoi_giao: item.nguoi_giao,
      ly_do_nhap: item.ly_do_nhap,
      tong_tien: item.tong_tien
    }));
  }
  
  // Lấy chi tiết phiếu nhập theo ID (mock)
  async getPhieuNhapById(id: number) {
    const phieu = mockData.find(item => item.id === id);
    
    if (!phieu) {
      throw new Error('Phiếu nhập không tồn tại');
    }
    
    return {
      id: phieu.id,
      phieu_nhap: {
        so_phieu: phieu.so_phieu,
        ngay_thang_nam: phieu.ngay_thang_nam,
        nguoi_giao: phieu.nguoi_giao,
        ly_do_nhap: phieu.ly_do_nhap,
        so_chung_tu: phieu.so_chung_tu,
        ngay_chung_tu: phieu.ngay_chung_tu,
        ghi_chu: phieu.ghi_chu
      },
      chi_tiet: phieu.chi_tiet,
      chu_ky: phieu.chu_ky
    };
  }
} 
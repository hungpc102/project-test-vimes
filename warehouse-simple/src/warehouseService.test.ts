import { WarehouseService } from './warehouseService';
import { PhieuNhapInput } from './types';

describe('WarehouseService', () => {
  let warehouseService: WarehouseService;
  
  beforeAll(() => {
    warehouseService = new WarehouseService();
  });

  test('should create phieu nhap successfully', async () => {
    const phieuInput: PhieuNhapInput = {
      phieu_nhap: {
        so_phieu: 'NK2024120101',
        ngay_thang_nam: '2024-12-01',
        nguoi_giao: 'Nguyễn Văn A',
        ly_do_nhap: 'Nhập hàng theo đơn đặt hàng',
        so_chung_tu: 'DH001',
        ngay_chung_tu: '2024-11-30',
        ghi_chu: 'Hàng chất lượng tốt'
      },
      chi_tiet: [
        {
          ten_hang_hoa: 'Bút bi đỏ',
          don_vi_tinh: 'cái',
          so_luong: 100,
          don_gia: 5000,
          thanh_tien: 500000
        },
        {
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
    };

    const result = await warehouseService.createPhieuNhap(phieuInput);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.phieu_nhap.so_phieu).toBe(phieuInput.phieu_nhap.so_phieu);
    expect(result.chi_tiet).toHaveLength(2);
    expect(result.chu_ky).toBeDefined();
  });

  test('should get phieu nhap list', async () => {
    const receipts = await warehouseService.getPhieuNhapList();
    
    expect(Array.isArray(receipts)).toBe(true);
    expect(receipts.length).toBeGreaterThan(0);
    
    // Check first receipt structure
    const firstReceipt = receipts[0];
    expect(firstReceipt).toHaveProperty('id');
    expect(firstReceipt).toHaveProperty('so_phieu');
    expect(firstReceipt).toHaveProperty('ngay_thang_nam');
  });

  test('should get phieu nhap by id', async () => {
    // First create a receipt
    const phieuInput: PhieuNhapInput = {
      phieu_nhap: {
        so_phieu: 'NK2024120102',
        ngay_thang_nam: '2024-12-01',
        nguoi_giao: 'Test User',
        ly_do_nhap: 'Test import'
      },
      chi_tiet: [
        {
          ten_hang_hoa: 'Test Product',
          don_vi_tinh: 'pcs',
          so_luong: 10,
          don_gia: 1000,
          thanh_tien: 10000
        }
      ],
      chu_ky: {
        nguoi_lap_phieu: 'Test Creator'
      }
    };

    const created = await warehouseService.createPhieuNhap(phieuInput);
    
    // Then get it by id
    const retrieved = await warehouseService.getPhieuNhapById(created.id!);
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.phieu_nhap.so_phieu).toBe(phieuInput.phieu_nhap.so_phieu);
    expect(retrieved?.chi_tiet).toHaveLength(1);
  });

  test('should handle invalid input gracefully', async () => {
    const invalidData: PhieuNhapInput = {
      phieu_nhap: {
        so_phieu: '', // Empty required field
        ngay_thang_nam: '2024-12-01'
      },
      chi_tiet: [],
      chu_ky: {}
    };

    await expect(warehouseService.createPhieuNhap(invalidData))
      .rejects.toThrow();
  });
}); 
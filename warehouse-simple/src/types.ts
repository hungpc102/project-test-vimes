// Types cho phiếu nhập kho
export interface PhieuNhapKho {
  id?: number;
  so_phieu: string;
  ngay_thang_nam: string;
  nguoi_giao?: string | null;
  ly_do_nhap?: string | null;
  so_chung_tu?: string | null;
  ngay_chung_tu?: string | null;
  ghi_chu?: string | null;
}

export interface ChiTietPhieuNhap {
  id?: number;
  phieu_nhap_id?: number;
  ten_hang_hoa: string;
  don_vi_tinh: string;
  so_luong: number;
  don_gia: number;
  thanh_tien: number;
}

export interface ChuKyPhieuNhap {
  id?: number;
  phieu_nhap_id?: number;
  nguoi_lap_phieu?: string | null;
  thu_kho?: string | null;
  ke_toan_truong?: string | null;
}

export interface PhieuNhapInput {
  phieu_nhap: PhieuNhapKho;
  chi_tiet: ChiTietPhieuNhap[];
  chu_ky: ChuKyPhieuNhap;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 
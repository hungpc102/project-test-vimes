import pool from './database';
import { PhieuNhapInput, PhieuNhapKho, ChiTietPhieuNhap, ChuKyPhieuNhap } from './types';

export class WarehouseService {
  
  // Tạo phiếu nhập kho mới
  async createPhieuNhap(input: PhieuNhapInput) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Insert phiếu nhập chính
      const phieuResult = await client.query(
        `INSERT INTO phieu_nhap_kho (
          so_phieu, ngay_thang_nam, nguoi_giao, ly_do_nhap, 
          so_chung_tu, ngay_chung_tu, ghi_chu
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [
          input.phieu_nhap.so_phieu,
          input.phieu_nhap.ngay_thang_nam,
          input.phieu_nhap.nguoi_giao,
          input.phieu_nhap.ly_do_nhap,
          input.phieu_nhap.so_chung_tu,
          input.phieu_nhap.ngay_chung_tu,
          input.phieu_nhap.ghi_chu
        ]
      );
      
      const phieuId = phieuResult.rows[0].id;
      const phieuData = phieuResult.rows[0];
      
      // 2. Insert chi tiết phiếu nhập
      const chiTietResults = [];
      for (const item of input.chi_tiet) {
        const result = await client.query(
          `INSERT INTO chi_tiet_phieu_nhap (
            phieu_nhap_id, ten_hang_hoa, don_vi_tinh, so_luong, don_gia, thanh_tien
          ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [
            phieuId,
            item.ten_hang_hoa,
            item.don_vi_tinh,
            item.so_luong,
            item.don_gia,
            item.thanh_tien
          ]
        );
        chiTietResults.push(result.rows[0]);
      }
      
      // 3. Insert chữ ký
      const chuKyResult = await client.query(
        `INSERT INTO chu_ky_phieu_nhap (
          phieu_nhap_id, nguoi_lap_phieu, thu_kho, ke_toan_truong
        ) VALUES ($1, $2, $3, $4) RETURNING *`,
        [
          phieuId,
          input.chu_ky.nguoi_lap_phieu,
          input.chu_ky.thu_kho,
          input.chu_ky.ke_toan_truong
        ]
      );
      
      await client.query('COMMIT');
      
      return {
        id: phieuId,
        phieu_nhap: phieuData,
        chi_tiet: chiTietResults,
        chu_ky: chuKyResult.rows[0]
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Lấy danh sách phiếu nhập
  async getPhieuNhapList(): Promise<PhieuNhapKho[]> {
    const result = await pool.query(
      `SELECT * FROM phieu_nhap_kho ORDER BY created_at DESC`
    );
    return result.rows;
  }
  
  // Lấy chi tiết phiếu nhập theo ID
  async getPhieuNhapById(id: number) {
    const [phieu, chiTiet, chuKy] = await Promise.all([
      pool.query('SELECT * FROM phieu_nhap_kho WHERE id = $1', [id]),
      pool.query('SELECT * FROM chi_tiet_phieu_nhap WHERE phieu_nhap_id = $1 ORDER BY id', [id]),
      pool.query('SELECT * FROM chu_ky_phieu_nhap WHERE phieu_nhap_id = $1', [id])
    ]);
    
    if (phieu.rows.length === 0) {
      throw new Error('Phiếu nhập không tồn tại');
    }
    
    return {
      id: phieu.rows[0].id,
      phieu_nhap: phieu.rows[0],
      chi_tiet: chiTiet.rows,
      chu_ky: chuKy.rows[0] || {}
    };
  }
} 
/**
 * Supplier Repository
 * Handles all database operations for suppliers
 */

import { pool } from '../config/database';
import logger from '../config/logger';
import { PoolClient } from 'pg';

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  tax_id: string;
  created_at: Date;
  updated_at: Date;
}

class SupplierRepository {
  /**
   * Find supplier by ID
   * @param id - Supplier ID
   * @returns Supplier data
   */
  async findById(id: string): Promise<Supplier | null> {
    const client: PoolClient = await pool.connect();
    
    try {
      const query = 'SELECT * FROM suppliers WHERE id = $1';
      const result = await client.query(query, [id]);
      
      return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error: any) {
      logger.error('Error in SupplierRepository.findById', {
        error: error.message,
        stack: error.stack,
        id
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find all suppliers
   * @returns Suppliers array
   */
  async findAll(): Promise<Supplier[]> {
    const client: PoolClient = await pool.connect();
    
    try {
      const query = 'SELECT * FROM suppliers ORDER BY name';
      const result = await client.query(query);
      return result.rows;

    } catch (error: any) {
      logger.error('Error in SupplierRepository.findAll', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if supplier exists
   * @param id - Supplier ID
   * @returns True if exists
   */
  async exists(id: string): Promise<boolean> {
    const client: PoolClient = await pool.connect();
    
    try {
      const query = 'SELECT 1 FROM suppliers WHERE id = $1';
      const result = await client.query(query, [id]);
      return result.rows.length > 0;

    } catch (error: any) {
      logger.error('Error in SupplierRepository.exists', {
        error: error.message,
        stack: error.stack,
        id
      });
      throw error;
    } finally {
      client.release();
    }
  }
}

export default SupplierRepository; 
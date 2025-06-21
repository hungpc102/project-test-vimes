/**
 * Warehouse Repository
 * Handles all database operations for warehouses
 */

import { pool } from '../config/database';
import logger from '../config/logger';
import { PoolClient } from 'pg';

interface Warehouse {
  id: string;
  name: string;
  address: string;
  contact_person: string;
  phone: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

class WarehouseRepository {
  /**
   * Find warehouse by ID
   * @param id - Warehouse ID
   * @returns Warehouse data
   */
  async findById(id: string): Promise<Warehouse | null> {
    const client: PoolClient = await pool.connect();
    
    try {
      const query = 'SELECT * FROM warehouses WHERE id = $1';
      const result = await client.query(query, [id]);
      
      return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error: any) {
      logger.error('Error in WarehouseRepository.findById', {
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
   * Find all warehouses
   * @returns Warehouses array
   */
  async findAll(): Promise<Warehouse[]> {
    const client: PoolClient = await pool.connect();
    
    try {
      const query = 'SELECT * FROM warehouses ORDER BY name';
      const result = await client.query(query);
      return result.rows;

    } catch (error: any) {
      logger.error('Error in WarehouseRepository.findAll', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if warehouse exists
   * @param id - Warehouse ID
   * @returns True if exists
   */
  async exists(id: string): Promise<boolean> {
    const client: PoolClient = await pool.connect();
    
    try {
      const query = 'SELECT 1 FROM warehouses WHERE id = $1';
      const result = await client.query(query, [id]);
      return result.rows.length > 0;

    } catch (error: any) {
      logger.error('Error in WarehouseRepository.exists', {
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

export default WarehouseRepository; 
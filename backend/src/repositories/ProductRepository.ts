/**
 * Product Repository
 * Handles all database operations for products
 */

import { pool } from '../config/database';
import logger from '../config/logger';
import { PoolClient } from 'pg';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

interface ProductFilters {
  name?: string;
  sku?: string;
  category?: string;
}

class ProductRepository {
  /**
   * Find product by ID
   * @param id - Product ID
   * @returns Product data
   */
  async findById(id: string): Promise<Product | null> {
    const client: PoolClient = await pool.connect();
    
    try {
      const query = 'SELECT * FROM products WHERE id = $1';
      const result = await client.query(query, [id]);
      
      return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error: any) {
      logger.error('Error in ProductRepository.findById', {
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
   * Find all products with filtering
   * @param filters - Filter criteria
   * @returns Products array
   */
  async findAll(filters: ProductFilters = {}): Promise<Product[]> {
    const client: PoolClient = await pool.connect();
    
    try {
      let query = 'SELECT * FROM products';
      const queryParams: any[] = [];
      const whereConditions: string[] = [];

      if (filters.name) {
        whereConditions.push(`name ILIKE $${queryParams.length + 1}`);
        queryParams.push(`%${filters.name}%`);
      }

      if (filters.sku) {
        whereConditions.push(`sku ILIKE $${queryParams.length + 1}`);
        queryParams.push(`%${filters.sku}%`);
      }

      if (filters.category) {
        whereConditions.push(`category = $${queryParams.length + 1}`);
        queryParams.push(filters.category);
      }

      if (whereConditions.length > 0) {
        query += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      query += ' ORDER BY name';

      const result = await client.query(query, queryParams);
      return result.rows;

    } catch (error: any) {
      logger.error('Error in ProductRepository.findAll', {
        error: error.message,
        stack: error.stack,
        filters
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if product exists
   * @param id - Product ID
   * @returns True if exists
   */
  async exists(id: string): Promise<boolean> {
    const client: PoolClient = await pool.connect();
    
    try {
      const query = 'SELECT 1 FROM products WHERE id = $1';
      const result = await client.query(query, [id]);
      return result.rows.length > 0;

    } catch (error: any) {
      logger.error('Error in ProductRepository.exists', {
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

export default ProductRepository; 
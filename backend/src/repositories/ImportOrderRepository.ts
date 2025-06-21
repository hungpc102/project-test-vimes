/**
 * Import Order Repository - Simplified for VT-01 form
 * Handles essential database operations for import orders
 */

import { Pool } from 'pg';
import logger from '../config/logger';
import {
  ImportOrder,
  ImportOrderCreateData,
  ImportOrderUpdateData,
  ImportOrderFilters,
  ImportOrderSorting,
  ImportOrderListResult,
  ImportOrderStatus
} from '../models/ImportOrder';

export class ImportOrderRepository {
  constructor(private pool: Pool) {}

  /**
   * Get all import orders with filters and pagination - theo mẫu VT-01
   */
  async findAll(filters: ImportOrderFilters = {}) {
    const { warehouse_id, supplier_id, status, search, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        io.id,
        io.order_number,
        io.warehouse_id,
        io.supplier_id,
        io.created_by,
        io.order_date,
        io.delivery_date,
        io.invoice_number,
        io.delivery_note_number,
        io.receiver_name,
        io.delivery_person,
        io.warehouse_keeper,
        io.accountant,
        io.received_date,
        io.status,
        io.notes,
        io.total_amount,
        io.final_amount,
        io.created_at,
        io.updated_at,
        -- Warehouse information
        w.name as warehouse_name,
        w.code as warehouse_code,
        -- Supplier information  
        s.name as supplier_name,
        s.code as supplier_code,
        -- Created by user information
        u.full_name as created_by_name
      FROM import_orders io
      LEFT JOIN warehouses w ON io.warehouse_id = w.id
      LEFT JOIN suppliers s ON io.supplier_id = s.id
      LEFT JOIN users u ON io.created_by = u.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (warehouse_id) {
      query += ` AND io.warehouse_id = $${paramIndex++}`;
      params.push(warehouse_id);
    }

    if (supplier_id) {
      query += ` AND io.supplier_id = $${paramIndex++}`;
      params.push(supplier_id);
    }

    if (status) {
      query += ` AND io.status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (io.order_number ILIKE $${paramIndex++} OR w.name ILIKE $${paramIndex++} OR s.name ILIKE $${paramIndex++})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Count total records
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await this.pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY io.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    
    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get import order by ID - With all joined data for display
   */
  async findById(id: string): Promise<ImportOrder | null> {
    const query = `
      SELECT 
        io.id,
        io.order_number,
        io.form_template,
        io.warehouse_id,
        io.supplier_id,
        io.created_by,
        io.order_date,
        io.delivery_date,
        io.invoice_number,
        io.delivery_note_number,
        io.reference_document,
        io.reference_document_date,
        io.attached_documents_count,
        io.attached_documents_list,
        io.receiver_name,
        io.delivery_person,
        io.warehouse_keeper,
        io.accountant,
        io.received_date,
        io.status,
        io.notes,
        io.total_amount,
        io.final_amount,
        io.created_at,
        io.updated_at,
        -- Warehouse information
        w.name as warehouse_name,
        w.organization_name as warehouse_organization_name,
        w.department as warehouse_department,
        -- Supplier information  
        s.name as supplier_name,
        -- Created by user information
        u.full_name as created_by_name
      FROM import_orders io
      LEFT JOIN warehouses w ON io.warehouse_id = w.id
      LEFT JOIN suppliers s ON io.supplier_id = s.id
      LEFT JOIN users u ON io.created_by = u.id
      WHERE io.id = $1
    `;

    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const importOrder = result.rows[0];
    
    // Get items with product details
    const itemsQuery = `
      SELECT 
        ioi.id,
        ioi.import_order_id,
        ioi.product_id,
        ioi.quantity_ordered,
        ioi.quantity_received,
        ioi.unit_price,
        ioi.line_total,
        ioi.notes,
        ioi.created_at,
        ioi.updated_at,
        -- Product information
        p.name as product_name,
        p.code as product_code,
        p.unit
      FROM import_order_items ioi
      LEFT JOIN products p ON ioi.product_id = p.id
      WHERE ioi.import_order_id = $1
      ORDER BY ioi.created_at
    `;

    const itemsResult = await this.pool.query(itemsQuery, [id]);
    importOrder.items = itemsResult.rows;

    return importOrder;
  }

  /**
   * Create new import order - theo mẫu VT-01
   */
  async create(importOrder: ImportOrder): Promise<ImportOrder> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert import order với đầy đủ field VT-01 including financial amounts
      const orderQuery = `
        INSERT INTO import_orders (
          order_number,
          warehouse_id, 
          supplier_id,
          created_by,
          order_date,
          delivery_date,
          invoice_number,
          delivery_note_number,
          reference_document,
          reference_document_date,
          attached_documents_count,
          attached_documents_list,
          form_template,
          delivery_person,
          receiver_name,
          warehouse_keeper,
          accountant,
          status,
          notes,
          total_amount,
          final_amount
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `;

      const orderValues = [
        importOrder.order_number,
        importOrder.warehouse_id,
        importOrder.supplier_id,
        importOrder.created_by,
        importOrder.order_date || new Date(),
        importOrder.delivery_date || null,
        importOrder.invoice_number || null,
        importOrder.delivery_note_number || null,
        importOrder.reference_document || null,
        importOrder.reference_document_date || null,
        importOrder.attached_documents_count || 0,
        importOrder.attached_documents_list || null,
        importOrder.form_template || '01-VT',
        importOrder.delivery_person || null,
        importOrder.receiver_name || null,
        importOrder.warehouse_keeper || null,
        importOrder.accountant || null,
        importOrder.status || 'draft',
        importOrder.notes || null,
        importOrder.total_amount || 0,
        importOrder.final_amount || 0
      ];

      const orderResult = await client.query(orderQuery, orderValues);
      const newOrder = orderResult.rows[0];

      // Insert items với unit
      if (importOrder.items && importOrder.items.length > 0) {
        for (const item of importOrder.items) {
          const itemQuery = `
            INSERT INTO import_order_items (
              import_order_id,
              product_id,
              quantity_ordered,
              quantity_received,
              unit_price,
              notes
            )
            VALUES ($1, $2, $3, $4, $5, $6)
          `;

          await client.query(itemQuery, [
            newOrder.id,
            item.product_id,
            item.quantity_ordered,
            item.quantity_received || 0,
            item.unit_price,
            item.notes || null
          ]);
        }
      }

      await client.query('COMMIT');
      return await this.findById(newOrder.id) as ImportOrder;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update import order - theo mẫu VT-01
   */
  async update(id: string, importOrder: Partial<ImportOrder>): Promise<ImportOrder | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Include financial fields and other VT-01 fields that can be updated
    const allowedFields: (keyof ImportOrder)[] = [
      'order_date', 'delivery_date', 'invoice_number', 'delivery_note_number',
      'reference_document', 'reference_document_date', 'attached_documents_count',
      'attached_documents_list', 'delivery_person', 'receiver_name', 
      'warehouse_keeper', 'accountant', 'status', 'notes',
      'total_amount', 'final_amount'
    ];

    allowedFields.forEach(field => {
      if (importOrder[field] !== undefined) {
        fields.push(`${String(field)} = $${paramIndex++}`);
        values.push(importOrder[field]);
      }
    });

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE import_orders 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    await this.pool.query(query, values);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM import_orders WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async updateStatus(id: string, updateData: any): Promise<ImportOrder | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Allow status and related fields to be updated
    const allowedFields = ['status', 'received_date'];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push(updateData[field]);
      }
    });

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE import_orders 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    await this.pool.query(query, values);
    return await this.findById(id);
  }

  /**
   * Get last order number with given pattern for sequence generation
   */
  async getLastOrderNumber(pattern: string): Promise<string | null> {
    const query = `
      SELECT order_number 
      FROM import_orders 
      WHERE order_number LIKE $1
      ORDER BY order_number DESC 
      LIMIT 1
    `;
    
    const result = await this.pool.query(query, [`${pattern}%`]);
    return result.rows.length > 0 ? result.rows[0].order_number : null;
  }
} 
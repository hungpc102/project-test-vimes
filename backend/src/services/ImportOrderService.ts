/**
 * Import Order Service - Full Database Schema Compliance
 * Complete business logic for import order operations
 */

import { ImportOrderRepository } from '../repositories/ImportOrderRepository';
import { ImportOrder, ImportOrderFilters, ImportOrderHelper } from '../models/ImportOrder';
import { generateOrderNumber } from '../utils/orderNumberGenerator';

export class ImportOrderService {
  constructor(private importOrderRepository: ImportOrderRepository) {}

  /**
   * Get all import orders with filtering and pagination - full database schema
   */
  async getImportOrders(filters: ImportOrderFilters = {}) {
    const result = await this.importOrderRepository.findAll(filters);
    
    // Clean data - trả về đầy đủ field database schema
    const cleanedData = result.data.map(order => this.cleanOrderData(order));
    
    return {
      ...result,
      data: cleanedData
    };
  }

  /**
   * Get import order by ID - full database schema
   */
  async getImportOrderById(id: string): Promise<ImportOrder | null> {
    const order = await this.importOrderRepository.findById(id);
    if (!order) return null;
    
    return this.cleanOrderDataFull(order);
  }

  /**
   * Get import order by ID - Database fields only (no joins)
   */
  async getImportOrderByIdDatabaseOnly(id: string): Promise<ImportOrder | null> {
    const order = await this.importOrderRepository.findById(id);
    if (!order) return null;
    
    // Return only actual database fields
    return {
      ...order,
      items: order.items || []
    };
  }

  /**
   * Create new import order - full database schema
   */
  async createImportOrder(orderData: ImportOrder): Promise<ImportOrder> {
    // Auto-generate order number if not provided
    if (!orderData.order_number) {
      orderData.order_number = await generateOrderNumber();
    }

    // Set defaults for database schema
    if (!orderData.form_template) {
      orderData.form_template = '01-VT';
    }

    if (!orderData.order_date) {
      orderData.order_date = new Date();
    }

    if (!orderData.status) {
      orderData.status = 'draft';
    }

    if (orderData.attached_documents_count === undefined) {
      orderData.attached_documents_count = 0;
    }

    // Calculate total amount from items
    if (orderData.items && orderData.items.length > 0) {
      orderData.total_amount = ImportOrderHelper.calculateTotalAmount(orderData.items);
      orderData.final_amount = ImportOrderHelper.calculateFinalAmount(orderData.total_amount);
    } else {
      orderData.total_amount = 0;
      orderData.final_amount = 0;
    }

    const newOrder = await this.importOrderRepository.create(orderData);
    return this.cleanOrderDataFull(newOrder);
  }

  /**
   * Update import order - full database schema
   */
  async updateImportOrder(id: string, updateData: Partial<ImportOrder>): Promise<ImportOrder | null> {
    // Recalculate financial amounts if items are updated
    if (updateData.items) {
      updateData.total_amount = ImportOrderHelper.calculateTotalAmount(updateData.items);
      updateData.final_amount = ImportOrderHelper.calculateFinalAmount(updateData.total_amount);
    }

    const updatedOrder = await this.importOrderRepository.update(id, updateData);
    if (!updatedOrder) return null;
    
    return this.cleanOrderDataFull(updatedOrder);
  }

  /**
   * Update import order status with business logic validation
   */
  async updateImportOrderStatus(id: string, status: string): Promise<ImportOrder | null> {
    // Get current order to validate status transition
    const currentOrder = await this.importOrderRepository.findById(id);
    if (!currentOrder) return null;

    // Validate status transition
    if (!ImportOrderHelper.isValidStatusTransition(currentOrder.status, status as any)) {
      throw new Error(`Invalid status transition from ${currentOrder.status} to ${status}`);
    }

    // Additional logic for specific status changes
    const updateData: any = { status };
    
    if (status === 'received' && !currentOrder.received_date) {
      updateData.received_date = new Date();
    }

    const updatedOrder = await this.importOrderRepository.updateStatus(id, updateData);
    if (!updatedOrder) return null;
    
    return this.cleanOrderDataFull(updatedOrder);
  }

  /**
   * Delete import order with business logic validation
   */
  async deleteImportOrder(id: string): Promise<boolean> {
    // Check if order can be deleted
    const order = await this.importOrderRepository.findById(id);
    if (!order) return false;

    if (!ImportOrderHelper.isDeletable(order.status)) {
      throw new Error(`Cannot delete order with status: ${order.status}`);
    }

    return await this.importOrderRepository.delete(id);
  }

  /**
   * Clean order data for list response - essential fields
   */
  private cleanOrderData(order: any) {
    return {
      id: order.id,
      order_number: order.order_number,
      form_template: order.form_template || '01-VT',
      order_date: order.order_date,
      delivery_date: order.delivery_date || null,
      warehouse_id: order.warehouse_id,
      warehouse_name: order.warehouse_name,
      warehouse_organization_name: order.warehouse_organization_name || null,
      warehouse_department: order.warehouse_department || null,
      supplier_id: order.supplier_id,
      supplier_name: order.supplier_name,
      invoice_number: order.invoice_number || null,
      delivery_note_number: order.delivery_note_number || null,
      delivery_person: order.delivery_person || null,
      receiver_name: order.receiver_name || null,
      warehouse_keeper: order.warehouse_keeper || null,
      accountant: order.accountant || null,
      received_date: order.received_date || null,
      status: order.status,
      total_amount: order.total_amount || 0,
      final_amount: order.final_amount || 0,
      created_at: order.created_at,
      updated_at: order.updated_at
    };
  }

  /**
   * Clean order data for full response - all database schema fields
   */
  private cleanOrderDataFull(order: any) {
    const cleanedOrder = {
      id: order.id,
      
      // Header information - Database Schema
      order_number: order.order_number,
      form_template: order.form_template || '01-VT',
      order_date: order.order_date,
      delivery_date: order.delivery_date || null,
      
      // Warehouse and supplier information
      warehouse_id: order.warehouse_id,
      warehouse_name: order.warehouse_name,
      warehouse_organization_name: order.warehouse_organization_name || null,
      warehouse_department: order.warehouse_department || null,
      supplier_id: order.supplier_id,
      supplier_name: order.supplier_name,
      
      // Document information - Database Schema
      invoice_number: order.invoice_number || null,
      delivery_note_number: order.delivery_note_number || null,
      reference_document: order.reference_document || null,
      reference_document_date: order.reference_document_date || null,
      attached_documents_count: order.attached_documents_count || 0,
      attached_documents_list: order.attached_documents_list || null,
      
      // Personnel information - Database Schema
      receiver_name: order.receiver_name || null,
      delivery_person: order.delivery_person || null,
      warehouse_keeper: order.warehouse_keeper || null,
      accountant: order.accountant || null,
      received_date: order.received_date || null,
      
      // Status and metadata - Database Schema
      status: order.status,
      notes: order.notes || null,
      
      // Financial information - Database Schema
      total_amount: order.total_amount || 0,
      final_amount: order.final_amount || 0,
      
      // Audit fields - Database Schema
      created_by: order.created_by,
      created_at: order.created_at,
      updated_at: order.updated_at
    };

    // Clean items data - all database schema fields for items
    if (order.items) {
      (cleanedOrder as any).items = order.items.map((item: any) => ({
        id: item.id,
        import_order_id: item.import_order_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code || null,
        unit: item.unit || 'chiếc',
        quantity_ordered: item.quantity_ordered,
        quantity_received: item.quantity_received || 0,
        unit_price: item.unit_price,
        line_total: item.line_total || (item.quantity_ordered * item.unit_price),
        notes: item.notes || null,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    }

    return cleanedOrder;
  }

  /**
   * Validate order data for business rules
   */
  private validateOrderData(orderData: Partial<ImportOrder>): void {
    // Date validations
    if (orderData.order_date && new Date(orderData.order_date) > new Date()) {
      throw new Error('Order date cannot be in the future');
    }

    if (orderData.delivery_date && orderData.order_date && 
        new Date(orderData.delivery_date) < new Date(orderData.order_date)) {
      throw new Error('Delivery date cannot be before order date');
    }

    // Quantity validations
    if (orderData.items) {
      orderData.items.forEach((item, index) => {
        if (item.quantity_ordered <= 0) {
          throw new Error(`Item ${index + 1}: Quantity ordered must be positive`);
        }
        
        if (item.unit_price < 0) {
          throw new Error(`Item ${index + 1}: Unit price cannot be negative`);
        }
      });
    }
  }
}

export default ImportOrderService; 
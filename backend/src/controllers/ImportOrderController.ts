/**
 * Import Order Controller - Full Database Schema Compliance
 * Complete CRUD operations for import orders
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { validationResult } from 'express-validator';
import { ImportOrderService } from '../services/ImportOrderService';
import { generateOrderNumber } from '../utils/orderNumberGenerator';
import { ImportOrderRepository } from '../repositories/ImportOrderRepository';
import { pool } from '../config/database';
import logger from '../config/logger';
import { sendSuccess, sendError } from '../utils/responseHelpers';
import { ValidationError, NotFoundError, BusinessLogicError } from '../utils/errors';
import { ImportOrderFilters } from '../models/ImportOrder';

export class ImportOrderController {
  private importOrderService: ImportOrderService;
  private logger = logger;

  constructor() {
    const importOrderRepository = new ImportOrderRepository(pool);
    this.importOrderService = new ImportOrderService(importOrderRepository);
  }

  /**
   * Helper method to get valid UUID - Use default user if not provided
   */
  private getValidUUID(value: any): string {
    // If value is already a valid UUID, return it
    if (value && typeof value === 'string' && value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return value;
    }
    // Use default user UUID from sample data (user1)
    return '550e8400-e29b-41d4-a716-446655440002';
  }

  /**
   * Get all import orders with full filtering - theo database schema
   */
  getImportOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: ImportOrderFilters = {
        warehouse_id: req.query.warehouse_id as string,
        supplier_id: req.query.supplier_id as string,
        status: req.query.status as any,
        order_date_from: req.query.order_date_from ? new Date(req.query.order_date_from as string) : undefined,
        order_date_to: req.query.order_date_to ? new Date(req.query.order_date_to as string) : undefined,
        delivery_date_from: req.query.delivery_date_from ? new Date(req.query.delivery_date_from as string) : undefined,
        delivery_date_to: req.query.delivery_date_to ? new Date(req.query.delivery_date_to as string) : undefined,
        invoice_number: req.query.invoice_number as string,
        delivery_note_number: req.query.delivery_note_number as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      };

      const result = await this.importOrderService.getImportOrders(filters);
      
      logger.info('Retrieved import orders successfully', { 
        count: result.data.length,
        total: result.pagination.total,
        filters 
      });

      sendSuccess(res, {
        data: result.data,
        pagination: result.pagination,
        message: 'Import orders retrieved successfully'
      });

    } catch (error: any) {
      logger.error('Error getting import orders', { error: error.message, stack: error.stack });
      sendError(res, error.message, 500);
    }
  };

  /**
   * Get import order by ID - Database fields only
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          timestamp: new Date().toISOString(),
          error: {
            message: 'Import order ID is required',
            code: 'MISSING_ID'
          }
        });
        return;
      }

      const importOrder = await this.importOrderService.getImportOrderById(id);

      if (!importOrder) {
        res.status(404).json({
          success: false,
          timestamp: new Date().toISOString(),
          error: {
            message: 'Import order not found',
            code: 'NOT_FOUND'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        data: importOrder,
        message: 'Import order retrieved successfully',
        meta: {}
      });

    } catch (error: any) {
      this.logger.error('Error fetching import order:', error);
      res.status(500).json({
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          message: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR',
          statusCode: 500
        }
      });
    }
  }

  /**
   * Get basic import order info (minimal fields)
   */
  async getBasicById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const importOrder = await this.importOrderService.getImportOrderByIdDatabaseOnly(id);
      if (!importOrder) {
        res.status(404).json({
          success: false,
          timestamp: new Date().toISOString(),
          error: { message: 'Import order not found', code: 'NOT_FOUND' }
        });
        return;
      }

      // Return only essential fields
      const basicData = {
        id: importOrder.id,
        order_number: importOrder.order_number,
        status: importOrder.status,
        warehouse_name: importOrder.warehouse_name,
        supplier_name: importOrder.supplier_name,
        total_amount: importOrder.total_amount,
        created_at: importOrder.created_at
      };

      res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        data: { data: basicData },
        message: 'Basic import order info retrieved successfully'
      });

    } catch (error: any) {
      this.logger.error('Error fetching basic import order:', error);
      res.status(500).json({
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          message: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }

  /**
   * Helper method to filter object fields
   */
  private filterFields(obj: any, fields: string[]): any {
    const filtered: any = {};
    
    fields.forEach(field => {
      if (field in obj) {
        filtered[field] = obj[field];
      }
    });

    // Always include essential fields
    const essentialFields = ['id', 'order_number', 'status'];
    essentialFields.forEach(field => {
      if (field in obj && !(field in filtered)) {
        filtered[field] = obj[field];
      }
    });

    return filtered;
  }

  /**
   * Create new import order with all database fields
   */
  createImportOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Generate order number
      const orderNumber = await generateOrderNumber('PNK');
      
      // Validate and prepare order data with all database fields
      const orderData = {
        // Required fields
        order_number: orderNumber,
        warehouse_id: req.body.warehouse_id,
        supplier_id: req.body.supplier_id,
        created_by: this.getValidUUID(req.body.created_by), // Generate valid UUID
        
        // Optional header fields
        form_template: req.body.form_template || '01-VT',
        order_date: req.body.order_date ? new Date(req.body.order_date) : new Date(),
        delivery_date: req.body.delivery_date ? new Date(req.body.delivery_date) : undefined,
        invoice_number: req.body.invoice_number,
        delivery_note_number: req.body.delivery_note_number,
        reference_document: req.body.reference_document,
        reference_document_date: req.body.reference_document_date ? new Date(req.body.reference_document_date) : undefined,
        attached_documents_count: req.body.attached_documents_count || 0,
        attached_documents_list: req.body.attached_documents_list,
        
        // Personnel fields
        receiver_name: req.body.receiver_name,
        delivery_person: req.body.delivery_person,
        warehouse_keeper: req.body.warehouse_keeper,
        accountant: req.body.accountant,
        
        // Financial fields
        notes: req.body.notes || null,
        
        // Items
        items: req.body.items || [],
        
        // Status
        status: 'draft' as const
      };

      const newImportOrder = await this.importOrderService.createImportOrder(orderData);
      
      logger.info('Created import order successfully', { 
        id: newImportOrder.id,
        orderNumber: newImportOrder.order_number 
      });

      sendSuccess(res, {
        data: newImportOrder,
        message: 'Import order created successfully'
      }, 201);

    } catch (error: any) {
      logger.error('Error creating import order', { 
        error: error.message,
        stack: error.stack,
        body: req.body 
      });
      sendError(res, error.message, 500);
    }
  };

  /**
   * Update import order with full database schema support
   */
  updateImportOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Prepare update data with all possible database fields
      const updateData: any = {};
      
      // Header fields
      if (req.body.warehouse_id !== undefined) updateData.warehouse_id = req.body.warehouse_id;
      if (req.body.supplier_id !== undefined) updateData.supplier_id = req.body.supplier_id;
      if (req.body.form_template !== undefined) updateData.form_template = req.body.form_template;
      if (req.body.order_date !== undefined) updateData.order_date = new Date(req.body.order_date);
      if (req.body.delivery_date !== undefined) updateData.delivery_date = new Date(req.body.delivery_date);
      if (req.body.invoice_number !== undefined) updateData.invoice_number = req.body.invoice_number;
      if (req.body.delivery_note_number !== undefined) updateData.delivery_note_number = req.body.delivery_note_number;
      if (req.body.reference_document !== undefined) updateData.reference_document = req.body.reference_document;
      if (req.body.reference_document_date !== undefined) updateData.reference_document_date = new Date(req.body.reference_document_date);
      if (req.body.attached_documents_count !== undefined) updateData.attached_documents_count = req.body.attached_documents_count;
      if (req.body.attached_documents_list !== undefined) updateData.attached_documents_list = req.body.attached_documents_list;
      
      // Personnel fields
      if (req.body.receiver_name !== undefined) updateData.receiver_name = req.body.receiver_name;
      if (req.body.delivery_person !== undefined) updateData.delivery_person = req.body.delivery_person;
      if (req.body.warehouse_keeper !== undefined) updateData.warehouse_keeper = req.body.warehouse_keeper;
      if (req.body.accountant !== undefined) updateData.accountant = req.body.accountant;
      if (req.body.received_date !== undefined) updateData.received_date = new Date(req.body.received_date);
      
      // Financial fields
      if (req.body.notes !== undefined) updateData.notes = req.body.notes;
      
      // Items (if provided)
      if (req.body.items !== undefined) updateData.items = req.body.items;

      const updatedImportOrder = await this.importOrderService.updateImportOrder(id, updateData);
      
      if (!updatedImportOrder) {
        return sendError(res, 'Import order not found', 404);
      }

      logger.info('Updated import order successfully', { 
        id,
        orderNumber: updatedImportOrder.order_number 
      });

      sendSuccess(res, {
        data: updatedImportOrder,
        message: 'Import order updated successfully'
      });

    } catch (error: any) {
      logger.error('Error updating import order', { 
        id: req.params.id,
        error: error.message,
        stack: error.stack,
        body: req.body 
      });
      sendError(res, error.message, 500);
    }
  };

  /**
   * Update import order status
   */
  updateImportOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return sendError(res, 'Status is required', 400);
      }

      const updatedImportOrder = await this.importOrderService.updateImportOrderStatus(id, status);
      
      if (!updatedImportOrder) {
        return sendError(res, 'Import order not found', 404);
      }

      logger.info('Updated import order status successfully', { 
        id,
        status,
        orderNumber: updatedImportOrder.order_number 
      });

      sendSuccess(res, {
        data: updatedImportOrder,
        message: 'Import order status updated successfully'
      });

    } catch (error: any) {
      logger.error('Error updating import order status', { 
        id: req.params.id,
        status: req.body.status,
        error: error.message,
        stack: error.stack 
      });
      sendError(res, error.message, 500);
    }
  };

  /**
   * Mark import order as received
   */
  markAsReceived = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const updateData = {
        status: 'received' as const,
        received_date: req.body.received_date ? new Date(req.body.received_date) : new Date(),
        warehouse_keeper: req.body.warehouse_keeper,
        accountant: req.body.accountant
      };

      const updatedImportOrder = await this.importOrderService.updateImportOrder(id, updateData);
      
      if (!updatedImportOrder) {
        return sendError(res, 'Import order not found', 404);
      }

      logger.info('Marked import order as received successfully', { 
        id,
        receivedDate: updateData.received_date,
        orderNumber: updatedImportOrder.order_number 
      });

      sendSuccess(res, {
        data: updatedImportOrder,
        message: 'Import order marked as received successfully'
      });

    } catch (error: any) {
      logger.error('Error marking import order as received', { 
        id: req.params.id,
        error: error.message,
        stack: error.stack 
      });
      sendError(res, error.message, 500);
    }
  };

  /**
   * Delete import order
   */
  deleteImportOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const deleted = await this.importOrderService.deleteImportOrder(id);
      
      if (!deleted) {
        return sendError(res, 'Import order not found', 404);
      }

      logger.info('Deleted import order successfully', { id });

      sendSuccess(res, {
        message: 'Import order deleted successfully'
      });

    } catch (error: any) {
      logger.error('Error deleting import order', { 
        id: req.params.id,
        error: error.message,
        stack: error.stack 
      });
      sendError(res, error.message, 500);
    }
  };
}

export default new ImportOrderController(); 
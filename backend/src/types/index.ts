// Common type definitions for the warehouse management system

import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

// Extended Request interface with user and correlation ID
export interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  correlationId?: string;
  rawBody?: Buffer;
}

// Standard API Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  timestamp: string;
  data?: T;
  meta?: {
    message?: string;
    pagination?: PaginationMeta;
    [key: string]: any;
  };
  error?: {
    message: string;
    code: string;
    statusCode?: number;
    correlationId?: string;
    details?: ValidationError[];
    stack?: string;
  };
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Validation error details
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  location?: string;
}

// Database filter options
export interface FilterOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

// Import Order related types
export interface ImportOrder {
  id?: string;
  order_number?: string;
  form_template?: string;
  warehouse_id: string;
  warehouse_name?: string;
  supplier_id: string;
  supplier_name?: string;
  created_by: string;
  order_date?: Date | string;
  delivery_date?: Date | string;
  invoice_number?: string;
  delivery_note_number?: string;
  reference_document?: string;
  reference_document_date?: Date | string;
  attached_documents_count?: number;
  attached_documents_list?: string;
  receiver_name?: string;
  delivery_person?: string;
  warehouse_keeper?: string;
  accountant?: string;
  received_date?: Date | string;
  status: string;
  notes?: string;
  total_amount?: number;
  final_amount?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
  items?: ImportOrderItem[];
}

export interface ImportOrderItem {
  id?: string;
  import_order_id?: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_price: number;
  line_total?: number;
  notes?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export type ImportOrderStatus = 'draft' | 'pending' | 'partial' | 'received' | 'cancelled';

// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

// Warehouse related types
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  manager_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Supplier related types
export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_code?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Product related types
export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  category_id: string;
  unit: string;
  unit_price: number;
  barcode?: string;
  min_stock: number;
  max_stock: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Statistics related types
export interface ImportOrderStatistics {
  totalOrders: number;
  totalDraftOrders: number;
  totalPendingOrders: number;
  totalReceivedOrders: number;
  totalCancelledOrders: number;
  totalValue: number;
  averageOrderValue: number;
  ordersThisMonth: number;
  ordersLastMonth: number;
  growthRate: number;
}

// Database connection types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Logger configuration
export interface LoggerConfig {
  level: string;
  format: any;
  transports: any[];
}

// Environment configuration
export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  database: DatabaseConfig;
  logger: LoggerConfig;
}

// Service method return types
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Repository method options
export interface RepositoryOptions {
  transaction?: any;
  returning?: string[];
}

// Order number generation options
export interface OrderNumberOptions {
  dateFormat?: string;
  sequenceLength?: number;
  separator?: string;
  useWarehouseCode?: boolean;
  warehouseCode?: string | null;
}

// Custom error types
export class ValidationError extends Error {
  public details?: ValidationError[];
  
  constructor(message: string, details?: ValidationError[]) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
} 
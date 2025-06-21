/**
 * Import Order Model - Theo đúng mẫu phiếu VT-01
 * Bao gồm tất cả field theo database schema, không thừa không thiếu
 */

export interface ImportOrderItem {
  id?: string;
  import_order_id?: string;
  product_id: string;
  product_name?: string; // Tên, nhãn hiệu, quy cách, phẩm chất
  product_code?: string; // Mã số
  unit?: string; // Đơn vị tính
  quantity_ordered: number; // Số lượng theo chứng từ
  quantity_received?: number; // Số lượng thực nhập
  unit_price: number; // Đơn giá
  line_total?: number; // Thành tiền (calculated field)
  notes?: string; // Ghi chú cho item
  created_at?: Date;
  updated_at?: Date;
}

export interface ImportOrder {
  id?: string;
  
  // Thông tin phiếu VT-01 - Database Schema Fields
  order_number?: string; // VARCHAR(50) UNIQUE NOT NULL
  form_template?: string; // VARCHAR(20) DEFAULT '01-VT' - from schema_updates
  order_date?: Date; // DATE NOT NULL DEFAULT CURRENT_DATE
  delivery_date?: Date; // DATE - from schema
  
  // Thông tin kho và nhà cung cấp
  warehouse_id: string; // UUID NOT NULL REFERENCES warehouses(id)
  warehouse_name?: string; // Join field
  warehouse_organization_name?: string; // From schema_updates
  warehouse_department?: string; // From schema_updates
  supplier_id: string; // UUID NOT NULL REFERENCES suppliers(id)
  supplier_name?: string; // Join field
  
  // Thông tin giao nhận - Database Schema Fields
  invoice_number?: string; // VARCHAR(100) - from schema
  delivery_note_number?: string; // VARCHAR(100) - from schema
  receiver_name?: string; // VARCHAR(255) - from schema
  delivery_person?: string; // VARCHAR(255) - from schema
  warehouse_keeper?: string; // VARCHAR(255) - from schema
  accountant?: string; // VARCHAR(255) - from schema
  received_date?: Date; // DATE - from schema
  
  // Thông tin căn cứ - Schema Updates Fields
  reference_document?: string; // VARCHAR(255) - from schema_updates
  reference_document_date?: Date; // DATE - from schema_updates
  attached_documents_count?: number; // INTEGER DEFAULT 0 - from schema_updates
  attached_documents_list?: string; // TEXT - from schema_updates
  
  // Trạng thái và metadata
  status: ImportOrderStatus; // VARCHAR(20) NOT NULL DEFAULT 'draft'
  notes?: string; // TEXT - from schema
  total_amount?: number; // DECIMAL(15,2) DEFAULT 0
  final_amount?: number; // DECIMAL(15,2) DEFAULT 0 - same as total_amount now
  created_by: string; // UUID NOT NULL REFERENCES users(id)
  created_at?: Date; // TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  updated_at?: Date; // TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  
  // Items - Danh sách hàng hóa
  items?: ImportOrderItem[];
}

export type ImportOrderStatus = 'draft' | 'pending' | 'partial' | 'received' | 'cancelled';

export interface ImportOrderFilters {
  warehouse_id?: string;
  supplier_id?: string;
  status?: ImportOrderStatus;
  order_date_from?: Date;
  order_date_to?: Date;
  delivery_date_from?: Date;
  delivery_date_to?: Date;
  search?: string;
  invoice_number?: string;
  delivery_note_number?: string;
  page?: number;
  limit?: number;
}

export interface ImportOrderSorting {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ImportOrderCreateData {
  // Required fields
  warehouse_id: string;
  supplier_id: string;
  created_by: string;
  
  // Optional header fields
  form_template?: string;
  order_date?: Date;
  delivery_date?: Date;
  invoice_number?: string;
  delivery_note_number?: string;
  reference_document?: string;
  reference_document_date?: Date;
  attached_documents_count?: number;
  attached_documents_list?: string;
  
  // Personnel fields
  receiver_name?: string;
  delivery_person?: string;  
  warehouse_keeper?: string;
  accountant?: string;
  
  // Financial fields
  notes?: string;
  
  // Items array
  items: Array<{
    product_id: string;
    quantity_ordered: number;
    quantity_received?: number;
    unit_price: number;
    notes?: string;
  }>;
}

export interface ImportOrderUpdateData {
  // Header fields
  warehouse_id?: string;
  supplier_id?: string;
  form_template?: string;
  order_date?: Date;
  delivery_date?: Date;
  invoice_number?: string;
  delivery_note_number?: string;
  reference_document?: string;
  reference_document_date?: Date;
  attached_documents_count?: number;
  attached_documents_list?: string;
  
  // Personnel fields
  receiver_name?: string;
  delivery_person?: string;
  warehouse_keeper?: string;
  accountant?: string;
  received_date?: Date;
  
  // Financial fields
  notes?: string;
  
  // Items can be updated separately
  items?: Array<{
    id?: string;
    product_id: string;
    quantity_ordered: number;
    quantity_received?: number;
    unit_price: number;
    notes?: string;
  }>;
}

export interface ImportOrderListResult {
  data: ImportOrder[];
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Business logic constants and helpers
 */
export const ImportOrderConstants = {
  STATUS: {
    DRAFT: 'draft' as const,
    PENDING: 'pending' as const,
    PARTIAL: 'partial' as const,
    RECEIVED: 'received' as const,
    CANCELLED: 'cancelled' as const,
  },
  
  STATUS_TRANSITIONS: {
    draft: ['pending', 'cancelled'],
    pending: ['partial', 'received', 'cancelled'],
    partial: ['received', 'cancelled'],
    received: [],
    cancelled: []
  } as Record<ImportOrderStatus, ImportOrderStatus[]>,
  
  ORDER_NUMBER_PREFIX: 'NK',
  ORDER_NUMBER_LENGTH: 10
};

/**
 * Helper functions for ImportOrder business logic
 */
export class ImportOrderHelper {
  static isValidStatusTransition(currentStatus: ImportOrderStatus, newStatus: ImportOrderStatus): boolean {
    const allowedTransitions = ImportOrderConstants.STATUS_TRANSITIONS[currentStatus];
    return allowedTransitions.includes(newStatus);
  }
  
  static calculateTotalAmount(items: ImportOrderItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.quantity_ordered * item.unit_price);
    }, 0);
  }
  
  static calculateFinalAmount(totalAmount: number): number {
    return totalAmount; // No discount or tax, so final amount equals total amount
  }
  
  static isEditable(status: ImportOrderStatus): boolean {
    return status === 'draft' || status === 'pending';
  }
  
  static isDeletable(status: ImportOrderStatus): boolean {
    return status === 'draft';
  }
  
  static getStatusDisplayName(status: ImportOrderStatus): string {
    const statusMap = {
      draft: 'Nháp',
      pending: 'Chờ xử lý',
      partial: 'Nhận một phần',
      received: 'Đã nhận',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  }
} 
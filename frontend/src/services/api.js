/**
 * Centralized API Service for Warehouse Management System
 * Full Database Schema Compliance - Updated to match backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async fetchWrapper(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {

      
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Import Orders API - Full Database Schema Support
  async getImportOrders(params = {}) {
    // Support all new filter parameters
    const allowedParams = [
      'page', 'limit', 'warehouse_id', 'supplier_id', 'status',
      'order_date_from', 'order_date_to', 'delivery_date_from', 'delivery_date_to',
      'invoice_number', 'delivery_note_number', 'search'
    ];
    
    const filteredParams = Object.keys(params)
      .filter(key => allowedParams.includes(key) && params[key])
      .reduce((obj, key) => {
        obj[key] = params[key];
        return obj;
      }, {});

    const queryString = new URLSearchParams(filteredParams).toString();
    const endpoint = `/import-orders${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.fetchWrapper(endpoint);
    
    // Extract the correct data from response
    if (response.success && response.data) {
      return {
        data: response.data.data || response.data,
        pagination: response.data.pagination || {},
        total: response.data.pagination?.total || response.data.total || 0,
        meta: response.meta || {}
      };
    }
    
    throw new Error('Invalid response format from server');
  }

  async getImportOrderById(id) {
    const response = await this.fetchWrapper(`/import-orders/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Invalid response format from server');
  }

  async createImportOrder(orderData) {
    const payload = {
      warehouse_id: orderData.warehouse_id,
      supplier_id: orderData.supplier_id,
      order_date: orderData.order_date,
      delivery_date: orderData.delivery_date || null,
      invoice_number: orderData.invoice_number || null,
      delivery_note_number: orderData.delivery_note_number || null,
      reference_document: orderData.reference_document || null,
      reference_document_date: orderData.reference_document_date || null,
      attached_documents_count: orderData.attached_documents_count || 0,
      attached_documents_list: orderData.attached_documents_list || null,
      receiver_name: orderData.receiver_name || null,
      delivery_person: orderData.delivery_person || null,
      warehouse_keeper: orderData.warehouse_keeper || null,
      accountant: orderData.accountant || null,
      notes: orderData.notes || null,
      items: orderData.items || []
    };

    const response = await this.fetchWrapper('/import-orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Failed to create import order');
  }

  async updateImportOrder(id, orderData) {
    const updatePayload = {};
    
    // Header fields
    if (orderData.warehouse_id !== undefined) updatePayload.warehouse_id = orderData.warehouse_id;
    if (orderData.supplier_id !== undefined) updatePayload.supplier_id = orderData.supplier_id;
    if (orderData.form_template !== undefined) updatePayload.form_template = orderData.form_template;
    if (orderData.order_date !== undefined) updatePayload.order_date = orderData.order_date;
    if (orderData.delivery_date !== undefined) updatePayload.delivery_date = orderData.delivery_date;
    if (orderData.invoice_number !== undefined) updatePayload.invoice_number = orderData.invoice_number;
    if (orderData.delivery_note_number !== undefined) updatePayload.delivery_note_number = orderData.delivery_note_number;
    if (orderData.reference_document !== undefined) updatePayload.reference_document = orderData.reference_document;
    if (orderData.reference_document_date !== undefined) updatePayload.reference_document_date = orderData.reference_document_date;
    if (orderData.attached_documents_count !== undefined) updatePayload.attached_documents_count = orderData.attached_documents_count;
    if (orderData.attached_documents_list !== undefined) updatePayload.attached_documents_list = orderData.attached_documents_list;
    
    // Personnel fields  
    if (orderData.receiver_name !== undefined) updatePayload.receiver_name = orderData.receiver_name;
    if (orderData.delivery_person !== undefined) updatePayload.delivery_person = orderData.delivery_person;
    if (orderData.warehouse_keeper !== undefined) updatePayload.warehouse_keeper = orderData.warehouse_keeper;
    if (orderData.accountant !== undefined) updatePayload.accountant = orderData.accountant;
    if (orderData.received_date !== undefined) updatePayload.received_date = orderData.received_date;
    
    // Financial fields
    if (orderData.notes !== undefined) updatePayload.notes = orderData.notes;
    
    // Items
    if (orderData.items !== undefined) updatePayload.items = orderData.items;

    const response = await this.fetchWrapper(`/import-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Failed to update import order');
  }

  async deleteImportOrder(id) {
    const response = await this.fetchWrapper(`/import-orders/${id}`, {
      method: 'DELETE',
    });
    
    return response.success;
  }

  async updateImportOrderStatus(id, status) {
    const response = await this.fetchWrapper(`/import-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Failed to update import order status');
  }

  // New method to mark order as received
  async markImportOrderAsReceived(id, data = {}) {
    const payload = {
      received_date: data.received_date || new Date().toISOString().split('T')[0],
      warehouse_keeper: data.warehouse_keeper || null,
      accountant: data.accountant || null
    };

    const response = await this.fetchWrapper(`/import-orders/${id}/receive`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Failed to mark import order as received');
  }

  // Supporting APIs (updated with proper error handling)
  async getWarehouses() {
    try {
      const response = await this.fetchWrapper('/warehouses');
      return response.success ? (response.data || []) : [];
    } catch (error) {
      console.warn('Warehouses API error:', error.message);
      return [];
    }
  }

  async getSuppliers() {
    try {
      const response = await this.fetchWrapper('/suppliers');
      return response.success ? (response.data || []) : [];
    } catch (error) {
      console.warn('Suppliers API error:', error.message);
      return [];
    }
  }

  async getProducts() {
    try {
      const response = await this.fetchWrapper('/products');
      return response.success ? (response.data || []) : [];
    } catch (error) {
      console.warn('Products API error:', error.message);
      return [];
    }
  }

  async getInventory(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/inventory${queryString ? `?${queryString}` : ''}`;
      const response = await this.fetchWrapper(endpoint);
      return response.success ? (response.data || []) : [];
    } catch (error) {
      console.warn('Inventory API error:', error.message);
      return [];
    }
  }

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Data validation helper
  validateImportOrderData(orderData) {
    const errors = [];
    
    if (!orderData.warehouse_id) errors.push('Warehouse ID is required');
    if (!orderData.supplier_id) errors.push('Supplier ID is required');
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      errors.push('At least one item is required');
    }
    
    if (orderData.items) {
      orderData.items.forEach((item, index) => {
        if (!item.product_id) errors.push(`Item ${index + 1}: Product ID is required`);
        if (!item.quantity_ordered || item.quantity_ordered <= 0) {
          errors.push(`Item ${index + 1}: Quantity ordered must be positive`);
        }
        if (!item.unit_price || item.unit_price < 0) {
          errors.push(`Item ${index + 1}: Unit price must be non-negative`);
        }
      });
    }
    
    return errors;
  }

  // Format data for backend
  formatOrderDataForBackend(formData) {
    return {
      warehouse_id: formData.warehouse_id,
      supplier_id: formData.supplier_id,
      order_date: formData.order_date,
      delivery_date: formData.delivery_date || null,
      invoice_number: formData.invoice_number || null,
      delivery_note_number: formData.delivery_note_number || null,
      reference_document: formData.reference_document || null,
      reference_document_date: formData.reference_document_date || null,
      attached_documents_count: parseInt(formData.attached_documents_count) || 0,
      attached_documents_list: formData.attached_documents_list || null,
      receiver_name: formData.receiver_name || null,
      delivery_person: formData.delivery_person || null,
      warehouse_keeper: formData.warehouse_keeper || null,
      accountant: formData.accountant || null,
      notes: formData.notes || null,
      items: (formData.items || []).map(item => ({
        product_id: item.product_id,
        quantity_ordered: parseInt(item.quantity_ordered) || 0,
        quantity_received: parseInt(item.quantity_received) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
        notes: item.notes || null
      }))
    };
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService; 
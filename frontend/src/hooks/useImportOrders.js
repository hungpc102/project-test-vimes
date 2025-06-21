import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useImportOrders = () => {
  const [importOrders, setImportOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({ total: 0 });

  const fetchImportOrders = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getImportOrders(params);
      
      
      setImportOrders(result.data || []);
      setMetadata({ total: result.total || 0, ...result.meta });
      
    } catch (error) {
      console.error('Error fetching import orders:', error);
      setError(`Lỗi tải dữ liệu: ${error.message}`);
      setImportOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const success = await apiService.deleteImportOrder(id);
      
      if (success) {
        // Update local state optimistically
        setImportOrders(prev => prev.filter(order => order.id !== id));
        setMetadata(prev => ({ ...prev, total: prev.total - 1 }));
        return { success: true };
      } else {
        return { success: false, error: 'Không thể xóa phiếu nhập' };
      }
    } catch (error) {
      console.error('Error deleting import order:', error);
      return { success: false, error: `Lỗi xóa phiếu nhập: ${error.message}` };
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const updatedOrder = await apiService.updateImportOrderStatus(id, status);
      
      // Update local state
      setImportOrders(prev => 
        prev.map(order => 
          order.id === id ? { ...order, ...updatedOrder } : order
        )
      );
      
      return { success: true, data: updatedOrder };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: `Lỗi cập nhật trạng thái: ${error.message}` };
    }
  };

  const refreshOrders = () => {
    fetchImportOrders();
  };

  // Check backend health on mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      const isHealthy = await apiService.checkHealth();
      if (!isHealthy) {
        setError('Không thể kết nối với server. Vui lòng kiểm tra backend.');
        setLoading(false);
        return;
      }
      
      // If backend is healthy, fetch orders
      fetchImportOrders();
    };

    checkBackendHealth();
  }, []);

  return {
    importOrders,
    loading,
    error,
    metadata,
    deleteOrder,
    updateOrderStatus,
    refreshOrders,
    fetchImportOrders,
    setImportOrders
  };
}; 
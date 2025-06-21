import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Package,
  AlertCircle,
  Calendar,
  Building,
  FileText,
  Receipt,
  DollarSign,
  Truck
} from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';

// Custom hooks and utilities
import { useImportOrders } from '../hooks/useImportOrders';
import { formatCurrency, formatDate, formatId, sanitizeInput } from '../utils/formatters';
import { getStatusConfig, getFilterStatuses, canEditStatus, canDeleteStatus } from '../utils/statusConfig';

// Components
import StatisticsCards from '../components/StatisticsCards';
import ImportOrderCard from '../components/ImportOrderCard';

const ImportOrderList = () => {
  const { importOrders, loading, error, deleteOrder, refreshOrders } = useImportOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Memoized filtered orders for performance
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(importOrders)) return [];
    
    return importOrders.filter(order => {
      const searchQuery = sanitizeInput(searchTerm.toLowerCase());
      const matchesSearch = !searchQuery || 
        order.order_number?.toLowerCase().includes(searchQuery) ||
        order.supplier_name?.toLowerCase().includes(searchQuery) ||
        order.warehouse_name?.toLowerCase().includes(searchQuery) ||
        order.invoice_number?.toLowerCase().includes(searchQuery) ||
        order.delivery_note_number?.toLowerCase().includes(searchQuery);
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [importOrders, searchTerm, statusFilter]);

  // Memoized statistics for performance with new fields
  const stats = useMemo(() => {
    if (!Array.isArray(importOrders)) {
      return { 
        total: 0, 
        pending: 0, 
        received: 0, 
        totalValue: 0,
        avgOrderValue: 0,
        documentsWithInvoice: 0
      };
    }

    const totalValue = importOrders.reduce((sum, o) => sum + parseFloat(o.final_amount || o.total_amount || 0), 0);
    const documentsWithInvoice = importOrders.filter(o => o.invoice_number).length;

    return {
      total: importOrders.length,
      pending: importOrders.filter(o => o.status === 'pending').length,
      received: importOrders.filter(o => o.status === 'received').length,
      totalValue,
      avgOrderValue: importOrders.length ? totalValue / importOrders.length : 0,
      documentsWithInvoice
    };
  }, [importOrders]);

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };



  const handleDeleteOrder = async (id) => {
    const result = await deleteOrder(id);
    if (result.success) {
      // Remove from expanded rows if it was expanded
      setExpandedRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      alert(result.error);
    }
  };

  const toggleRowExpansion = (orderId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };



  // Loading state
  if (loading) {
    return (
      <LoadingSpinner 
        message="Đang tải danh sách phiếu nhập..." 
        fullScreen={false}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center text-red-600 p-8 card">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p className="text-lg font-medium">{error}</p>
        <button 
          onClick={refreshOrders}
          className="mt-4 btn-primary"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header Section */}
      <PageHeader />

      {/* Enhanced Statistics Cards */}
      <EnhancedStatisticsCards stats={stats} />

      {/* Enhanced Filters and Search */}
      <EnhancedSearchAndFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        filteredCount={filteredOrders.length}
        totalCount={importOrders.length}
      />

      {/* Import Orders List */}
      <OrdersList
        orders={filteredOrders}
        expandedRows={expandedRows}
        onToggleExpansion={toggleRowExpansion}
        onDeleteOrder={handleDeleteOrder}
      />
    </div>
  );
};

// Page Header Component
const PageHeader = () => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Quản Lý Phiếu Nhập Kho
      </h1>
      <p className="text-gray-600 mt-1 text-sm sm:text-base">
        Theo dõi và quản lý tất cả phiếu nhập hàng vào kho
      </p>
    </div>
    <Link
      to="/import-orders/new?scrollToProducts=true"
      className="btn btn-create text-sm sm:text-base scale-in w-full sm:w-auto"
    >
      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
      Tạo Phiếu Nhập Mới
    </Link>
  </div>
);

// Enhanced Statistics Cards Component
const EnhancedStatisticsCards = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    <div className="card card-body bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-600 text-sm font-medium">Tổng phiếu</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <Package className="w-8 h-8 text-blue-500" />
      </div>
    </div>

    <div className="card card-body bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-yellow-600 text-sm font-medium">Đang chờ</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <Calendar className="w-8 h-8 text-yellow-500" />
      </div>
    </div>

    <div className="card card-body bg-gradient-to-r from-green-50 to-green-100 border-green-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-green-600 text-sm font-medium">Đã nhận</p>
          <p className="text-2xl font-bold text-green-900">{stats.received}</p>
        </div>
        <Building className="w-8 h-8 text-green-500" />
      </div>
    </div>

    <div className="card card-body bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-purple-600 text-sm font-medium">Tổng giá trị</p>
          <p className="text-lg font-bold text-purple-900">
            {formatCurrency(stats.totalValue)}
          </p>
        </div>
        <DollarSign className="w-8 h-8 text-purple-500" />
      </div>
    </div>
  </div>
);

// Enhanced Search and Filters Component
const EnhancedSearchAndFilters = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  filteredCount,
  totalCount
}) => (
  <div className="card card-body">
    <div className="flex flex-col space-y-4">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã phiếu, nhà cung cấp, số hóa đơn..."
            className="form-input pl-8 sm:pl-10 text-sm sm:text-base"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={onStatusFilterChange}
            className="form-input text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            {getFilterStatuses().map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-500 flex items-center">
          Hiển thị {filteredCount} / {totalCount} phiếu
        </div>
      </div>
    </div>
  </div>
);

// Orders List Component
const OrdersList = ({ orders, expandedRows, onToggleExpansion, onDeleteOrder }) => (
  <div className="card">
    <div className="card-header">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900">
        Danh sách phiếu nhập
      </h2>
    </div>
    
    {orders.length > 0 ? (
      <>
        {/* Desktop Table */}
        <DesktopTable orders={orders} onDeleteOrder={onDeleteOrder} />
        
        {/* Mobile/Tablet Cards */}
        <div className="lg:hidden divide-y divide-gray-200">
          {orders.map((order, index) => (
            <ImportOrderCard
              key={order.id}
              order={order}
              index={index}
              isExpanded={expandedRows.has(order.id)}
              onToggleExpansion={onToggleExpansion}
              onDelete={onDeleteOrder}
            />
          ))}
        </div>
      </>
    ) : (
      <EmptyState />
    )}
  </div>
);

// Desktop Table Component
const DesktopTable = ({ orders, onDeleteOrder }) => (
  <div className="hidden lg:block table-container">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="table-header">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
            Mã phiếu
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
            Nhà cung cấp
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
            Kho
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
            Ngày tạo
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
            Trạng thái
          </th>
          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
            Tổng tiền
          </th>
          <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">
            Thao tác
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {orders.map((order, index) => (
          <DesktopTableRow
            key={order.id}
            order={order}
            index={index}
            onDelete={onDeleteOrder}
          />
        ))}
      </tbody>
    </table>
  </div>
);

// Desktop Table Row Component
const DesktopTableRow = ({ order, index, onDelete }) => {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?')) {
      onDelete(order.id);
    }
  };

  return (
    <tr className="table-row slide-up" style={{animationDelay: `${index * 0.1}s`}}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {order.order_number}
            </div>
            <div className="text-xs text-gray-500">
              ID: {formatId(order.id)}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center">
          <Building className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {order.supplier_name || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              {order.supplier_code || 'N/A'}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{order.warehouse_name || 'N/A'}</div>
        <div className="text-xs text-gray-500">{order.warehouse_code || 'N/A'}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">
              {formatDate(order.created_at)}
            </div>
            <div className="text-xs text-gray-500">
              {order.created_by_name || 'N/A'}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <StatusIcon className={`w-4 h-4 mr-2 ${statusConfig.color}`} />
          <span className={statusConfig.className}>
            {statusConfig.text}
          </span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="text-sm font-bold text-gray-900">
          {formatCurrency(order.total_amount)}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center space-x-2">
          <Link
            to={`/import-orders/${order.id}`}
            className="btn-icon btn-icon-blue"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </Link>
          
          {canEditStatus(order.status) && (
            <Link
              to={`/import-orders/${order.id}/edit`}
              className="btn-icon btn-icon-green"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </Link>
          )}
          
          {canDeleteStatus(order.status) && (
            <button
              onClick={handleDelete}
                                             className="btn-icon btn-icon-red"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="p-8 sm:p-12 text-center">
    <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
      Không tìm thấy phiếu nhập nào
    </h3>
    <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
      Tạo phiếu nhập đầu tiên để bắt đầu
    </p>
    <Link
      to="/import-orders/new?scrollToProducts=true"
      className="btn btn-create text-sm sm:text-base"
    >
      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
      Tạo phiếu nhập mới
    </Link>
  </div>
);

export default ImportOrderList; 
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, ChevronDown, Package, Building, Calendar } from 'lucide-react';
import { formatCurrency, formatDate, formatId } from '../utils/formatters';
import { getStatusConfig, canEditStatus, canDeleteStatus } from '../utils/statusConfig';

const ImportOrderCard = ({ 
  order, 
  index, 
  isExpanded, 
  onToggleExpansion, 
  onDelete 
}) => {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?')) {
      onDelete(order.id);
    }
  };

  return (
    <div 
      className="p-4 slide-up" 
      style={{animationDelay: `${index * 0.1}s`}}
    >
      {/* Main Card Content */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {order.order_number}
              </h3>
              <div className="flex items-center ml-2">
                <StatusIcon className={`w-4 h-4 mr-1 ${statusConfig.color}`} />
                <span className={`${statusConfig.className} text-xs`}>
                  {statusConfig.text}
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-xs text-gray-600">
                <Building className="w-3 h-3 mr-1" />
                <span className="truncate">{order.supplier_name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <ActionButtons 
          order={order}
          onDelete={handleDelete}
          onToggleExpansion={() => onToggleExpansion(order.id)}
          isExpanded={isExpanded}
        />
      </div>
      
      {/* Expanded Details */}
      {isExpanded && (
        <ExpandedDetails order={order} />
      )}
    </div>
  );
};

const ActionButtons = ({ order, onDelete, onToggleExpansion, isExpanded }) => {
  const canEdit = canEditStatus(order.status);
  const canDelete = canDeleteStatus(order.status);

  return (
    <div className="flex items-center space-x-1 ml-2">
      <Link
        to={`/import-orders/${order.id}`}
        className="btn-icon btn-icon-blue"
        title="Xem chi tiết"
      >
        <Eye className="w-4 h-4" />
      </Link>
      
      {canEdit && (
        <Link
          to={`/import-orders/${order.id}/edit`}
          className="btn-icon btn-icon-green"
          title="Chỉnh sửa"
        >
          <Edit className="w-4 h-4" />
        </Link>
      )}
      
      {canDelete && (
        <button
          onClick={onDelete}
          className="btn-icon btn-icon-red"
          title="Xóa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      
      <button
        onClick={onToggleExpansion}
        className="btn-icon btn-icon-gray"
        title="Xem thêm"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};

const ExpandedDetails = ({ order }) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-gray-500">Kho:</span>
          <p className="font-medium text-gray-900">{order.warehouse_name || 'N/A'}</p>
        </div>
        <div>
          <span className="text-gray-500">Ngày tạo:</span>
          <p className="font-medium text-gray-900">{formatDate(order.order_date)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-gray-500">Người giao hàng:</span>
          <p className="font-medium text-gray-900">{order.delivery_person || 'N/A'}</p>
        </div>
        <div>
          <span className="text-gray-500">Người nhận hàng:</span>
          <p className="font-medium text-gray-900">{order.receiver_name || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-gray-500">Thủ kho:</span>
          <p className="font-medium text-gray-900">{order.warehouse_keeper || 'N/A'}</p>
        </div>
        <div>
          <span className="text-gray-500">Kế toán:</span>
          <p className="font-medium text-gray-900">{order.accountant || 'N/A'}</p>
        </div>
      </div>
      
      <div>
        <span className="text-gray-500 text-xs">ID:</span>
        <p className="font-mono text-gray-900 text-xs">{formatId(order.id)}</p>
      </div>
    </div>
  );
};

export default ImportOrderCard; 
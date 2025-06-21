import { Edit, Clock, AlertCircle, CheckCircle } from 'lucide-react';

// Centralized status configuration
export const STATUS_CONFIG = {
  draft: {
    text: 'Nháp',
    className: 'status-badge status-draft',
    icon: Edit,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    canEdit: true,
    canDelete: true,
    priority: 1
  },
  pending: {
    text: 'Chờ xử lý',
    className: 'status-badge status-pending',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    canEdit: true,
    canDelete: true,
    priority: 2
  },
  partial: {
    text: 'Nhận một phần',
    className: 'status-badge bg-orange-100 text-orange-800 border border-orange-200',
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    canEdit: false,
    canDelete: false,
    priority: 3
  },
  received: {
    text: 'Đã hoàn thành',
    className: 'status-badge status-received',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    canEdit: false,
    canDelete: false,
    priority: 4
  },
  cancelled: {
    text: 'Đã hủy',
    className: 'status-badge status-cancelled',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    canEdit: false,
    canDelete: false,
    priority: 5
  }
};

// Get status configuration
export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || {
    text: status || 'Không xác định',
    className: 'status-badge status-draft',
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    canEdit: false,
    canDelete: false,
    priority: 0
  };
};

// Get all available statuses
export const getAllStatuses = () => {
  return Object.keys(STATUS_CONFIG);
};

// Get statuses for filter dropdown
export const getFilterStatuses = () => {
  return Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.text
  }));
};

// Check if status allows editing
export const canEditStatus = (status) => {
  return getStatusConfig(status).canEdit;
};

// Check if status allows deletion
export const canDeleteStatus = (status) => {
  return getStatusConfig(status).canDelete;
}; 
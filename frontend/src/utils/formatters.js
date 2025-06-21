// Currency formatting for Vietnamese Dong
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Date formatting for Vietnamese locale
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  return new Date(dateString).toLocaleDateString('vi-VN', {
    ...defaultOptions,
    ...options
  });
};

// Format date with time
export const formatDateTime = (dateString) => {
  return formatDate(dateString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format ID for display (show first 8 characters)
export const formatId = (id) => {
  if (!id) return 'N/A';
  return id.length > 8 ? `${id.slice(0, 8)}...` : id;
};

// Validate and sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}; 
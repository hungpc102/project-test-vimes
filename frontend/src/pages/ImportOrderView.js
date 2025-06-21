import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye,
  Download,
  Edit,
  Trash2,
  Calendar,
  User,
  Building,
  Package,
  FileText,
  MapPin,
  Phone,
  Mail,
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Calculator,
  Hash,
  RefreshCw,
  Save
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getStatusConfig, canEditStatus, getFilterStatuses } from '../utils/statusConfig';

const ImportOrderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [importOrder, setImportOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchImportOrder();
  }, [id]);

  const fetchImportOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3000/api/v1/import-orders/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Handle both old nested structure and new flat structure
      setImportOrder(data.data?.data || data.data || data);
    } catch (error) {
      console.error('Error fetching import order:', error);
      setError('Không thể tải thông tin phiếu nhập kho');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    navigate(`/import-orders/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/import-orders/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          navigate('/import-orders');
        } else {
          throw new Error('Failed to delete import order');
        }
      } catch (error) {
        console.error('Error deleting import order:', error);
        alert('Không thể xóa phiếu nhập kho');
      }
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      alert('Vui lòng chọn trạng thái mới');
      return;
    }

    if (newStatus === importOrder.status) {
      alert('Trạng thái mới không được giống trạng thái hiện tại');
      return;
    }

    try {
      setUpdating(true);
      
      const response = await fetch(`http://localhost:3000/api/v1/import-orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Không thể cập nhật trạng thái');
      }

      const result = await response.json();
      
      // Update local state
      setImportOrder(prev => ({
        ...prev,
        status: newStatus,
        updated_at: new Date().toISOString()
      }));

      setShowStatusUpdate(false);
      setNewStatus('');
      
      // Show success message
      alert('Cập nhật trạng thái thành công!');
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Lỗi cập nhật trạng thái: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusOptions = () => {
    // Sử dụng status config từ utils để đảm bảo consistency với màn danh sách
    const allStatuses = getFilterStatuses();

    // Định nghĩa quy trình chuyển đổi trạng thái hợp lệ theo business logic
    const validTransitions = {
      'draft': ['pending', 'cancelled'],        // Nháp → Chờ xử lý hoặc Hủy
      'pending': ['partial', 'received', 'cancelled'], // Chờ xử lý → Nhận một phần, Hoàn thành, hoặc Hủy
      'partial': ['received', 'cancelled'],     // Nhận một phần → Hoàn thành hoặc Hủy
      'received': [],                           // Hoàn thành → Không thể chuyển
      'cancelled': []                           // Đã hủy → Không thể chuyển
    };

    const allowedStatuses = validTransitions[importOrder.status] || [];
    
    // Chỉ hiển thị các trạng thái được phép chuyển đổi
    return allStatuses.filter(status => allowedStatuses.includes(status.value));
  };

  const calculateTotals = () => {
    if (!importOrder?.items) return { subtotal: 0, totalQuantity: 0, itemCount: 0 };
    
    const subtotal = importOrder.items.reduce((sum, item) => {
      return sum + (item.quantity_ordered * item.unit_price);
    }, 0);
    
    const totalQuantity = importOrder.items.reduce((sum, item) => {
      return sum + item.quantity_ordered;
    }, 0);

    return {
      subtotal,
      totalQuantity,
      itemCount: importOrder.items.length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="loading-spinner w-12 h-12 mx-auto" />
          <p className="text-gray-600 font-medium">Đang tải thông tin phiếu nhập...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Có lỗi xảy ra</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={() => navigate('/import-orders')}
            className="btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!importOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Package className="w-16 h-16 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Không tìm thấy phiếu nhập</h3>
            <p className="text-gray-600">Phiếu nhập kho không tồn tại hoặc đã bị xóa</p>
          </div>
          <button
            onClick={() => navigate('/import-orders')}
            className="btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();
  const statusConfig = getStatusConfig(importOrder.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-8 fade-in">
      {/* Header with Actions */}
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/import-orders')}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết phiếu nhập #{importOrder.order_number}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                <span className={statusConfig.className}>
                  {statusConfig.text}
                </span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-600">
                Tạo ngày {formatDate(importOrder.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {getStatusOptions().length > 0 && (
            <button
              onClick={() => setShowStatusUpdate(true)}
              className="btn-warning"
              disabled={updating}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
              Cập nhật trạng thái
            </button>
          )}

          <button
            onClick={handlePrint}
            className="btn-secondary"
          >
            <Printer className="w-4 h-4 mr-2" />
            In phiếu
          </button>
          
          {canEditStatus(importOrder.status) && (
            <>
              <button
                onClick={handleEdit}
                className="btn-primary"
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </button>
              
              <button
                onClick={handleDelete}
                className="btn-danger"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cập nhật trạng thái phiếu nhập
              </h3>
              <button
                onClick={() => {
                  setShowStatusUpdate(false);
                  setNewStatus('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái hiện tại
                </label>
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                  <span className={statusConfig.className}>
                    {statusConfig.text}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái mới
                </label>
                                 {getStatusOptions().length > 0 ? (
                   <select
                     value={newStatus}
                     onChange={(e) => setNewStatus(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     disabled={updating}
                   >
                     <option value="">-- Chọn trạng thái mới --</option>
                     {getStatusOptions().map(option => (
                       <option key={option.value} value={option.value}>
                         {option.label}
                       </option>
                     ))}
                   </select>
                 ) : (
                   <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                     Không thể chuyển đổi từ trạng thái "{statusConfig.text}"
                   </div>
                 )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowStatusUpdate(false);
                    setNewStatus('');
                  }}
                  className="btn-secondary"
                  disabled={updating}
                >
                  Hủy
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="btn-primary"
                  disabled={updating || !newStatus}
                >
                  {updating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Cập nhật
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Header - Print Optimized */}
      <div className="card print:shadow-none print:border-0">
        <div className="card-body print:p-8">
          {/* Company Letterhead */}
          <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-blue-900 tracking-wide">
                  CÔNG TY TNHH VIMES
                </h1>
                <p className="text-lg text-blue-700 font-medium">
                  Vietnam Intelligent Management Enterprise System
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>123 Nguyễn Huệ, Q1, TP.HCM</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>(028) 1234-5678</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>contact@vimes.vn</span>
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center mb-8">
            <div className="grid grid-cols-3 gap-4 items-center mb-4">
              <div className="text-left">
                <div className="text-sm">
                  <span>Đơn vị: <strong>{importOrder.warehouse_organization_name || importOrder.warehouse_name || 'Kho Vật Tư'}</strong></span>
                </div>
                <div className="text-sm mt-1">
                  <span>Bộ phận: <strong>{importOrder.warehouse_department || '........................'}</strong></span>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  PHIẾU NHẬP KHO
                </h2>
                <div className="text-sm mt-2">
                  <span>Ngày ....... tháng ....... năm .......</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm">
                  <span><strong>Mẫu số 01 - VT</strong></span>
                </div>
                <div className="text-sm mt-1">
                  <span>(Ban hành theo Thông tư số 200/2014/TT-BTC</span>
                </div>
                <div className="text-sm">
                  <span>Ngày 22/12/2014 của Bộ Tài chính)</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm mt-4">
              <div className="flex items-center space-x-2">
                <span>Số: <strong>{importOrder.order_number}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Cơ quan: <strong>{importOrder.warehouse_name}</strong></span>
              </div>
            </div>
          </div>



          {/* VT-01 Form Information */}
          <div className="mb-8">
            <div className="text-sm space-y-3">
              <div className="flex flex-wrap gap-4">
                <span>- Họ và tên người giao: <strong>{importOrder.delivery_person || '...........................'}</strong></span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <span>- Theo lệnh số: <strong>{importOrder.reference_document || '......'}</strong></span>
                <span>ngày <strong>{importOrder.reference_document_date ? formatDate(importOrder.reference_document_date) : formatDate(importOrder.order_date) || '......'}</strong></span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <span>- Nhập tại kho: <strong>{importOrder.warehouse_name || '...........................'}</strong></span>
                <span>Địa điểm: <strong>{importOrder.warehouse_organization_name || '...........................'}</strong></span>
              </div>
              
              {/* Thông tin chứng từ */}
              <div className="flex flex-wrap gap-4">
                <span>- Số hóa đơn: <strong>{importOrder.invoice_number || '......'}</strong></span>
                <span>- Phiếu giao hàng số: <strong>{importOrder.delivery_note_number || '......'}</strong></span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <span>- Ngày giao hàng: <strong>{importOrder.delivery_date ? formatDate(importOrder.delivery_date) : '......'}</strong></span>
                <span>- Ngày nhận hàng: <strong>{importOrder.received_date ? formatDate(importOrder.received_date) : '......'}</strong></span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <span>- Nhà cung cấp: <strong>{importOrder.supplier_name || '...........................'}</strong></span>
              </div>
              
              {/* Ghi chú */}
              {importOrder.notes && (
                <div className="mt-4">
                  <span>- Ghi chú: <strong>{importOrder.notes}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4">
              <Calculator className="w-5 h-5 inline mr-2 text-orange-600" />
              Danh sách hàng hóa
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                      STT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                      Tên, nhãn hiệu, quy cách, phẩm chất của tài sản, hàng hóa
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                      Mã số
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                      ĐVT
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                      Theo chứng từ
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                      Thực nhập
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {importOrder.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-200">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 border-b border-gray-200">
                        {item.product_name}
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-gray-900 border-b border-gray-200">
                        {item.product_code || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-gray-900 border-b border-gray-200">
                        {item.unit || 'cái'}
                      </td>
                      <td className="px-4 py-4 text-sm text-center font-medium text-gray-900 border-b border-gray-200">
                        {item.quantity_ordered}
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-gray-900 border-b border-gray-200">
                        {item.quantity_received || 0}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-gray-900 border-b border-gray-200">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-4 py-4 text-sm text-right font-medium text-gray-900 border-b border-gray-200">
                        {formatCurrency(item.line_total || (item.quantity_ordered * item.unit_price))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary theo VT-01 */}
          <div className="mb-8 space-y-4">
            <div className="text-sm">
              <span>- Tổng số tiền (viết bằng chữ): <strong>{formatCurrency(importOrder.total_amount || totals.subtotal)}</strong></span>
            </div>
            
            {/* Thông tin tài chính chi tiết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div><span>- Tổng tiền hàng: <strong>{formatCurrency(importOrder.total_amount || 0)}</strong></span></div>
                <div><span>- Thành tiền cuối: <strong>{formatCurrency(importOrder.final_amount || 0)}</strong></span></div>
              </div>
              
              <div className="space-y-2">
                <div><span>- Mẫu phiếu: <strong>{importOrder.form_template || '01-VT'}</strong></span></div>
                <div><span>- Số chứng từ gốc kèm theo: <strong>{importOrder.attached_documents_count || 0}</strong></span></div>
                {importOrder.attached_documents_list && (
                  <div><span>- Danh sách chứng từ: <strong>{importOrder.attached_documents_list}</strong></span></div>
                )}
              </div>
            </div>
            
            {/* Audit information */}
            <div className="border-t pt-4 mt-6 text-xs text-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span>Tạo bởi: <strong>{importOrder.created_by || 'N/A'}</strong></span>
                </div>
                <div>
                  <span>Cập nhật lần cuối: <strong>{importOrder.updated_at ? formatDate(importOrder.updated_at) : 'N/A'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="border-t-2 border-gray-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-16">
                <div>
                  <p className="font-semibold text-gray-900">Người giao hàng</p>
                  <p className="text-sm text-gray-600 mt-1">(Ký, họ tên)</p>
                </div>
                <div className="border-b border-gray-400 w-32 mx-auto"></div>
                <p className="text-sm font-medium text-gray-700">
                  {importOrder.delivery_person || '...'}
                </p>
              </div>
              
              <div className="space-y-16">
                <div>
                  <p className="font-semibold text-gray-900">Người nhận hàng</p>
                  <p className="text-sm text-gray-600 mt-1">(Ký, họ tên)</p>
                </div>
                <div className="border-b border-gray-400 w-32 mx-auto"></div>
                <p className="text-sm font-medium text-gray-700">
                  {importOrder.receiver_name || '...'}
                </p>
              </div>
              
              <div className="space-y-16">
                <div>
                  <p className="font-semibold text-gray-900">Thủ kho</p>
                  <p className="text-sm text-gray-600 mt-1">(Ký, họ tên)</p>
                </div>
                <div className="border-b border-gray-400 w-32 mx-auto"></div>
                <p className="text-sm font-medium text-gray-700">
                  {importOrder.warehouse_keeper || '...'}
                </p>
              </div>

              <div className="space-y-16">
                <div>
                  <p className="font-semibold text-gray-900">Kế toán</p>
                  <p className="text-sm text-gray-600 mt-1">(Ký, họ tên)</p>
                </div>
                <div className="border-b border-gray-400 w-32 mx-auto"></div>
                <p className="text-sm font-medium text-gray-700">
                  {importOrder.accountant || '...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportOrderView; 
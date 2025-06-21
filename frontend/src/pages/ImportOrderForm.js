import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Building,
  Package,
  Calendar,
  User,
  FileText,
  Calculator,
  ArrowLeft,
  Info,
  Receipt,
  DollarSign,
  Truck,
  FileCheck
} from 'lucide-react';
import apiService from '../services/api';

const ImportOrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(id);
  
  // Ref for product section to scroll to
  const productSectionRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const initialFormData = {
    supplier_id: '',
    supplier_name: '',
    warehouse_id: '',
    warehouse_name: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    invoice_number: '',
    delivery_note_number: '',
    reference_document: '',
    reference_document_date: '',
    attached_documents_count: 0,
    attached_documents_list: '',
    receiver_name: '',
    delivery_person: '',
    warehouse_keeper: '',
    accountant: '',
    notes: '',
    items: [{ 
      product_id: '', 
      product_name: '',
      quantity_ordered: '', 
      quantity_received: '', 
      unit_price: '', 
      notes: '' 
    }]
  };
  const [formData, setFormData] = useState(initialFormData);
  
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const steps = [
    { 
      id: 1, 
      title: 'Thông tin phiếu', 
      icon: FileText,
      description: 'Thông tin cơ bản và tài liệu'
    },
    { 
      id: 2, 
      title: 'Danh sách hàng hóa', 
      icon: Package,
      description: 'Sản phẩm và số lượng'
    },
    { 
      id: 3, 
      title: 'Xem lại & Lưu', 
      icon: CheckCircle,
      description: 'Kiểm tra và hoàn tất'
    }
  ];

  useEffect(() => {
    fetchInitialData();
    if (isEditMode) {
      fetchOrderData();
    }
  }, [isEditMode, id]);

  // Auto-scroll to product section if coming from product list
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const scrollToProducts = urlParams.get('scrollToProducts');
    
    if (scrollToProducts === 'true') {
      // Store scroll intent for later use when user navigates to step 2
      sessionStorage.setItem('shouldScrollToProducts', 'true');
      // Remove the query parameter to clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search]);

  // Scroll to product section when step changes to 2
  useEffect(() => {
    if (currentStep === 2 && productSectionRef.current) {
      // Check if we should scroll to products from sessionStorage
      const shouldScroll = sessionStorage.getItem('shouldScrollToProducts');
      if (shouldScroll === 'true') {
        // Small delay to ensure content is rendered
        setTimeout(() => {
          productSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          // Clear the flag after scrolling
          sessionStorage.removeItem('shouldScrollToProducts');
        }, 100);
      }
    }
  }, [currentStep]);

  const fetchInitialData = useCallback(async () => {
    try {
      const [suppliersData, warehousesData, productsData] = await Promise.all([
        apiService.getSuppliers(),
        apiService.getWarehouses(),
        apiService.getProducts()
      ]);
      
      setSuppliers(suppliersData || []);
      setWarehouses(warehousesData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setSuppliers([]);
      setWarehouses([]);
      setProducts([]);
    }
  }, []);

  const fetchOrderData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const orderData = await apiService.getImportOrderById(id);
      
      setFormData({
        supplier_id: orderData.supplier_id || '',
        supplier_name: orderData.supplier_name || '',
        warehouse_id: orderData.warehouse_id || '',
        warehouse_name: orderData.warehouse_name || '',
        order_date: orderData.order_date ? orderData.order_date.split('T')[0] : '',
        delivery_date: orderData.delivery_date ? orderData.delivery_date.split('T')[0] : '',
        invoice_number: orderData.invoice_number || '',
        delivery_note_number: orderData.delivery_note_number || '',
        reference_document: orderData.reference_document || '',
        reference_document_date: orderData.reference_document_date ? orderData.reference_document_date.split('T')[0] : '',
        attached_documents_count: orderData.attached_documents_count || 0,
        attached_documents_list: orderData.attached_documents_list || '',
        receiver_name: orderData.receiver_name || '',
        delivery_person: orderData.delivery_person || '',
        warehouse_keeper: orderData.warehouse_keeper || '',
        accountant: orderData.accountant || '',
        notes: orderData.notes || '',
        items: orderData.items || [{ 
          product_id: '', 
          product_name: '',
          quantity_ordered: '', 
          quantity_received: '', 
          unit_price: '', 
          notes: '' 
        }]
      });
    } catch (error) {
      console.error('Error fetching order data:', error);
      alert('Lỗi tải dữ liệu phiếu nhập');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  // Enhanced validation with all database fields
  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'supplier_id':
      case 'supplier_name':
        if (!formData.supplier_name && !formData.supplier_id) {
          newErrors.supplier_id = 'Vui lòng nhập hoặc chọn nhà cung cấp';
        } else {
          delete newErrors.supplier_id;
        }
        break;
      case 'warehouse_id':
      case 'warehouse_name':
        if (!formData.warehouse_name && !formData.warehouse_id) {
          newErrors.warehouse_id = 'Vui lòng nhập hoặc chọn kho nhận hàng';
        } else {
          delete newErrors.warehouse_id;
        }
        break;
      case 'order_date':
        if (!value) newErrors.order_date = 'Vui lòng nhập ngày lập phiếu';
        else delete newErrors.order_date;
        break;
      case 'delivery_date':
        if (value && formData.order_date && new Date(value) < new Date(formData.order_date)) {
          newErrors.delivery_date = 'Ngày giao hàng không được trước ngày lập phiếu';
        } else delete newErrors.delivery_date;
        break;
      case 'reference_document_date':
        if (value && formData.order_date && new Date(value) > new Date(formData.order_date)) {
          newErrors.reference_document_date = 'Ngày văn bản tham chiếu không được sau ngày lập phiếu';
        } else delete newErrors.reference_document_date;
        break;
      case 'attached_documents_count':
        if (value < 0) newErrors.attached_documents_count = 'Số chứng từ không được âm';
        else delete newErrors.attached_documents_count;
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors, formData.order_date]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? (value === '' ? 0 : Number(value)) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    if (touched[name]) {
      validateField(name, processedValue);
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  }, [validateField]);

  const handleItemChange = useCallback((index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-calculate line total
    if (field === 'quantity_ordered' || field === 'unit_price') {
      const qty = parseFloat(newItems[index].quantity_ordered) || 0;
      const price = parseFloat(newItems[index].unit_price) || 0;
      newItems[index].line_total = (qty * price).toFixed(2);
    }
    
    // Auto-populate product info when product is selected
    if (field === 'product_id') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        newItems[index].unit = selectedProduct.unit || '';
        newItems[index].unit_price = selectedProduct.cost_price || '';
        newItems[index].product_name = selectedProduct.name || '';
        newItems[index].product_code = selectedProduct.code || '';
      }
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  }, [formData.items, products]);

  const addItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        product_id: '', 
        product_name: '',
        quantity_ordered: '', 
        quantity_received: '', 
        unit_price: '', 
        notes: '' 
      }]
    }));
  }, []);

  const removeItem = useCallback((index) => {
    if (formData.items.length > 1) {
    setFormData(prev => ({
      ...prev,
        items: prev.items.filter((_, i) => i !== index)
    }));
    }
  }, [formData.items.length]);

  // Calculate totals
  const totals = useMemo(() => {
    const itemsTotal = formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity_ordered) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + (qty * price);
    }, 0);
    
    return {
      itemsTotal,
    };
  }, [formData.items]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.supplier_id) newErrors.supplier_id = 'Vui lòng chọn nhà cung cấp';
    if (!formData.warehouse_id) newErrors.warehouse_id = 'Vui lòng chọn kho nhận hàng';
    if (!formData.order_date) newErrors.order_date = 'Vui lòng nhập ngày lập phiếu';
    
    // Validate items
    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'Vui lòng thêm ít nhất một sản phẩm';
        } else {
          formData.items.forEach((item, index) => {
        if (!item.product_id) {
          newErrors[`item_${index}_product`] = `Sản phẩm ${index + 1}: Vui lòng chọn sản phẩm`;
        }
        if (!item.quantity_ordered || item.quantity_ordered <= 0) {
          newErrors[`item_${index}_quantity`] = `Sản phẩm ${index + 1}: Số lượng phải lớn hơn 0`;
        }
        if (!item.unit_price || item.unit_price < 0) {
          newErrors[`item_${index}_price`] = `Sản phẩm ${index + 1}: Đơn giá phải >= 0`;
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Vui lòng kiểm tra và sửa các lỗi trong form');
      return;
    }
    
    try {
    setLoading(true);
    
      // Format data for backend using API service helper
      const orderData = apiService.formatOrderDataForBackend(formData);
      
      // Validate data
      const validationErrors = apiService.validateImportOrderData(orderData);
      if (validationErrors.length > 0) {
        alert('Lỗi dữ liệu:\n' + validationErrors.join('\n'));
        return;
      }

      let result;
      if (isEditMode) {
        result = await apiService.updateImportOrder(id, orderData);
      } else {
        result = await apiService.createImportOrder(orderData);
      }
      
      alert(isEditMode ? 'Cập nhật phiếu nhập thành công!' : 'Tạo phiếu nhập thành công!');
      navigate('/import-orders');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Lỗi khi lưu phiếu nhập: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/import-orders');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Form step components  
  const renderInfoStep = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="card card-body">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Thông tin phiếu nhập</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Form Template */}
        <div>
          <label className="form-label">Mẫu số phiếu *</label>
          <select
            name="form_template"
            value={formData.form_template}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`form-input ${errors.form_template ? 'border-red-500' : ''}`}
          >
            <option value="01-VT">01-VT (Phiếu nhập kho)</option>
          </select>
          {errors.form_template && <p className="form-error">{errors.form_template}</p>}
          <p className="text-xs text-gray-500 mt-1">Mẫu phiếu nhập kho theo quy định</p>
        </div>

        {/* Order Date */}
        <div>
          <label className="form-label">Ngày lập phiếu nhập *</label>
          <input
            type="date"
            name="order_date"
            value={formData.order_date}
            onChange={handleInputChange}
            onBlur={handleBlur}
            max={new Date().toISOString().split('T')[0]}
            className={`form-input ${errors.order_date ? 'border-red-500' : ''}`}
          />
          {errors.order_date && <p className="form-error">{errors.order_date}</p>}
          <p className="text-xs text-gray-500 mt-1">Ngày tạo phiếu nhập kho</p>
        </div>

        {/* Supplier */}
        <div>
          <label className="form-label">Nhà cung cấp *</label>
          <input
            type="text"
            name="supplier_name"
            value={formData.supplier_name || ''}
            onChange={(e) => {
              const value = e.target.value;
              setFormData(prev => ({ ...prev, supplier_name: value }));
              
              // Auto-select if exact match found
              const matchedSupplier = suppliers.find(s => 
                s.name === value || `${s.name} (${s.code})` === value
              );
              if (matchedSupplier) {
                setFormData(prev => ({ ...prev, supplier_id: matchedSupplier.id }));
              } else {
                setFormData(prev => ({ ...prev, supplier_id: '' }));
              }
            }}
            onBlur={handleBlur}
            list="suppliers-datalist"
            placeholder="Nhập tên nhà cung cấp hoặc chọn từ danh sách"
            className={`form-input ${errors.supplier_id ? 'border-red-500' : ''}`}
          />
          <datalist id="suppliers-datalist">
            {suppliers.map(supplier => (
              <option key={supplier.id} value={`${supplier.name} (${supplier.code})`}>
                {supplier.name} - {supplier.code}
              </option>
            ))}
          </datalist>
          {errors.supplier_id && <p className="form-error">{errors.supplier_id}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Có {suppliers.length} nhà cung cấp. Nhập để tìm kiếm hoặc chọn từ danh sách.
          </p>
        </div>

        {/* Warehouse */}
        <div>
          <label className="form-label">Kho nhận hàng *</label>
          <input
            type="text"
            name="warehouse_name"
            value={formData.warehouse_name || ''}
            onChange={(e) => {
              const value = e.target.value;
              setFormData(prev => ({ ...prev, warehouse_name: value }));
              
              // Auto-select if exact match found
              const matchedWarehouse = warehouses.find(w => 
                w.name === value || `${w.name} (${w.code})` === value
              );
              if (matchedWarehouse) {
                setFormData(prev => ({ ...prev, warehouse_id: matchedWarehouse.id }));
              } else {
                setFormData(prev => ({ ...prev, warehouse_id: '' }));
              }
            }}
            onBlur={handleBlur}
            list="warehouses-datalist"
            placeholder="Nhập tên kho hoặc chọn từ danh sách"
            className={`form-input ${errors.warehouse_id ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          <datalist id="warehouses-datalist">
            {warehouses.map(warehouse => (
              <option key={warehouse.id} value={`${warehouse.name} (${warehouse.code})`}>
                {warehouse.name} - {warehouse.code}
              </option>
            ))}
          </datalist>
          {errors.warehouse_id && <p className="form-error">{errors.warehouse_id}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Có {warehouses.length} kho. Kho sẽ tiếp nhận hàng hóa.
          </p>
        </div>

        {/* Delivery Date */}
        <div>
          <label className="form-label">Ngày dự kiến giao hàng</label>
          <input
            type="date"
            name="delivery_date"
            value={formData.delivery_date}
            onChange={handleInputChange}
            onBlur={handleBlur}
            min={formData.order_date || new Date().toISOString().split('T')[0]}
            className={`form-input ${errors.delivery_date ? 'border-red-500' : ''}`}
          />
          {errors.delivery_date && <p className="form-error">{errors.delivery_date}</p>}
          <p className="text-xs text-gray-500 mt-1">Ngày nhà cung cấp sẽ giao hàng đến kho</p>
        </div>

        {/* Invoice Number */}
        <div>
          <label className="form-label">Số hóa đơn</label>
          <input
            type="text"
            name="invoice_number"
            value={formData.invoice_number}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Nhập số hóa đơn"
            className="form-input"
          />
        </div>

        {/* Delivery Note Number */}
        <div>
          <label className="form-label">Số phiếu giao hàng</label>
          <input
            type="text"
            name="delivery_note_number"
            value={formData.delivery_note_number}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Nhập số phiếu giao hàng"
            className="form-input"
          />
        </div>

        {/* Reference Document */}
        <div>
          <label className="form-label">Căn cứ theo</label>
          <input
            type="text"
            name="reference_document"
            value={formData.reference_document}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="VD: Hợp đồng mua bán số..."
            className="form-input"
          />
        </div>
        </div>
      </div>

      {/* Personnel Information */}
      <div className="card card-body">
        <div className="flex items-center space-x-3 mb-6">
          <User className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-semibold">Thông tin người liên quan</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="form-label">Người nhận hàng</label>
            <input
              type="text"
              name="receiver_name"
              value={formData.receiver_name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Tên người nhận hàng"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Người giao hàng</label>
            <input
              type="text"
              name="delivery_person"
              value={formData.delivery_person}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Tên người giao hàng"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Thủ kho</label>
            <input
              type="text"
              name="warehouse_keeper"
              value={formData.warehouse_keeper}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Tên thủ kho"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Kế toán</label>
            <input
              type="text"
              name="accountant"
              value={formData.accountant}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Tên kế toán"
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="card card-body">
        <div className="flex items-center space-x-3 mb-6">
          <DollarSign className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-semibold">Thông tin tài chính & ghi chú</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="form-label">Ghi chú</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Ghi chú cho phiếu nhập..."
              rows="3"
              className="form-input"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
                                        className="btn-icon btn-icon-gray"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Chỉnh sửa Phiếu Nhập' : 'Tạo Phiếu Nhập Kho Mới'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Cập nhật thông tin phiếu nhập kho' : 'Tạo phiếu nhập hàng vào kho một cách chuyên nghiệp'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card card-body">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex items-center space-x-3 transition-all duration-300 ${
                    isActive ? 'scale-110' : ''
                  }`}
                >
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${isCompleted 
                      ? 'bg-green-100 border-green-500 text-green-600' 
                      : isActive 
                        ? 'bg-blue-100 border-blue-500 text-blue-600' 
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className={`font-semibold ${
                      isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {step.description}
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: All Information */}
        {currentStep === 1 && renderInfoStep()}

        {/* Step 2: Items List */}
        {currentStep === 2 && (
          <div className="space-y-6" ref={productSectionRef}>
          <div className="card scale-in">
            <div className="card-header">
                <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Package className="w-6 h-6 mr-3 text-purple-600" />
                    Danh Sách Hàng Hóa
              </h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sản phẩm
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {errors.items && (
                  <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <span className="text-red-700">{errors.items}</span>
                      </div>
                )}

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-300 slide-up"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">
                          Sản phẩm #{index + 1}
                        </h4>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="btn-icon btn-icon-red"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                    )}
                  </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                    <label className="form-label">
                            Sản phẩm <span className="text-red-500">*</span>
                    </label>
                          <input
                            type="text"
                            value={item.product_name || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleItemChange(index, 'product_name', value);
                              
                              // Auto-select if exact match found
                              const matchedProduct = products.find(p => 
                                p.name === value || `${p.name} (${p.code})` === value
                              );
                              if (matchedProduct) {
                                handleItemChange(index, 'product_id', matchedProduct.id);
                                handleItemChange(index, 'unit_price', matchedProduct.cost_price || '');
                                handleItemChange(index, 'product_code', matchedProduct.code || '');
                              } else {
                                handleItemChange(index, 'product_id', '');
                              }
                            }}
                            list={`products-datalist-${index}`}
                            placeholder="Nhập tên sản phẩm hoặc chọn từ danh sách"
                            className={`form-input ${errors[`item_${index}_product`] ? 'border-red-500' : ''}`}
                      required
                          />
                          <datalist id={`products-datalist-${index}`}>
                            {products.map(product => (
                              <option key={product.id} value={`${product.name} (${product.code})`}>
                                {product.name} - {product.code} - {formatCurrency(product.cost_price || 0)}
                        </option>
                      ))}
                          </datalist>
                          {errors[`item_${index}_product`] && (
                            <div className="text-red-600 text-sm mt-1">{errors[`item_${index}_product`]}</div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Có {products.length} sản phẩm. Nhập để tìm kiếm hoặc chọn từ danh sách.
                          </p>
                </div>

                        <div>
                          <label className="form-label">Số lượng đặt *</label>
                    <input
                            type="number"
                            value={item.quantity_ordered || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleItemChange(index, 'quantity_ordered', value);
                              // Auto-set received quantity same as ordered
                              if (value && !item.quantity_received) {
                                handleItemChange(index, 'quantity_received', value);
                              }
                            }}
                            className={`form-input ${errors[`item_${index}_quantity`] ? 'border-red-500' : ''}`}
                            min="1"
                            step="1"
                            placeholder="Nhập số lượng (VD: 10)"
                      required
                    />
                          {errors[`item_${index}_quantity`] && (
                            <div className="text-red-600 text-sm mt-1">{errors[`item_${index}_quantity`]}</div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Số lượng cần nhập kho</p>
                      </div>

                        <div>
                          <label className="form-label">Đơn giá (VND) *</label>
                          <input
                            type="number"
                            value={item.unit_price || ''}
                            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                            className={`form-input ${errors[`item_${index}_price`] ? 'border-red-500' : ''}`}
                            min="0"
                            step="1000"
                            placeholder="Nhập đơn giá (VD: 25000000)"
                            required
                          />
                          {errors[`item_${index}_price`] && (
                            <div className="text-red-600 text-sm mt-1">{errors[`item_${index}_price`]}</div>
                    )}
                  </div>

                        <div>
                          <label className="form-label">Thành tiền</label>
                          <div className="form-input bg-gray-50 font-semibold text-blue-600">
                            {formatCurrency(parseFloat(item.line_total) || ((item.quantity_ordered || 0) * (item.unit_price || 0)))}
                          </div>
                        </div>

                        <div className="lg:col-span-5">
                          <label className="form-label">Ghi chú</label>
                    <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                            className="form-input"
                            placeholder="Ghi chú cho sản phẩm này..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Items Summary */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-green-600" />
                  Tổng Kết
                </h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{formData.items.length}</div>
                    <div className="text-sm text-gray-600">Loại SP</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formData.items.reduce((sum, item) => sum + (parseInt(item.quantity_ordered) || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Tổng SL</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(totals.itemsTotal)}</div>
                    <div className="text-sm text-gray-600">Tổng tiền</div>
                  </div>
                </div>
              </div>
            </div>
                      </div>
                    )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="card scale-in">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                Xem lại thông tin
              </h2>
            </div>
            <div className="card-body space-y-8">
              {/* Summary Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin chung</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mẫu số phiếu:</span>
                        <span className="font-medium">{formData.form_template}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày lập phiếu:</span>
                        <span className="font-medium">{formData.order_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nhà cung cấp:</span>
                        <span className="font-medium">
                          {suppliers.find(s => s.id === formData.supplier_id)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kho nhận:</span>
                        <span className="font-medium">
                          {warehouses.find(w => w.id === formData.warehouse_id)?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                      <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin tài chính</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-600">Tổng tiền hàng:</span>
                        <span className="text-blue-600">{formatCurrency(totals.itemsTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin người liên quan</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Người nhận:</span>
                        <span className="font-medium">{formData.receiver_name || 'Chưa có'}</span>
              </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Người giao:</span>
                        <span className="font-medium">{formData.delivery_person || 'Chưa có'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thủ kho:</span>
                        <span className="font-medium">{formData.warehouse_keeper || 'Chưa có'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kế toán:</span>
                        <span className="font-medium">{formData.accountant || 'Chưa có'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Thống kê sản phẩm</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số loại sản phẩm:</span>
                        <span className="font-medium">{formData.items.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng số lượng:</span>
                        <span className="font-medium">
                          {formData.items.reduce((sum, item) => sum + (parseInt(item.quantity_ordered) || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Danh sách sản phẩm</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SL đặt</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, index) => {
                        const product = products.find(p => p.id === item.product_id);
                        return (
                          <tr key={index}>
                            <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {product ? `${product.name} (${product.code})` : 'Chưa chọn'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">{item.quantity_ordered}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                              {formatCurrency((item.quantity_ordered || 0) * (item.unit_price || 0))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Delivery Information */}
        {currentStep === 2 && (
          <div className="card scale-in">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-6 h-6 mr-3 text-green-600" />
                Chi Tiết Giao Nhận
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Thông tin chứng từ
                  </h3>
                  
                  <div className="form-group">
                    <label className="form-label">Số hóa đơn</label>
                    <input
                      type="text"
                      name="invoice_number"
                      value={formData.invoice_number}
                      onChange={handleInputChange}
                      placeholder="VD: INV-2024-001"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số phiếu giao hàng</label>
                    <input
                      type="text"
                      name="delivery_note_number"
                      value={formData.delivery_note_number}
                      onChange={handleInputChange}
                      placeholder="VD: DN-2024-001"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Thông tin nhân sự
                  </h3>
                  
                  <div className="form-group">
                    <label className="form-label">Người nhận hàng</label>
                    <input
                      type="text"
                      name="receiver_name"
                      value={formData.receiver_name}
                      onChange={handleInputChange}
                      placeholder="Họ và tên người nhận"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Người giao hàng</label>
                    <input
                      type="text"
                      name="delivery_person"
                      value={formData.delivery_person}
                      onChange={handleInputChange}
                      placeholder="Họ và tên người giao"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thủ kho</label>
                    <input
                      type="text"
                      name="warehouse_keeper"
                      value={formData.warehouse_keeper}
                      onChange={handleInputChange}
                      placeholder="Họ và tên thủ kho"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kế toán</label>
                    <input
                      type="text"
                      name="accountant"
                      value={formData.accountant}
                      onChange={handleInputChange}
                      placeholder="Họ và tên kế toán"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Ghi chú thêm về phiếu nhập..."
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Items */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="card scale-in">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Package className="w-6 h-6 mr-3 text-purple-600" />
                    Danh Sách Hàng Hóa
                  </h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sản phẩm
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {errors.items && (
                  <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <span className="text-red-700">{errors.items}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-300 slide-up"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">
                          Sản phẩm #{index + 1}
                        </h4>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                                                          className="btn-icon btn-icon-red"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2">
                          <label className="form-label">
                            Sản phẩm <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={item.product_id}
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                            className={`form-select ${errors[`item_${index}_product`] ? 'border-red-500' : ''}`}
                            required
                          >
                            <option value="">Chọn sản phẩm</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.code})
                              </option>
                            ))}
                          </select>
                          {errors[`item_${index}_product`] && (
                            <div className="text-red-600 text-sm mt-1">{errors[`item_${index}_product`]}</div>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Đơn vị tính</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            placeholder="VD: cái, kg, lít"
                            className="form-input"
                          />
                        </div>

                        <div>
                          <label className="form-label">
                            Số lượng <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={item.quantity_ordered}
                            onChange={(e) => handleItemChange(index, 'quantity_ordered', e.target.value)}
                            min="1"
                            className={`form-input ${errors[`item_${index}_quantity`] ? 'border-red-500' : ''}`}
                            required
                          />
                          {errors[`item_${index}_quantity`] && (
                            <div className="text-red-600 text-sm mt-1">{errors[`item_${index}_quantity`]}</div>
                          )}
                        </div>

                        <div>
                          <label className="form-label">
                            Đơn giá <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                            min="0"
                            step="0.01"
                            className={`form-input ${errors[`item_${index}_price`] ? 'border-red-500' : ''}`}
                            required
                          />
                          {errors[`item_${index}_price`] && (
                            <div className="text-red-600 text-sm mt-1">{errors[`item_${index}_price`]}</div>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Thành tiền</label>
                          <div className="form-input bg-gray-50 font-semibold text-blue-600">
                            {formatCurrency(parseFloat(item.line_total) || 0)}
                          </div>
                        </div>

                        <div className="lg:col-span-3">
                          <label className="form-label">Ghi chú</label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                            placeholder="Ghi chú về sản phẩm (màu sắc, kích thước, ...)"
                            className="form-input"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calculator className="w-8 h-8 text-blue-600 mr-4" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Tổng Kết</h3>
                      <p className="text-sm text-gray-600">Thông tin tổng quan về đơn hàng</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{formData.items.length}</div>
                        <div className="text-sm text-gray-600">Loại SP</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{totals.itemsTotal}</div>
                        <div className="text-sm text-gray-600">Tổng SL</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{formatCurrency(totals.itemsTotal)}</div>
                        <div className="text-sm text-gray-600">Tổng tiền</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="card scale-in">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                Xem Lại & Hoàn Tất
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nhà cung cấp:</span>
                      <span className="font-medium">
                        {suppliers.find(s => s.id === formData.supplier_id)?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kho nhận hàng:</span>
                      <span className="font-medium">
                        {warehouses.find(w => w.id === formData.warehouse_id)?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày lập phiếu:</span>
                      <span className="font-medium">{formData.order_date}</span>
                    </div>
                    {formData.delivery_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày giao hàng:</span>
                        <span className="font-medium">{formData.delivery_date}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Thống kê đơn hàng</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số loại sản phẩm:</span>
                      <span className="font-medium">{formData.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng số lượng:</span>
                      <span className="font-medium">{totals.itemsTotal}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-900 font-medium">Tổng giá trị:</span>
                      <span className="font-bold text-lg text-blue-600">{formatCurrency(totals.itemsTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-900">Sẵn sàng tạo phiếu nhập</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Tất cả thông tin đã được kiểm tra và hợp lệ. Nhấn "Tạo phiếu nhập" để hoàn tất.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between p-6 bg-white rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(currentStep - 1, 1))}
            disabled={currentStep === 1}
            className={`btn btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-500">
              Bước {currentStep} / {steps.length}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              <X className="w-4 h-4 mr-2" />
              Hủy bỏ
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length))}
                className="btn btn-primary"
              >
                Tiếp theo
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner w-4 h-4 mr-2" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Tạo phiếu nhập
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ImportOrderForm; 
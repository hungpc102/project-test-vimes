import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Warehouse, 
  FileText, 
  Package, 
  BarChart3, 
  Bell, 
  Settings, 
  User,
  Menu,
  X,
  ChevronRight,
  Plus
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { 
      name: 'Danh sách phiếu nhập', 
      href: '/import-orders', 
      icon: FileText,
      description: 'Quản lý phiếu nhập kho'
    },
    { 
      name: 'Tạo phiếu nhập', 
      href: '/import-orders/new?scrollToProducts=true', 
      icon: Plus,
      description: 'Tạo phiếu nhập mới'
    },

  ];

  const isActive = (href) => {
    return location.pathname.startsWith(href) || (href === '/import-orders' && location.pathname === '/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-25 lg:hidden no-print"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        sidebar flex flex-col no-print
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600/95 to-blue-700/95 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Warehouse className="w-10 h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-wide">VIMES</span>
              <p className="text-xs text-blue-100 font-medium">Warehouse Management</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-blue-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  sidebar-item group flex items-center px-4 py-4 text-sm font-medium transition-all duration-300
                  ${active 
                    ? 'active text-white bg-white/15 border border-white/20' 
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Icon className={`mr-4 flex-shrink-0 h-6 w-6 transition-transform duration-300 group-hover:scale-110`} />
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs opacity-75 mt-1">{item.description}</div>
                </div>
                {active && (
                  <ChevronRight className="w-5 h-5 text-blue-200" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="flex-shrink-0 p-4 border-t border-blue-600/30">
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                Nguyễn Văn An
              </p>
              <p className="text-xs text-blue-100 truncate">
                Nhân viên kho
              </p>
            </div>
            <Settings className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="header no-print">
          <div className="px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Hệ Thống Quản Lý Kho
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Quản lý hiệu quả - Vận hành thông minh
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Date Display */}
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                  <div className="text-sm text-gray-700 font-medium">
                    {new Date().toLocaleDateString('vi-VN', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:text-gray-900 hover:bg-white transition-all shadow-sm">
                    <Bell className="w-5 h-5" />
                  </button>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm rounded-xl border border-green-200/50 shadow-sm">
                    <div className="text-xs text-green-700 font-medium">Phiếu hôm nay</div>
                    <div className="text-lg font-bold text-green-800">12</div>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur-sm rounded-xl border border-purple-200/50 shadow-sm">
                    <div className="text-xs text-purple-700 font-medium">Chờ xử lý</div>
                    <div className="text-lg font-bold text-purple-800">5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50/50 to-blue-50/50">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200/50 no-print">
          <div className="px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>© 2024 VIMES Warehouse Management</span>
                <span className="text-gray-400">|</span>
                <span>Version 1.0.0</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Hỗ trợ: (028) 1234-5678</span>
                <span className="text-gray-400">|</span>
                <span>Email: support@vimes.vn</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout; 
import React from 'react';
import { Loader2, Package } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Đang tải...', 
  fullScreen = false,
  variant = 'default'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  if (variant === 'minimal') {
    return (
      <div className={containerClasses}>
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative inline-block">
          {/* Outer spinning ring */}
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          
          {/* Inner icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        
        {message && (
          <div className="mt-4 space-y-2">
            <p className="text-gray-700 font-medium">{message}</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton loader for list items
export const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Page loading overlay
export const PageLoader = ({ message = 'Đang tải trang...' }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-2">VIMES</h2>
      <p className="text-gray-600">{message}</p>
      
      <div className="flex justify-center space-x-1 mt-4">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

export default LoadingSpinner; 
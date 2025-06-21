import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Đã xảy ra lỗi!
              </h1>
              
              <p className="text-gray-600 mb-6">
                Ứng dụng gặp sự cố không mong muốn. Chúng tôi đã ghi nhận lỗi và sẽ khắc phục sớm nhất.
              </p>

              {/* Error details for development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-6 p-4 bg-gray-50 rounded-lg">
                  <summary className="font-medium text-gray-700 cursor-pointer">
                    Chi tiết lỗi (Development)
                  </summary>
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium">Error:</p>
                    <code className="block bg-red-50 p-2 rounded text-red-700 mt-1">
                      {this.state.error.toString()}
                    </code>
                    
                    {this.state.errorInfo && (
                      <>
                        <p className="font-medium mt-3">Stack trace:</p>
                        <pre className="bg-red-50 p-2 rounded text-xs text-red-700 mt-1 overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRefresh}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tải lại trang
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Về trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
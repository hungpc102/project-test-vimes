import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ImportOrderForm from './pages/ImportOrderForm';
import ImportOrderList from './pages/ImportOrderList';
import ImportOrderView from './pages/ImportOrderView';


import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="min-h-screen bg-gray-50">
            <Layout>
              <Routes>
                <Route path="/" element={<ImportOrderList />} />
                <Route path="/import-orders" element={<ImportOrderList />} />
                <Route path="/import-orders/new" element={<ImportOrderForm />} />
                <Route path="/import-orders/:id" element={<ImportOrderView />} />
                <Route path="/import-orders/:id/edit" element={<ImportOrderForm />} />
    
              </Routes>
            </Layout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  fontSize: '14px',
                  borderRadius: '8px',
                  padding: '12px 16px',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#065f46',
                    color: '#ecfdf5',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#991b1b',
                    color: '#fef2f2',
                  },
                },
                loading: {
                  duration: Infinity,
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#1e40af',
                    color: '#eff6ff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App; 
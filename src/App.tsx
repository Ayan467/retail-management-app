import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import DashboardLayout from '@/components/layouts/DashboardLayout';

import routes from './routes';

import { AuthProvider } from '@/contexts/AuthContext';
import { RouteGuard } from '@/components/common/RouteGuard';
import { Toaster } from '@/components/ui/toaster';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <RouteGuard>
          <IntersectObserver />
          <Routes>
            {routes.map((route, index) => {
              // Login page doesn't need layout
              if (route.path === '/login' || route.path === '/404') {
                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={route.element}
                  />
                );
              }
              
              // All other pages use DashboardLayout
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={<DashboardLayout>{route.element}</DashboardLayout>}
                />
              );
            })}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
        </RouteGuard>
      </AuthProvider>
    </Router>
  );
};

export default App;

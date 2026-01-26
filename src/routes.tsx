import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import POSPage from './pages/POSPage';
import SuppliersPage from './pages/SuppliersPage';
import EmployeesPage from './pages/EmployeesPage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <DashboardPage />
  },
  {
    name: 'Products',
    path: '/products',
    element: <ProductsPage />
  },
  {
    name: 'Inventory',
    path: '/inventory',
    element: <InventoryPage />
  },
  {
    name: 'POS',
    path: '/pos',
    element: <POSPage />
  },
  {
    name: 'Suppliers',
    path: '/suppliers',
    element: <SuppliersPage />
  },
  {
    name: 'Employees',
    path: '/employees',
    element: <EmployeesPage />
  },
  {
    name: 'Reports',
    path: '/reports',
    element: <ReportsPage />
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <AdminPage />
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false
  },
  {
    name: 'Not Found',
    path: '/404',
    element: <NotFound />,
    visible: false
  }
];

export default routes;

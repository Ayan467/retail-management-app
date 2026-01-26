// User and Authentication Types
export type UserRole = 'admin' | 'cashier' | 'inventory_manager' | 'supplier';

export interface Profile {
  id: string;
  email: string | null;
  username: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Product and Inventory Types
export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category_id: string | null;
  description: string | null;
  price: number;
  cost_price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  reorder_level: number;
  expiry_date: string | null;
  batch_number: string | null;
  last_updated: string;
  product?: Product;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface SupplierOrder {
  id: string;
  supplier_id: string;
  order_date: string;
  delivery_date: string | null;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  supplier?: Supplier;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

// Sales Types
export type PaymentMethod = 'cash' | 'card' | 'mobile';

export interface Sale {
  id: string;
  cashier_id: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  payment_method: PaymentMethod;
  transaction_date: string;
  invoice_number: string;
  cashier?: Profile;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

// Employee Types
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave';

export interface Employee {
  id: string;
  profile_id: string;
  position: string | null;
  hire_date: string;
  salary: number | null;
  status: EmployeeStatus;
  created_at: string;
  profile?: Profile;
}

// Dashboard and Analytics Types
export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  lowStockItems: number;
  expiringItems: number;
  totalProducts: number;
  totalRevenue: number;
}

export interface SalesAnalytics {
  date: string;
  sales: number;
  transactions: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

// Alert Types
export interface StockAlert {
  product_id: string;
  product_name: string;
  barcode: string;
  current_quantity: number;
  reorder_level: number;
  status: 'low' | 'critical';
}

export interface ExpiryAlert {
  product_id: string;
  product_name: string;
  barcode: string;
  expiry_date: string;
  days_until_expiry: number;
  quantity: number;
  batch_number: string | null;
}

// POS Types
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
}

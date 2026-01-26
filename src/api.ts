import { supabase } from './supabase';
import type {
  Profile,
  Category,
  Product,
  Inventory,
  Supplier,
  SupplierOrder,
  OrderItem,
  Sale,
  SaleItem,
  Employee,
  DashboardStats,
  SalesAnalytics,
  TopProduct,
  StockAlert,
  ExpiryAlert,
  CheckoutData,
} from '@/types/types';

// Profile APIs
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const getAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Category APIs
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Product APIs
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('barcode', barcode)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select('*, category:categories(*)')
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Inventory APIs
export const getInventory = async (): Promise<Inventory[]> => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, product:products(*, category:categories(*))')
    .order('last_updated', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getInventoryByProduct = async (productId: string): Promise<Inventory[]> => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, product:products(*, category:categories(*))')
    .eq('product_id', productId)
    .order('expiry_date');
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const updateInventory = async (id: string, updates: Partial<Inventory>): Promise<Inventory> => {
  const { data, error } = await supabase
    .from('inventory')
    .update({ ...updates, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select('*, product:products(*, category:categories(*))')
    .single();
  
  if (error) throw error;
  return data;
};

export const createInventory = async (inventory: Omit<Inventory, 'id' | 'last_updated' | 'product'>): Promise<Inventory> => {
  const { data, error } = await supabase
    .from('inventory')
    .insert(inventory)
    .select('*, product:products(*, category:categories(*))')
    .single();
  
  if (error) throw error;
  return data;
};

export const adjustInventoryQuantity = async (productId: string, quantityChange: number): Promise<void> => {
  // Get current inventory
  const { data: inventory, error: fetchError } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', productId)
    .order('expiry_date')
    .limit(1)
    .maybeSingle();
  
  if (fetchError) throw fetchError;
  if (!inventory) throw new Error('Inventory not found');
  
  const newQuantity = inventory.quantity + quantityChange;
  if (newQuantity < 0) throw new Error('Insufficient inventory');
  
  const { error: updateError } = await supabase
    .from('inventory')
    .update({ quantity: newQuantity, last_updated: new Date().toISOString() })
    .eq('id', inventory.id);
  
  if (updateError) throw updateError;
};

// Supplier APIs
export const getSuppliers = async (): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> => {
  const { data, error } = await supabase
    .from('suppliers')
    .insert(supplier)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSupplier = async (id: string, updates: Partial<Supplier>): Promise<Supplier> => {
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Supplier Order APIs
export const getSupplierOrders = async (): Promise<SupplierOrder[]> => {
  const { data, error } = await supabase
    .from('supplier_orders')
    .select('*, supplier:suppliers(*)')
    .order('order_date', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getSupplierOrderById = async (id: string): Promise<SupplierOrder | null> => {
  const { data, error } = await supabase
    .from('supplier_orders')
    .select('*, supplier:suppliers(*)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const createSupplierOrder = async (order: Omit<SupplierOrder, 'id' | 'created_at' | 'supplier'>): Promise<SupplierOrder> => {
  const { data, error } = await supabase
    .from('supplier_orders')
    .insert(order)
    .select('*, supplier:suppliers(*)')
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSupplierOrder = async (id: string, updates: Partial<SupplierOrder>): Promise<SupplierOrder> => {
  const { data, error } = await supabase
    .from('supplier_orders')
    .update(updates)
    .eq('id', id)
    .select('*, supplier:suppliers(*)')
    .single();
  
  if (error) throw error;
  return data;
};

// Order Item APIs
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*, product:products(*, category:categories(*))')
    .eq('order_id', orderId);
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createOrderItem = async (item: Omit<OrderItem, 'id' | 'subtotal' | 'product'>): Promise<OrderItem> => {
  const { data, error } = await supabase
    .from('order_items')
    .insert(item)
    .select('*, product:products(*, category:categories(*))')
    .single();
  
  if (error) throw error;
  return data;
};

// Sales APIs
export const getSales = async (limit?: number): Promise<Sale[]> => {
  let query = supabase
    .from('sales')
    .select('*, cashier:profiles(username, full_name)')
    .order('transaction_date', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getSaleById = async (id: string): Promise<Sale | null> => {
  const { data, error } = await supabase
    .from('sales')
    .select('*, cashier:profiles(username, full_name)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const createSale = async (checkoutData: CheckoutData, cashierId: string): Promise<Sale> => {
  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Create sale
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      cashier_id: cashierId,
      total_amount: checkoutData.total,
      tax_amount: checkoutData.tax,
      discount_amount: checkoutData.discount,
      payment_method: checkoutData.payment_method,
      invoice_number: invoiceNumber,
    })
    .select('*, cashier:profiles(username, full_name)')
    .single();
  
  if (saleError) throw saleError;
  
  // Create sale items and update inventory
  for (const item of checkoutData.items) {
    const { error: itemError } = await supabase
      .from('sale_items')
      .insert({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      });
    
    if (itemError) throw itemError;
    
    // Update inventory
    await adjustInventoryQuantity(item.product.id, -item.quantity);
  }
  
  return sale;
};

// Sale Items APIs
export const getSaleItems = async (saleId: string): Promise<SaleItem[]> => {
  const { data, error } = await supabase
    .from('sale_items')
    .select('*, product:products(*, category:categories(*))')
    .eq('sale_id', saleId);
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

// Employee APIs
export const getEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*, profile:profiles(username, full_name, email, phone, role)')
    .order('hire_date', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createEmployee = async (employee: Omit<Employee, 'id' | 'created_at' | 'profile'>): Promise<Employee> => {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select('*, profile:profiles(username, full_name, email, phone, role)')
    .single();
  
  if (error) throw error;
  return data;
};

export const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<Employee> => {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select('*, profile:profiles(username, full_name, email, phone, role)')
    .single();
  
  if (error) throw error;
  return data;
};

// Dashboard and Analytics APIs
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const today = new Date().toISOString().split('T')[0];
  
  // Today's sales
  const { data: todaySalesData } = await supabase
    .from('sales')
    .select('total_amount')
    .gte('transaction_date', today);
  
  const todaySales = todaySalesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
  const todayTransactions = todaySalesData?.length || 0;
  
  // Low stock items
  const { data: lowStockData } = await supabase
    .from('inventory')
    .select('quantity, reorder_level')
    .lt('quantity', supabase.rpc('inventory.reorder_level'));
  
  const { count: lowStockCount } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .filter('quantity', 'lt', 'reorder_level');
  
  // Expiring items (within 30 days)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  
  const { count: expiringCount } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .not('expiry_date', 'is', null)
    .lte('expiry_date', expiryDate.toISOString().split('T')[0]);
  
  // Total products
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  // Total revenue (all time)
  const { data: allSalesData } = await supabase
    .from('sales')
    .select('total_amount');
  
  const totalRevenue = allSalesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
  
  return {
    todaySales,
    todayTransactions,
    lowStockItems: lowStockCount || 0,
    expiringItems: expiringCount || 0,
    totalProducts: totalProducts || 0,
    totalRevenue,
  };
};

export const getSalesAnalytics = async (days: number = 7): Promise<SalesAnalytics[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('sales')
    .select('transaction_date, total_amount')
    .gte('transaction_date', startDate.toISOString())
    .order('transaction_date');
  
  if (error) throw error;
  
  // Group by date
  const analytics: { [key: string]: { sales: number; transactions: number } } = {};
  
  data?.forEach((sale) => {
    const date = sale.transaction_date.split('T')[0];
    if (!analytics[date]) {
      analytics[date] = { sales: 0, transactions: 0 };
    }
    analytics[date].sales += Number(sale.total_amount);
    analytics[date].transactions += 1;
  });
  
  return Object.entries(analytics).map(([date, stats]) => ({
    date,
    sales: stats.sales,
    transactions: stats.transactions,
  }));
};

export const getTopProducts = async (limit: number = 10): Promise<TopProduct[]> => {
  const { data, error } = await supabase
    .from('sale_items')
    .select('product_id, quantity, subtotal, product:products(name)')
    .order('quantity', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  // Aggregate by product
  const productMap: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  
  data?.forEach((item: any) => {
    if (!productMap[item.product_id]) {
      productMap[item.product_id] = {
        name: item.product?.name || 'Unknown',
        quantity: 0,
        revenue: 0,
      };
    }
    productMap[item.product_id].quantity += item.quantity;
    productMap[item.product_id].revenue += Number(item.subtotal);
  });
  
  return Object.entries(productMap)
    .map(([id, data]) => ({
      product_id: id,
      product_name: data.name,
      total_quantity: data.quantity,
      total_revenue: data.revenue,
    }))
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, limit);
};

export const getStockAlerts = async (): Promise<StockAlert[]> => {
  const { data, error } = await supabase
    .from('inventory')
    .select('product_id, quantity, reorder_level, product:products(name, barcode)')
    .order('quantity');
  
  if (error) throw error;
  
  return (data || [])
    .filter((item: any) => item.quantity <= item.reorder_level)
    .map((item: any) => ({
      product_id: item.product_id,
      product_name: item.product?.name || 'Unknown',
      barcode: item.product?.barcode || '',
      current_quantity: item.quantity,
      reorder_level: item.reorder_level,
      status: item.quantity === 0 ? 'critical' : item.quantity <= item.reorder_level / 2 ? 'critical' : 'low',
    }));
};

export const getExpiryAlerts = async (daysThreshold: number = 30): Promise<ExpiryAlert[]> => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysThreshold);
  
  const { data, error } = await supabase
    .from('inventory')
    .select('product_id, expiry_date, quantity, batch_number, product:products(name, barcode)')
    .not('expiry_date', 'is', null)
    .lte('expiry_date', futureDate.toISOString().split('T')[0])
    .order('expiry_date');
  
  if (error) throw error;
  
  return (data || []).map((item: any) => {
    const expiryDate = new Date(item.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      product_id: item.product_id,
      product_name: item.product?.name || 'Unknown',
      barcode: item.product?.barcode || '',
      expiry_date: item.expiry_date,
      days_until_expiry: daysUntilExpiry,
      quantity: item.quantity,
      batch_number: item.batch_number,
    };
  });
};

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Package,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import {
  getDashboardStats,
  getSalesAnalytics,
  getTopProducts,
  getStockAlerts,
  getExpiryAlerts,
} from '@/db/api';
import type { DashboardStats, SalesAnalytics, TopProduct, StockAlert, ExpiryAlert } from '@/types/types';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesAnalytics[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, salesAnalytics, products, stock, expiry] = await Promise.all([
        getDashboardStats(),
        getSalesAnalytics(7),
        getTopProducts(5),
        getStockAlerts(),
        getExpiryAlerts(30),
      ]);
      
      setStats(statsData);
      setSalesData(salesAnalytics);
      setTopProducts(products);
      setStockAlerts(stock);
      setExpiryAlerts(expiry);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24 bg-muted" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Sales",
      value: `$${stats?.todaySales.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      title: 'Transactions',
      value: stats?.todayTransactions || 0,
      icon: ShoppingCart,
      color: 'text-secondary',
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      color: 'text-warning',
      link: '/inventory',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-info',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const CardWrapper = stat.link ? Link : 'div';
          
          return (
            <CardWrapper
              key={stat.title}
              to={stat.link || '#'}
              className={stat.link ? 'block' : ''}
            >
              <Card className={stat.link ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </CardWrapper>
          );
        })}
      </div>

      {/* Alerts Section */}
      {(stockAlerts.length > 0 || expiryAlerts.length > 0) && (
        <div className="grid gap-4 xl:grid-cols-2">
          {/* Low Stock Alerts */}
          {stockAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stockAlerts.slice(0, 5).map((alert) => (
                  <Alert key={alert.product_id} variant={alert.status === 'critical' ? 'destructive' : 'default'}>
                    <AlertTitle className="text-sm font-medium">
                      {alert.product_name}
                    </AlertTitle>
                    <AlertDescription className="text-xs">
                      Current: {alert.current_quantity} | Reorder Level: {alert.reorder_level}
                    </AlertDescription>
                  </Alert>
                ))}
                {stockAlerts.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/inventory">View All ({stockAlerts.length})</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Expiry Alerts */}
          {expiryAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-destructive" />
                  Expiring Soon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {expiryAlerts.slice(0, 5).map((alert) => (
                  <Alert key={`${alert.product_id}-${alert.batch_number}`}>
                    <AlertTitle className="text-sm font-medium">
                      {alert.product_name}
                    </AlertTitle>
                    <AlertDescription className="text-xs">
                      Expires in {alert.days_until_expiry} days | Qty: {alert.quantity}
                      {alert.batch_number && ` | Batch: ${alert.batch_number}`}
                    </AlertDescription>
                  </Alert>
                ))}
                {expiryAlerts.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/inventory">View All ({expiryAlerts.length})</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.product_id} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.total_quantity} units sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary">
                      ${product.total_revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No sales data available yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 xl:grid-cols-4">
            <Button asChild>
              <Link to="/pos">New Sale</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/products">Add Product</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/inventory">Update Inventory</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/reports">View Reports</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

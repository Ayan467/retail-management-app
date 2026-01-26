import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, DollarSign, TrendingUp, Package } from 'lucide-react';
import { getSales, getSalesAnalytics, getTopProducts } from '@/db/api';
import type { Sale, SalesAnalytics, TopProduct } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [salesData, analyticsData, productsData] = await Promise.all([
        getSales(50),
        getSalesAnalytics(parseInt(period)),
        getTopProducts(10),
      ]);
      setSales(salesData);
      setSalesAnalytics(analyticsData);
      setTopProducts(productsData);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const totalTransactions = sales.length;
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Last {period} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Transactions
                </CardTitle>
                <BarChart3 className="h-5 w-5 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  Last {period} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Transaction
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${averageTransaction.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Per transaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Units Sold</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product, index) => (
                        <TableRow key={product.product_id}>
                          <TableCell>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{product.product_name}</TableCell>
                          <TableCell>{product.total_quantity}</TableCell>
                          <TableCell className="font-semibold text-secondary">
                            ${product.total_revenue.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No sales data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Cashier</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.slice(0, 20).map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-mono text-sm">
                            {sale.invoice_number}
                          </TableCell>
                          <TableCell>
                            {(sale.cashier as any)?.username || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {new Date(sale.transaction_date).toLocaleString()}
                          </TableCell>
                          <TableCell className="capitalize">
                            {sale.payment_method}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${Number(sale.total_amount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No transactions found
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

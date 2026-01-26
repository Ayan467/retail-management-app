import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Edit, AlertTriangle, Calendar, Warehouse } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getInventory, updateInventory } from '@/db/api';
import type { Inventory } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const inventorySchema = z.object({
  quantity: z.string().min(0, 'Quantity must be positive'),
  reorder_level: z.string().min(0, 'Reorder level must be positive'),
  expiry_date: z.string().optional(),
  batch_number: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const { toast } = useToast();

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      quantity: '',
      reorder_level: '',
      expiry_date: '',
      batch_number: '',
    },
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setInventory(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: InventoryFormData) => {
    if (!editingInventory) return;

    try {
      await updateInventory(editingInventory.id, {
        quantity: parseInt(data.quantity),
        reorder_level: parseInt(data.reorder_level),
        expiry_date: data.expiry_date || null,
        batch_number: data.batch_number || null,
      });

      toast({
        title: 'Success',
        description: 'Inventory updated successfully',
      });

      setDialogOpen(false);
      setEditingInventory(null);
      form.reset();
      loadInventory();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update inventory',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: Inventory) => {
    setEditingInventory(item);
    form.reset({
      quantity: item.quantity.toString(),
      reorder_level: item.reorder_level.toString(),
      expiry_date: item.expiry_date || '',
      batch_number: item.batch_number || '',
    });
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingInventory(null);
      form.reset();
    }
  };

  const filteredInventory = inventory.filter(
    (item) =>
      item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.barcode.includes(searchTerm) ||
      item.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = filteredInventory.filter(item => item.quantity <= item.reorder_level);
  const expiringItems = filteredInventory.filter(item => {
    if (!item.expiry_date) return false;
    const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
      </div>

      {/* Alert Summary */}
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="grid gap-4 xl:grid-cols-2">
          {lowStockItems.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Low Stock Alert</AlertTitle>
              <AlertDescription>
                {lowStockItems.length} item(s) are below reorder level
              </AlertDescription>
            </Alert>
          )}
          {expiringItems.length > 0 && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertTitle>Expiry Alert</AlertTitle>
              <AlertDescription>
                {expiringItems.length} item(s) expiring within 30 days
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, barcode, or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
          ) : filteredInventory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const isLowStock = item.quantity <= item.reorder_level;
                    const isCritical = item.quantity === 0;
                    const daysUntilExpiry = item.expiry_date 
                      ? Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product?.name || 'Unknown'}</TableCell>
                        <TableCell className="font-mono">{item.product?.barcode || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={isCritical ? 'text-destructive font-bold' : ''}>
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell>{item.reorder_level}</TableCell>
                        <TableCell>
                          {isCritical ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="destructive">Low Stock</Badge>
                          ) : (
                            <Badge variant="default">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.expiry_date ? (
                            <div className="flex items-center gap-2">
                              <span className={isExpiringSoon ? 'text-destructive font-medium' : ''}>
                                {new Date(item.expiry_date).toLocaleDateString()}
                              </span>
                              {isExpiringSoon && (
                                <Badge variant="destructive" className="text-xs">
                                  {daysUntilExpiry}d
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{item.batch_number || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Warehouse className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No inventory found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search' : 'Inventory will appear here'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
            <DialogDescription>
              Update stock levels and details for {editingInventory?.product?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reorder_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Level</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batch_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter batch number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Inventory</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

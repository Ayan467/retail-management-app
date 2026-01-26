import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Minus, Plus, Trash2, ShoppingCart, Barcode, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { getProductByBarcode } from '@/db/api';
import { createSale } from '@/db/api';
import type { Product, CartItem, PaymentMethod } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discount, setDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    // Focus barcode input on mount
    barcodeInputRef.current?.focus();
  }, []);

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    try {
      const product = await getProductByBarcode(barcode.trim());
      
      if (!product) {
        toast({
          title: 'Product Not Found',
          description: `No product found with barcode: ${barcode}`,
          variant: 'destructive',
        });
        setBarcode('');
        return;
      }

      addToCart(product);
      setBarcode('');
      barcodeInputRef.current?.focus();
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch product',
        variant: 'destructive',
      });
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.price }
            : item
        );
      }
      
      return [...prevCart, { product, quantity: 1, subtotal: product.price }];
    });

    toast({
      title: 'Added to Cart',
      description: `${product.name} added to cart`,
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) return null;
            return {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.product.price,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxRate = 0.08; // 8% tax
    const taxAmount = (subtotal - discountAmount) * taxRate;
    const total = subtotal - discountAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to cart before checkout',
        variant: 'destructive',
      });
      return;
    }

    if (!profile) {
      toast({
        title: 'Error',
        description: 'User profile not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);
      const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

      const checkoutData = {
        items: cart,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        payment_method: paymentMethod,
      };

      const sale = await createSale(checkoutData, profile.id);
      
      setLastSale({
        ...sale,
        items: cart,
        totals: { subtotal, discountAmount, taxAmount, total },
      });
      
      setShowReceipt(true);
      setCart([]);
      setDiscount(0);
      
      toast({
        title: 'Sale Completed',
        description: `Invoice ${sale.invoice_number} created successfully`,
      });
    } catch (error: any) {
      console.error('Checkout failed:', error);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Failed to process sale',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Point of Sale</h1>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left: Product Scanner & Cart */}
        <div className="xl:col-span-2 space-y-4">
          {/* Barcode Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Scan Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <Input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan or enter barcode..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">Add</Button>
              </form>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.product.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="mx-auto h-12 w-12 mb-4" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Scan products to add them to cart</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Checkout Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Card
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Mobile Payment
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                  placeholder="0"
                />
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-secondary">
                    <span>Discount ({discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax (8%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={cart.length === 0 || processing}
              >
                {processing ? 'Processing...' : 'Complete Sale'}
              </Button>

              {cart.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCart([]);
                    setDiscount(0);
                  }}
                >
                  Clear Cart
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sale Receipt</DialogTitle>
            <DialogDescription>
              Transaction completed successfully
            </DialogDescription>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="text-lg font-bold">{lastSale.invoice_number}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                {lastSale.items.map((item: CartItem) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${lastSale.totals.subtotal.toFixed(2)}</span>
                </div>
                {lastSale.totals.discountAmount > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span>Discount:</span>
                    <span>-${lastSale.totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${lastSale.totals.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total:</span>
                  <span>${lastSale.totals.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Payment Method: {lastSale.payment_method.toUpperCase()}</p>
                <p>{new Date(lastSale.transaction_date).toLocaleString()}</p>
              </div>
              
              <Button className="w-full" onClick={() => setShowReceipt(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

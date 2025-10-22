import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ordersService, CreateOrderRequest } from '@/services/orders';
import { customersService } from '@/services/customers';
import { productsService } from '@/services/products';
import type { Customer } from '@/services/customers';
import type { Product } from '@/services/products';
import { Trash2, Plus } from 'lucide-react';

interface OrderFormLine {
  productId: string;
  quantity: number;
}

const CreateOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: customersService.getAll,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: productsService.getAll,
  });

  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<OrderFormLine[]>([{ productId: '', quantity: 1 }]);

  useEffect(() => {
    if (!customerId && customers?.length) {
      setCustomerId(customers[0].id);
    }
  }, [customers, customerId]);

  useEffect(() => {
    if (!products || !products.length) {
      return;
    }

    setLines((prev) =>
      prev.map((line) => {
        if (line.productId) {
          return line;
        }

        const available = products.find((product) => product.isActive && product.stockQuantity > 0);
        return available
          ? { productId: available.id, quantity: Math.min(line.quantity, available.stockQuantity) || 1 }
          : line;
      }),
    );
  }, [products]);

  const activeProducts = useMemo(() => {
    return (products ?? []).filter((product) => product.isActive && product.stockQuantity > 0);
  }, [products]);

  const getProduct = (productId: string) => products?.find((product) => product.id === productId);

  const handleProductChange = (index: number, productId: string) => {
    setLines((prev) => {
      const next = [...prev];

      if (next.some((line, lineIndex) => lineIndex !== index && line.productId === productId)) {
        toast({
          title: 'Product already selected',
          description: 'Each product can only be added once per order.',
          variant: 'destructive',
        });
        return prev;
      }

      const product = getProduct(productId);
      const maxQuantity = product?.stockQuantity ?? 1;
      next[index] = {
        productId,
        quantity: Math.min(Math.max(next[index].quantity, 1), maxQuantity),
      };
      return next;
    });
  };

  const handleQuantityChange = (index: number, rawValue: string) => {
    const value = Number.parseInt(rawValue, 10);
    setLines((prev) => {
      const next = [...prev];
      const product = getProduct(next[index].productId);
      const maxQuantity = product?.stockQuantity ?? 1;
      next[index] = {
        ...next[index],
        quantity: Math.min(Math.max(Number.isFinite(value) ? value : 1, 1), maxQuantity),
      };
      return next;
    });
  };

  const addLine = () => {
    const available = activeProducts.find((product) => !lines.some((line) => line.productId === product.id));
    setLines((prev) => [
      ...prev,
      {
        productId: available?.id ?? '',
        quantity: available ? Math.min(1, available.stockQuantity) || 1 : 1,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) {
      toast({ title: 'An order needs at least one product line.', variant: 'destructive' });
      return;
    }

    setLines((prev) => prev.filter((_, lineIndex) => lineIndex !== index));
  };

  const total = useMemo(() => {
    return lines.reduce((sum, line) => {
      const product = getProduct(line.productId);
      if (!product) {
        return sum;
      }
      return sum + product.unitPrice * line.quantity;
    }, 0);
  }, [lines, products]);

  const mutation = useMutation({
    mutationFn: (payload: CreateOrderRequest) => ordersService.create(payload),
    onSuccess: (order) => {
      toast({
        title: 'Order created',
        description: `Order ${order.id.slice(0, 8)} has been placed successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/orders');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to create order.';
      toast({ title: 'Order creation failed', description: message, variant: 'destructive' });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!customerId) {
      toast({ title: 'Select a customer first', variant: 'destructive' });
      return;
    }

    const filteredLines = lines
      .filter((line) => line.productId && line.quantity > 0)
      .map((line) => ({ productId: line.productId, quantity: line.quantity }));

    if (!filteredLines.length) {
      toast({ title: 'Add at least one product to the order.', variant: 'destructive' });
      return;
    }

    mutation.mutate({ customerId, lines: filteredLines });
  };

  const isBusy = mutation.isPending || customersLoading || productsLoading;

  const hasAvailableProducts = activeProducts.length > 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Create order</h1>
          <p className="text-muted-foreground">
            Select a customer, add products, and submit the order. Stock will be deducted automatically.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order details</CardTitle>
            <CardDescription>Provide the customer information and product lines for this order.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select
                  value={customerId}
                  onValueChange={(value) => setCustomerId(value)}
                  disabled={customersLoading || !customers?.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={customersLoading ? 'Loading customers...' : 'Select customer'} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer: Customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.fullName} ({customer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!customersLoading && customers?.length === 0 && (
                  <p className="text-xs text-destructive">Add a customer before creating an order.</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Products</h2>
                  <Button type="button" onClick={addLine} variant="outline" size="sm" disabled={!hasAvailableProducts}>
                    <Plus className="mr-2 h-4 w-4" /> Add product
                  </Button>
                </div>

                {lines.map((line, index) => {
                  const product = getProduct(line.productId);

                  return (
                    <Card key={`${line.productId}-${index}`} className="bg-muted/40">
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,auto] gap-4 items-end">
                          <div className="space-y-2">
                            <Label>Product</Label>
                            <Select
                              value={line.productId}
                              onValueChange={(value) => handleProductChange(index, value)}
                              disabled={productsLoading || !hasAvailableProducts}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={productsLoading ? 'Loading products...' : 'Select product'} />
                              </SelectTrigger>
                              <SelectContent>
                                {activeProducts.map((item: Product) => (
                                  <SelectItem
                                    key={item.id}
                                    value={item.id}
                                    disabled={lines.some((entry, entryIndex) => entryIndex !== index && entry.productId === item.id)}
                                  >
                                    {item.name} • Stock: {item.stockQuantity}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                            <Input
                              id={`quantity-${index}`}
                              type="number"
                              min={1}
                              value={line.quantity}
                              onChange={(event) => handleQuantityChange(index, event.target.value)}
                              disabled={!line.productId}
                            />
                            {product && (
                              <p className="text-xs text-muted-foreground">Max {product.stockQuantity} available</p>
                            )}
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLine(index)}
                              disabled={lines.length === 1}
                              aria-label="Remove product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {product && (
                          <div className="text-sm text-muted-foreground">
                            Unit price: ${product.unitPrice.toFixed(2)} • Line total: ${(product.unitPrice * line.quantity).toFixed(2)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Order total</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </div>

              <CardFooter className="flex justify-end gap-2 p-0">
                <Button type="button" variant="outline" onClick={() => navigate('/orders')} disabled={mutation.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isBusy || !hasAvailableProducts || !customers?.length}>
                  {mutation.isPending ? 'Placing order...' : 'Place order'}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        {!hasAvailableProducts && !productsLoading && (
          <p className="text-sm text-destructive">
            No products with available stock were found. Add inventory before creating a new order.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default CreateOrder;

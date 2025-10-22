import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ordersService, Order } from '@/services/orders';
import { useToast } from '@/hooks/use-toast';
import { X, PlusCircle } from 'lucide-react';
import { authService } from '@/services/auth';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const canManageOrders = useMemo(() => authService.hasAnyRole(['Admin', 'Cashier']), []);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersService.getAll();
      setOrders(data);
    } catch (error) {
      toast({ title: 'Error loading orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        await ordersService.cancel(id);
        toast({ title: 'Order cancelled successfully' });
        loadOrders();
      } catch (error) {
        toast({ title: 'Error cancelling order', variant: 'destructive' });
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">Review recent orders and track status.</p>
          </div>
          {canManageOrders && (
            <Button asChild>
              <Link to="/orders/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New order
              </Link>
            </Button>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                {canManageOrders && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canManageOrders ? 7 : 6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManageOrders ? 7 : 6} className="text-center">No orders found</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">{order.customerId.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(order.orderedAtUtc).toLocaleString()}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {order.isCanceled ? (
                        <span className="text-xs font-semibold text-destructive">Canceled</span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600">Active</span>
                      )}
                    </TableCell>
                    <TableCell>{order.lines.length}</TableCell>
                    {canManageOrders && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(order.id)}
                          disabled={order.isCanceled}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, ShoppingCart, BarChart3 } from 'lucide-react';
import { authService } from '@/services/auth';

const Index = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handlePrimaryClick = () => {
    if (currentUser) {
      navigate(authService.getDefaultDashboardPath());
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Inventory Management System</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Streamline your inventory operations with our comprehensive management platform
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={handlePrimaryClick}>
              {currentUser ? 'Go to dashboard' : 'Get started'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card>
            <CardHeader>
              <Package className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your product catalog and inventory levels</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Customers</CardTitle>
              <CardDescription>Track customer information and loyalty programs</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ShoppingCart className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Orders</CardTitle>
              <CardDescription>Process and manage customer orders efficiently</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate insights with comprehensive reporting</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

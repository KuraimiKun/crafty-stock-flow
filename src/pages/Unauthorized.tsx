import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { authService } from '@/services/auth';

const Unauthorized = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleGoHome = () => {
    navigate(authService.getDefaultDashboardPath());
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto text-center space-y-6">
        <h1 className="text-3xl font-bold">Access denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page. Choose another section or contact an administrator if you believe this is an error.
        </p>
        <div className="flex justify-center">
          <Button onClick={handleGoHome}>Go to dashboard</Button>
        </div>
      </div>
    </Layout>
  );
};

export default Unauthorized;

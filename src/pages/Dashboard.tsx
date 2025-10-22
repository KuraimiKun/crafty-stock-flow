import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(authService.getDefaultDashboardPath(), { replace: true });
  }, [navigate]);

  return null;
};

export default Dashboard;

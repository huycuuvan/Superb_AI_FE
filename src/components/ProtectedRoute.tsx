import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireWorkspace?: boolean;
}

const ProtectedRoute = ({ children, requireWorkspace = true }: ProtectedRouteProps) => {
  const { user, loading, hasWorkspace, isTokenExpired, refreshToken } = useAuth();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleTokenExpired = async () => {
      if (isTokenExpired && !isRefreshing) {
        setIsRefreshing(true);
        const success = await refreshToken();
        setIsRefreshing(false);
        if (!success) {
          // Nếu refresh thất bại, chuyển về trang login
          window.location.href = '/login';
        }
      }
    };

    handleTokenExpired();
  }, [isTokenExpired, refreshToken]);

  if (loading || isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teampal-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && requireWorkspace && !hasWorkspace && location.pathname !== '/workspace') {
    return <Navigate to="/workspace" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 
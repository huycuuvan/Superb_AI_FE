import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireWorkspace?: boolean;
}

const ProtectedRoute = ({ children, requireWorkspace = true }: ProtectedRouteProps) => {
  const { user, loading, hasWorkspace } = useAuth();
  const location = useLocation();

  // Nếu đang loading, hiển thị loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teampal-500"></div>
      </div>
    );
  }

  // Nếu user chưa đăng nhập, chuyển hướng về trang login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu user đã đăng nhập nhưng chưa có workspace và route yêu cầu workspace
  // Và route hiện tại không phải là trang workspace
  if (user && requireWorkspace && !hasWorkspace && location.pathname !== '/workspace') {
    return <Navigate to="/workspace" state={{ from: location }} replace />;
  }

  // Nếu user đã đăng nhập và có workspace (hoặc không yêu cầu workspace)
  // Hoặc user đã đăng nhập, chưa có workspace nhưng route hiện tại là /workspace
  return <>{children}</>;
};

export default ProtectedRoute; 
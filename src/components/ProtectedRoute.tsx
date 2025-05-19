import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Nếu đang loading hoặc đang kiểm tra workspace, hiển thị loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teampal-500"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng về trang login
  if (!user) {
    // Lưu lại đường dẫn hiện tại để sau khi đăng nhập có thể chuyển hướng về
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập và có workspace, nhưng chưa chọn workspace, chuyển hướng về trang /workspace
  if (user && !localStorage.getItem('selectedWorkspace')) {
    return <Navigate to="/workspace" replace />;
  }

  // Nếu đã đăng nhập, có workspace và đã chọn workspace, render children
  return <>{children}</>;
};

export default ProtectedRoute; 
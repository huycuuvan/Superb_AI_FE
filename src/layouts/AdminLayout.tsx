import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Users,
  Settings,
  FileText,
  BarChart,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  FolderOpen,
  Shield
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-10">
        <AdminSidebar />
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Admin Page
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Admin User</span>
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 
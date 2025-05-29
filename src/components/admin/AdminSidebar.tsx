import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  BarChart,
  Shield,
  Settings,
  Building2,
  FolderOpen,
  Bot,
  Settings2
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      description: "Tổng quan",
      href: "/admin/dashboard",
      icon: LayoutDashboard
    },
    {
      title: "Users",
      description: "Quản lý người dùng",
      href: "/admin/users",
      icon: Users
    },
    {
      title: "Messages",
      description: "Quản lý tin nhắn",
      href: "/admin/messages",
      icon: MessageSquare
    },
    {
      title: "Documents",
      description: "Quản lý tài liệu",
      href: "/admin/documents",
      icon: FileText
    },
    {
      title: "Workspaces",
      description: "Quản lý workspace",
      href: "/admin/workspaces",
      icon: Building2
    },
    {
      title: "Folders",
      description: "Quản lý thư mục",
      href: "/admin/folders",
      icon: FolderOpen
    },
    {
      title: "Agents",
      description: "Quản lý agent",
      href: "/admin/agents",
      icon: Bot
    },
    {
      title: "Agent Configs",
      description: "Quản lý cấu hình agent",
      href: "/admin/agent-configs",
      icon: Settings2
    },
    {
      title: "Analytics",
      description: "Phân tích",
      href: "/admin/analytics",
      icon: BarChart
    },
    {
      title: "Security",
      description: "Bảo mật",
      href: "/admin/security",
      icon: Shield
    },
    {
      title: "Settings",
      description: "Cài đặt",
      href: "/admin/settings",
      icon: Settings
    }
  ];

  return (
    <div className="flex h-full w-[240px] flex-col bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <Bot className="h-6 w-6" />
          <span>Admin Panel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 flex-col items-start h-auto py-3",
                  location.pathname === item.href && "bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar; 
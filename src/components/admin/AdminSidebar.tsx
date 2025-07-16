import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from '@/components/ThemeToggle';
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
  Settings2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type MenuItem = {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
};

interface AdminSidebarProps {
  className?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuItems: MenuItem[] = [
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
      title: "Giftcode",
      description: "Quản lý giftcode",
      href: "/admin/giftcodes",
      icon: Settings2 // TODO: Đổi thành icon Gift nếu có
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  const renderNavItem = (item: MenuItem, index: number) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    return (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>
          <Link to={item.href} className="block relative">
            <div
              className={cn(
                'w-full flex h-11 items-center px-3 mb-1 rounded-lg transition-all duration-200',
                isCollapsed && 'justify-center',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 flex-shrink-0',
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              )} />
              
              {!isCollapsed && (
                <span className="ml-3 text-sm">{item.title}</span>
              )}
              
              {!isCollapsed && isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-blue-600 dark:bg-blue-500 rounded-full" />
              )}
            </div>
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" align="start" className="ml-2 border-none shadow-lg bg-white dark:bg-slate-800">
            <p>{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    );
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className={cn(
      'fixed left-0 top-0 h-screen flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-50 overflow-hidden',
      sidebarWidth,
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && (
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-blue-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">EmployeeAI</span>
          </Link>
        )}
        {isCollapsed && (
          <div className="flex justify-center w-full">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-blue-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col px-3 py-4 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item, index) => renderNavItem(item, index))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                <AvatarImage src="/avatars/admin.png" alt="Admin" />
                <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium text-slate-900 dark:text-white">Admin User</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">admin@example.com</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center w-full">
              <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                <AvatarImage src="/avatars/admin.png" alt="Admin" />
                <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
              </Avatar>
            </div>
          )}
          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 
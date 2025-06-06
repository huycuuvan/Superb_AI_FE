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

const AdminSidebar = () => {
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
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start h-12 transition-all duration-200 font-semibold rounded-xl relative z-10',
                isCollapsed ? 'px-3' : 'px-4',
                isActive
                  ? 'bg-neutral-200/70 dark:bg-neutral-800/70 text-slate-900 dark:text-white shadow'
                  : 'hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
              )}
            >
              <span className={cn(
                'rounded-full p-2 flex items-center justify-center',
                isActive
                  ? 'bg-white/70 dark:bg-slate-800/70'
                  : 'bg-white/30 dark:bg-slate-800/30'
              )}>
                <Icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400')} />
              </span>
              {!isCollapsed && (
                <span className="ml-3">{item.title}</span>
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="ml-2">
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
      'fixed left-0 top-0 h-screen flex flex-col bg-primary-gradient border-r border-white/30 dark:border-slate-700/30 backdrop-blur-xl shadow-xl transition-all duration-300 z-50 overflow-hidden',
      sidebarWidth
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between h-16 px-4 border-b border-white/30 dark:border-slate-700/30 relative z-10',
        isCollapsed ? 'px-3' : 'px-4'
      )}>
        {!isCollapsed && (
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/70 shadow">
              <Bot className="h-6 w-6 text-blue-600" />
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">Admin Panel</span>
          </Link>
        )}
        {isCollapsed && (
          <div className="flex justify-center w-full">
            <span className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/70 shadow">
              <Bot className="h-6 w-6 text-blue-600" />
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 relative z-10">
        {menuItems.map((item, index) => renderNavItem(item, index))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/30 dark:border-slate-700/30 p-4 relative z-10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/admin.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium text-slate-900 dark:text-white">Admin User</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">admin@example.com</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </Button>
        </div>
        <div className="mt-4 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 
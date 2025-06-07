import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/hooks/useTheme";
import AdminSidebar from '@/components/admin/AdminSidebar';
import { cn } from "@/lib/utils";
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Moon, Sun, LogOut, Bell, Search, User, Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/admin/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden ml-16 lg:ml-64 transition-all duration-300">
          {/* Header */}
          <header 
            className={cn(
              'fixed top-0 right-0 left-16 lg:left-64 z-40 transition-all duration-200',
              isScrolled 
                ? 'bg-white/95 dark:bg-slate-950/95 shadow-md backdrop-blur-lg border-b border-slate-200 dark:border-slate-800' 
                : 'bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900'
            )}
          >
            <div className="flex h-16 items-center px-6">
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                    {getPageTitle(location.pathname)}
                  </h1>
                  <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-500/30">
                    Admin
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="search"
                      placeholder="Search anything..."
                      className="pl-10 h-10 w-full rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 md:w-[240px] lg:w-[320px]"
                    />
                  </div>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative bg-slate-50 dark:bg-slate-900 rounded-full h-10 w-10">
                        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                          3
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Notifications</TooltipContent>
                  </Tooltip>
                  
                  <div className="hidden sm:block bg-slate-50 dark:bg-slate-900 h-10 w-[1px]"></div>
                  
                  <ThemeToggle />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-full pl-2 pr-3 h-10"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage src="/avatars/admin.png" alt="Admin" />
                          <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
                        </Avatar>
                        <span className="hidden md:inline-block font-medium text-sm text-slate-700 dark:text-slate-300">
                          Admin User
                        </span>
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center gap-3 p-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src="/avatars/admin.png" alt="Admin" />
                          <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">Admin User</p>
                          <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1">admin@example.com</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" /> Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto pt-16 px-6 py-8 bg-white dark:bg-slate-950">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

// Helper function to get page title based on pathname
const getPageTitle = (pathname: string): string => {
  const path = pathname.split('/').pop() || 'dashboard';
  return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
};

export default AdminLayout; 
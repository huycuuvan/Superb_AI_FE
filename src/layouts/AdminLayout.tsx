import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/hooks/useTheme";
import AdminSidebar from '@/components/admin/AdminSidebar';
import { cn } from "@/lib/utils";
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Moon, Sun, LogOut, Bell, Search, User } from "lucide-react";

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
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden ml-16 lg:ml-64 transition-all duration-300">
          {/* Header */}
          <header 
            className={cn(
              'sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
              isScrolled && 'shadow-sm'
            )}
          >
            <div className="flex h-14 items-center px-4 sm:px-6 lg:px-8">
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-lg font-semibold">
                    {getPageTitle(location.pathname)}
                  </h1>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Search..."
                      className="pl-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-[200px] lg:w-[300px]"
                    />
                  </div>
                  
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                      3
                    </span>
                  </Button>
                  
                  <ThemeToggle />
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full"
                        onClick={handleLogout}
                      >
                        <User className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Profile & Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto pt-14">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
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
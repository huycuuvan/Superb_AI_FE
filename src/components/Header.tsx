/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useSelectedWorkspace } from "@/hooks/useSelectedWorkspace";

import { LanguageToggle } from "./LanguageToggle";

const Header = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const { t } = useLanguage();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { workspace, isLoading: isWorkspaceLoading, error: workspaceError } = useSelectedWorkspace();

  console.log("Header: useQuery data:", workspace);
  console.log("Header: useQuery isLoading:", isWorkspaceLoading);
  console.log("Header: useQuery error:", workspaceError);

  // Generate breadcrumb segments
  const breadcrumbs = pathSegments.map((segment, index) => {
    // Capitalize first letter
    const displayName = segment.charAt(0).toUpperCase() + segment.slice(1);
    return {
      name: displayName,
      path: '/' + pathSegments.slice(0, index + 1).join('/'),
    };
  });
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const menuItems = [
    { icon: "🏠", label: t('home'), path: '/dashboard' },
    { icon: "🤖", label: t('agents'), path: '/dashboard/agents' },
    { icon: "✓", label: t('tasks'), path: '/dashboard/tasks' },
    { icon: "⚙️", label: t('settings'), path: '/dashboard/settings' },
  ];

  return (
    <header className="bg-background border-b border-border">
      <div className="py-3 px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm">
            {breadcrumbs.length === 0 ? (
              <span>{getGreeting()}, {user?.name || 'Guest'}</span>
            ) : (
              <>
                {breadcrumbs[0]?.name.toLowerCase() !== 'dashboard' && (
                  <>
                    <Link to="/dashboard" className="hover:text-foreground transition-colors">
                      Dashboard
                    </Link>
                    <span className="mx-1 text-muted-foreground">/</span>
                  </>
                )}
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center">
                    {i > 0 && <span className="mx-1 text-muted-foreground">/</span>}
                    <Link 
                      to={crumb.path}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageToggle />
          <Button variant="outline" size="sm" className="hidden md:inline-flex">
            {t('editBrand')}
          </Button>
          {workspace && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-accent transition">
                  <Avatar className="bg-teampal-200 text-foreground w-8 h-8 flex items-center justify-center">
                    <span className="font-bold text-base flex items-center justify-center">
                      {workspace.name ? workspace.name.charAt(0).toUpperCase() : "W"}
                    </span>
                  </Avatar>
                  <span className="font-semibold flex items-center justify-center">{workspace.name}{workspace.name && "'s workspace"}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-4 py-2">
                  <div className="font-bold">{workspace.name}</div>
                  {workspace.description && (
                    <div className="text-xs text-muted-foreground">{workspace.description}</div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/workspace')}>
                  Chọn workspace khác
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden border-t border-border bg-background",
        mobileMenuOpen ? "block" : "hidden"
      )}>
        <nav className="px-2 py-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/50 hover:text-accent-foreground",
                  "transition-colors"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

     
    </header>
  );
};

export default Header;

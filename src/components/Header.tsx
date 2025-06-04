/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Sparkles, LogOut, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useSelectedWorkspace } from "@/hooks/useSelectedWorkspace";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceProfile, updateWorkspaceProfile, WorkspaceProfile } from "@/services/api";

import { LanguageToggle } from "./LanguageToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkspaceProfileForm } from "@/components/workspace/WorkspaceProfile";

// Import icons for plugins, share, and delete
import { Puzzle, Share2, Trash2, Edit } from 'lucide-react';
import { agents } from '@/services/mockData'; // Assuming agents data is available

import React from "react";

const Header = React.memo(() => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { workspace, isLoading: isWorkspaceLoading, error: workspaceError } = useSelectedWorkspace();
  const { agentId } = useParams<{ agentId: string }>(); // Get agentId from params
  const currentAgent = agents.find(agent => agent.id === agentId); // Find current agent

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  const { data: profileData, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery<{
    data: WorkspaceProfile | null
  } | null>({
    queryKey: ['headerWorkspaceProfile', workspace?.id],
    queryFn: () => workspace?.id ? getWorkspaceProfile(workspace.id) : Promise.resolve(null),
    enabled: isEditDialogOpen && !!workspace?.id,
  });

  const handleEditProfileSubmit = async (data: WorkspaceProfile) => {
    if (!workspace?.id) return;
    await updateWorkspaceProfile(workspace.id, data);
    setIsEditDialogOpen(false);
    refetchProfile();
  };

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

  // Handle logout
  const handleLogout = () => {
    logout(); // Call the logout function from useAuth
    navigate('/login'); // Navigate to the login page after logout
  };

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
          {location.pathname.startsWith('/dashboard/agent-chat/') ? (
            // Agent Chat Header
            <div className="flex items-center space-x-3 md:space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 md:h-9 md:w-9 bg-background hover:bg-muted hover:text-foreground"
                aria-label="Lịch sử chat"
                onClick={() => setShowMobileHistory(true)}
              >
                <Clock className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-base md:text-lg font-semibold">{currentAgent?.name || 'Agent'}</h1>
                <p className="text-xs text-muted-foreground">{currentAgent?.type || 'AI Assistant'}</p>
              </div>
            </div>
          ) : (
            // Default Header (Breadcrumbs/Greeting)
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
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {location.pathname.startsWith('/dashboard/agent-chat/') ? (
            // Agent Chat Icons
            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="ghost" size="icon" aria-label="Plugins">
                <Puzzle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Share">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Delete">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            // Default Icons
            <>
              <LanguageToggle />
              {/* Credit Display */}
              <div className="flex items-center gap-1 text-foreground text-sm">
                 <Sparkles className="h-4 w-4 text-yellow-400" /> {/* Sparkling star icon */}
                 <span>10000 Credits</span> {/* Placeholder for credit amount */}
              </div>
              <Button variant="outline" size="sm" className="hidden md:inline-flex hover:bg-muted hover:text-foreground">
                {t('editBrand')}
              </Button>
              {workspace && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-400 transition">
                      <Avatar className="bg-teampal-200 text-foreground w-8 h-8 flex items-center justify-center">
                        <span className="font-bold text-base flex items-center justify-center">
                          {workspace.name ? workspace.name.charAt(0).toUpperCase() : "W"}
                        </span>
                      </Avatar>
                      <span className="font-semibold hidden md:flex items-center justify-center md:text-sm">{workspace.name}{workspace.name && "'s workspace"}</span>
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
              {/* Logout Button */}
              <Button variant="outline" size="icon" onClick={handleLogout} className="hover:bg-muted hover:text-foreground" aria-label="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
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

      {/* Mobile History Bottom Sheet */}
      {showMobileHistory && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileHistory(false)} />
          <div className="relative w-full h-[60%] bg-card rounded-t-2xl shadow-lg p-4 flex flex-col">
            <button
              className="absolute top-2 right-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full border"
              onClick={() => setShowMobileHistory(false)}
              aria-label="Đóng"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4 text-center">Lịch sử chat</h2>
            {/* Nội dung lịch sử chat, có thể lấy từ sidebar hoặc props */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {/* Demo: */}
              <div className="p-3 rounded-lg hover:bg-muted cursor-pointer">
                <p className="text-sm font-medium">Chat với {currentAgent?.name || 'Agent'}</p>
                <p className="text-xs text-muted-foreground truncate">Last message preview...</p>
              </div>
              <div className="p-3 rounded-lg hover:bg-muted cursor-pointer">
                <p className="text-sm font-medium">Previous Chat</p>
                <p className="text-xs text-muted-foreground truncate">Another message preview...</p>
              </div>
              {/* Thêm các mục lịch sử chat thực tế ở đây */}
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

export default Header;

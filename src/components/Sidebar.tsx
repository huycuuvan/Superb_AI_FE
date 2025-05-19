import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  CheckCircle, 
  Settings as SettingsIcon, 
  Search, 
  ChevronRight,
  Plus,
  Briefcase,
  Palette,
  ShoppingCart,
  Cpu,
  TrendingUp,
  Folder,
  MoreVertical,
  Edit,
  Pin,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { workspaces } from '@/services/mockData';
import { AddFolderDialog } from '@/components/AddFolderDialog';
import { useLanguage } from '@/hooks/useLanguage';
import SettingsDropdown from '@/components/SettingsDropdown';
import { AddAgentDialog } from '@/components/AddAgentDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import './Sidebar.css';
import { useAuth } from '@/hooks/useAuth';
import { getFolders } from '@/services/api';

interface SidebarProps {
  className?: string;
}

interface FolderType {
  id: string;
  name: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
  const [showAddAgentDialog, setShowAddAgentDialog] = useState<{open: boolean, folderId?: string}>({open: false, folderId: undefined});
  const { user } = useAuth();

  // Lấy folders từ API
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  useEffect(() => {
    getFolders()
      .then(data => setFolders(data))
      .catch(() => setFolders([]))
      .finally(() => setLoadingFolders(false));
  }, []);

  console.log(user);
  const menuItems = [
    { icon: Home, label: t('home'), path: '/dashboard' },
    { icon: Users, label: t('agents'), path: '/dashboard/agents' },
    { icon: CheckCircle, label: t('tasks'), path: '/dashboard/tasks' },
    { icon: SettingsIcon, label: t('settings'), path: '/dashboard/settings' },
  ];

  const workspace = workspaces[0];
  
  return (
    <>
      <aside 
        className={cn(
          "bg-white border-r border-border flex flex-col h-full transition-all duration-300 dark:bg-slate-900 dark:border-slate-800",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        <div className="flex items-center p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="bg-teampal-500 text-white p-1.5 rounded">
              <span className="font-bold text-sm">TP</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-lg">Superb AI</span>
            )}
          </div>
          <button 
            className="ml-auto text-gray-500 hover:text-gray-700"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", collapsed ? "" : "rotate-180")} />
          </button>
        </div>
        
        {!collapsed && (
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder={t('search')}
                className="pl-8 bg-muted/50"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-2 border-t border-b border-border">
          <div className="flex items-center space-x-2 max-w-[140px]">
            {workspace.name.startsWith('AI') && (
              <div className="w-6 h-6 rounded-full bg-teampal-500 flex items-center justify-center text-white text-xs font-medium">
                AI
              </div>
            )}
            {!collapsed && (
              <div className="text-sm font-medium truncate max-w-[100px]">{workspace.name}</div>
            )}
          </div>
          {!collapsed && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-6 w-6 ml-1 border-teampal-500 text-teampal-500 hover:bg-teampal-100 hover:text-teampal-700"
              onClick={() => setShowAddFolderDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* <div className="flex-1 overflow-y-auto py-2">
          {loadingFolders ? (
            <div className="px-3 py-2 text-muted-foreground text-sm">Đang tải thư mục...</div>
          ) : (
            folders?.map((folder) => (
              <div
                key={folder.id}
                className={cn(
                  "flex items-center px-3 py-2 mx-2 rounded-md text-sm cursor-pointer",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-colors"
                )}
                onClick={() => navigate(`/dashboard/agents?category=${encodeURIComponent(folder.name)}`)}
              >
                <div className="flex items-center w-full">
                  <Folder className="sidebar-icon mr-2" />
                  {!collapsed && <span className="truncate flex-1">{folder.name}</span>}
                  {!collapsed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-full p-1.5 hover:bg-accent/50 focus:outline-none ml-1" onClick={e => e.stopPropagation()}>
                          <MoreVertical className="sidebar-icon text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert(`Rename ${folder.name}`)}>
                          <Edit className="sidebar-icon mr-2" /> Đổi tên
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Pin ${folder.name}`)}>
                          <Pin className="sidebar-icon mr-2" /> Ghim
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Delete ${folder.name}`)} className="text-red-600 focus:text-red-600">
                          <Trash className="sidebar-icon mr-2" /> Xoá
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))
          )}
        </div> */}
        
        <div className="border-t border-border p-2 space-y-1">
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
              >
                <item.icon className="sidebar-icon mr-2" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-teampal-200 flex items-center justify-center text-foreground">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              {!collapsed && (
                <div className="text-sm">{user?.name || 'Guest'}</div>
              )}
            </div>
            {!collapsed && <SettingsDropdown />}
          </div>
        </div>
      </aside>

      {/* Dialog */}
      {showAddFolderDialog && (
        <AddFolderDialog open={showAddFolderDialog} onOpenChange={setShowAddFolderDialog} />
      )}

      {showAddAgentDialog.open && (
        <AddAgentDialog open={showAddAgentDialog.open} onOpenChange={open => setShowAddAgentDialog({open, folderId: undefined})} folderId={showAddAgentDialog.folderId} />
      )}
    </>
  );
};

export default Sidebar;


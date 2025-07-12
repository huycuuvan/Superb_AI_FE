/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Component Imports from shadcn/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

// Icon Imports
import { Edit, Pin, Trash, MoreVertical, Folder as FolderIcon, Users, BarChart2, DollarSign, Briefcase, BookOpen, MessageCircle, Settings, PieChart, UserCheck, Globe, ShoppingCart, Cpu, Layers } from 'lucide-react';

// Custom Hooks & Contexts
import { useFolders } from '@/contexts/FolderContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { Folder } from '@/types';
import { useTheme } from '@/hooks/useTheme';

// API Service Imports
import { updateFolder, deleteFolder } from '@/services/api';

// Dialog Imports
import { AddFolderDialog } from '@/components/AddFolderDialog';

// Type Definitions


// --- Reusable Folder Card Component ---
const DepartmentCard = ({ folder, onEdit, onDelete }: { folder: Folder, onEdit: (folder: Folder) => void, onDelete: (folder: Folder) => void }) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-card border-border relative p-4 flex flex-col gap-3 group hover:-translate-y-1">
      {/* Menu Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(folder)}>
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alert(`Pin ${folder.name}`)}>
            <Pin className="mr-2 h-4 w-4" /> Ghim
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(folder)} className="text-destructive focus:text-destructive">
            <Trash className="mr-2 h-4 w-4" /> Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Card Content */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
          {getDepartmentIcon(folder.name)}
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg truncate text-foreground" title={folder.name}>{folder.name}</div>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground h-10">
          Quản lý các agent và tài nguyên thuộc phòng ban này.
        </p>
      </div>

      <div className="flex justify-end items-center mt-auto pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/dashboard/folder/${folder.id}`)} 
          className="text-primary border-primary hover:bg-primary/10 dark:hover:bg-primary dark:hover:text-primary-foreground"
        >
          Xem chi tiết
        </Button>
      </div>
    </Card>
  );
};

// Hàm chọn icon phù hợp với tên phòng ban
const getDepartmentIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('marketing')) return <BarChart2 className="w-10 h-10 text-primary" />;
  if (lower.includes('finance')) return <DollarSign className="w-10 h-10 text-primary" />;
  if (lower.includes('hr') || lower.includes('human resource')) return <Users className="w-10 h-10 text-primary" />;
  if (lower.includes('data')) return <PieChart className="w-10 h-10 text-primary" />;
  if (lower.includes('product')) return <Layers className="w-10 h-10 text-primary" />;
  if (lower.includes('customer')) return <UserCheck className="w-10 h-10 text-primary" />;
  if (lower.includes('support')) return <MessageCircle className="w-10 h-10 text-primary" />;
  if (lower.includes('business')) return <Briefcase className="w-10 h-10 text-primary" />;
  if (lower.includes('project')) return <Settings className="w-10 h-10 text-primary" />;
  if (lower.includes('media')) return <Globe className="w-10 h-10 text-primary" />;
  if (lower.includes('sales')) return <ShoppingCart className="w-10 h-10 text-primary" />;
  if (lower.includes('assistant')) return <Cpu className="w-10 h-10 text-primary" />;
  return <FolderIcon className="w-10 h-10 text-primary" />;
};

// --- Main Departments Page Component ---
const DepartmentsPage = () => {
  const { t } = useLanguage();
  const { folders, loadingFolders, fetchFolders } = useFolders();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { workspace } = useSelectedWorkspace();

  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFolderType, setEditFolderType] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    if (folderToRename) {
      setNewFolderName(folderToRename.name);
      setEditFolderType(folderToRename.folder_type || 'custom');
      setEditStatus(folderToRename.status || 'workspace_shared');
    }
  }, [folderToRename]);

  // CRUD Handlers
  const handleRenameClick = (folder: Folder) => {
    setFolderToRename(folder);
    setNewFolderName(folder.name);
    setShowRenameDialog(true);
  };

  const handleRenameFolder = async () => {
    if (!folderToRename || !newFolderName.trim()) return;
    setIsRenaming(true);
    try {
      const oldName = folderToRename.name;
      await updateFolder(folderToRename.id, {
        name: newFolderName.trim(),
        folder_type: editFolderType,
        status: editStatus,
      });
      toast({ title: t('folder.success'), description: `${t('folder.folderRenamed')}: ${oldName} → ${newFolderName.trim()}` });
      await queryClient.invalidateQueries({ queryKey: ['folders'] });
      if (workspace?.id) await fetchFolders(workspace.id);
      setShowRenameDialog(false);
    } catch (error: any) {
      console.error('Lỗi khi đổi tên folder:', error);
      let errorMsg = t('folder.folderRenameFailed');
      if (error?.message) errorMsg += `: ${error.message}`;
      toast({ title: t('folder.error'), description: errorMsg, variant: 'destructive' });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteClick = (folder: Folder) => {
    setFolderToDelete(folder);
    setShowConfirmDeleteDialog(true);
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFolder(folderToDelete.id);
      toast({ title: t('success'), description: t('folderDeleted', { name: folderToDelete.name }) });
      await queryClient.invalidateQueries({ queryKey: ['folders'] });
      if (workspace?.id) await fetchFolders(workspace.id);
      setShowConfirmDeleteDialog(false);
    } catch (error) {
      toast({ title: t('error'), description: t('folderDeleteFailed', { name: folderToDelete.name }), variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Refetch folders sau khi tạo folder thành công
  const handleAddFolderSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['folders'] });
    if (workspace?.id) await fetchFolders(workspace.id);
    setShowAddFolderDialog(false);
  };

  // Filtering Logic
  const filteredFolders = folders?.filter(folder => 
    folder.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // --- Loading State ---
  if (loadingFolders) {
    return (
      <div className="flex flex-col space-y-4 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-1/3 mt-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-48 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // --- Error State ---
  // if (error) {
  //   return <div className="text-destructive p-6">Error: {(error as Error).message}</div>;
  // }

  // --- Main Render ---
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('folder.departments') || 'Phòng ban'}</h1>
          <p className="text-muted-foreground">Tạo và quản lý các phòng ban trong workspace.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <Button variant="primary" onClick={() => setShowAddFolderDialog(true)}>
            {t('folder.createFolder') || 'Tạo phòng ban'}
          </Button>
        )}
      </div>
      
      {/* Search Bar */}
      <div className="relative w-full md:w-96">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <Input
          type="search"
          placeholder="Tìm kiếm phòng ban..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Folders Grid */}
      {filteredFolders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFolders.map((folder) => (
            <DepartmentCard 
              key={folder.id} 
              folder={folder} 
              onEdit={handleRenameClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          {searchQuery ? 'Không tìm thấy phòng ban nào' : 'Chưa có phòng ban nào trong workspace này.'}
        </div>
      )}

      {/* Dialogs */}
      <AddFolderDialog open={showAddFolderDialog} onOpenChange={setShowAddFolderDialog} onSuccess={handleAddFolderSuccess} />

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('folder.renameFolderTitle')}</DialogTitle>
            <DialogDescription>{t('folder.renameFolderDescription', { name: folderToRename?.name })}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-folder-name" className="text-right">{t('folder.newFolderName')}</Label>
              <Input id="new-folder-name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-type" className="text-right">Loại folder</Label>
              <div className="col-span-3">
                <Select value={editFolderType} onValueChange={setEditFolderType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-status" className="text-right">Trạng thái</Label>
              <div className="col-span-3">
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workspace_shared">Workspace Shared</SelectItem>
                    <SelectItem value="system_shared">System Shared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowRenameDialog(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleRenameFolder} disabled={isRenaming}>{isRenaming ? t('common.loading') : t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('folder.deleteFolderConfirmation')}</DialogTitle>
            <DialogDescription>{t('folder.deleteFolderConfirmationDescription', { name: folderToDelete?.name })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowConfirmDeleteDialog(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleDeleteFolder} disabled={isDeleting} variant="destructive">{isDeleting ? t('common.loading') : t('delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsPage;
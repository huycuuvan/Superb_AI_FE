import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { FolderPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createFolder } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { useAuth } from '@/hooks/useAuth';

interface AddFolderDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddFolderDialog = ({ open: openProp, onOpenChange, onSuccess }: AddFolderDialogProps) => {
  const { t } = useLanguage();
  const [folderName, setFolderName] = useState('');
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = onOpenChange ? onOpenChange : setInternalOpen;
  const { workspace } = useSelectedWorkspace();
  const { user } = useAuth();

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    if (!user?.role) return;
    try {
      setIsLoading(true);
      if (user.role === 'super_admin') {
        await createFolder({
          name: folderName.trim(),
          description: '',
          folder_type: 'custom',
          status: 'system_shared',
        });
      } else {
        if (!workspace?.id) return;
        await createFolder({
          workspace_id: workspace.id,
          name: folderName.trim(),
          description: '',
          folder_type: 'custom',
          status: 'workspace_shared',
        });
      }
      setFolderName('');
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi khi tạo folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('folder.createFolder')}</DialogTitle>
          <DialogDescription>
            {t('folder.createFolderDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t('folder.nameFolder')}
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateFolder} disabled={!folderName.trim() || isLoading}>
            {isLoading ? t('common.loading') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

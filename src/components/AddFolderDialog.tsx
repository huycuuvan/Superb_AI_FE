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

  const handleCreateFolder = async () => {
    if (!folderName.trim() || !workspace?.id) return;
    
    try {
      setIsLoading(true);
      await createFolder({
        workspace_id: workspace.id,
        name: folderName.trim(),
        description: '',
        folder_type: 'custom',
        status: 'workspace_shared'
      });
      
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
          <DialogTitle>{t('addFolder')}</DialogTitle>
          <DialogDescription>
            {t('createWorkspace')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t('folderName')}
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
            {t('cancel')}
          </Button>
          <Button onClick={handleCreateFolder} disabled={!folderName.trim() || isLoading}>
            {isLoading ? 'Đang tạo...' : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

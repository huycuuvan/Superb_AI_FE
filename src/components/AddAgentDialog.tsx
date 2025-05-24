import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createAgent, getFolders } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { Folder } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export const AddAgentDialog = ({ open: openProp, onOpenChange, folderId: propFolderId, onSuccess }: { open?: boolean, onOpenChange?: (open: boolean) => void, folderId?: string, onSuccess?: () => void }) => {
  const { t } = useLanguage();
  const { workspace, isLoading: isLoadingWorkspace } = useSelectedWorkspace();
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(propFolderId);

  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = onOpenChange ? onOpenChange : setInternalOpen;

  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setSelectedFolderId(propFolderId);
  }, [propFolderId]);

  useEffect(() => {
    if (open && workspace?.id && !isLoadingWorkspace) {
      const fetchFolders = async () => {
        setLoadingFolders(true);
        try {
          const response = await getFolders(workspace.id);
          setFolders(response.data || []);
        } catch (err: unknown) {
          console.error('Error fetching folders:', err);
        } finally {
          setLoadingFolders(false);
        }
      };
      fetchFolders();
    }
  }, [open, workspace?.id, isLoadingWorkspace]);

  const handleCreateAgent = async () => {
    const targetFolderId = propFolderId || selectedFolderId;

    if (!agentName.trim() || !agentType || !targetFolderId || !workspace?.id) {
      setError('Please fill in all required fields and ensure workspace/folder are selected.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newAgentData = {
        name: agentName.trim(),
        workspace_id: workspace.id,
        folder_id: targetFolderId,
        role_description: agentType,
        instructions: agentDescription,
        status: 'private',
        model_config: {},
      };

      console.log('Attempting to create agent with data:', newAgentData);
      const response = await createAgent(newAgentData);
      console.log('Agent created successfully:', response);

      toast({
        title: "Thành công!",
        description: "Agent đã được tạo thành công.",
        variant: "default",
      });

      // Invalidate all agent-related queries
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agentsByFolder', targetFolderId] });
      queryClient.invalidateQueries({ queryKey: ['agentsByWorkspace', workspace.id] });

      onSuccess?.();

      setAgentName('');
      setAgentType('');
      setAgentDescription('');
      setOpen(false);

    } catch (err: unknown) {
      console.error('Error creating agent:', err);
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định khi tạo agent.';
      setError(errorMessage);

      toast({
        title: "Lỗi!",
        description: errorMessage,
        variant: "destructive",
      });

    } finally {
      setLoading(false);
    }
  };

  const isFolderSelectionNeeded = propFolderId === undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
    
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addAgent')}</DialogTitle>
          <DialogDescription>
            {t('createAgent')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent-name" className="text-right">
              Name
            </Label>
            <Input
              id="agent-name"
              className="col-span-3"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              autoFocus
            />
          </div>

          {isFolderSelectionNeeded && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-select" className="text-right">
                Folder
              </Label>
              <Select onValueChange={setSelectedFolderId} value={selectedFolderId}>
                <SelectTrigger className="col-span-3" id="folder-select" disabled={loadingFolders || !folders.length}>
                  <SelectValue placeholder={loadingFolders ? 'Loading folders...' : folders.length > 0 ? 'Select a folder' : 'No folders available'} />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent-type" className="text-right">
              Role Description
            </Label>
            <Input
              id="agent-type"
              className="col-span-3"
              value={agentType}
              onChange={(e) => setAgentType(e.target.value)}
              placeholder="e.g., Customer Service Agent"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent-description" className="text-right">
              Instructions
            </Label>
            <Textarea
              id="agent-description"
              className="col-span-3"
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              rows={3}
              placeholder="e.g., Respond to customer inquiries politely."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button onClick={handleCreateAgent} disabled={loading || !agentName.trim() || !agentType || (isFolderSelectionNeeded && !selectedFolderId) || !workspace?.id}>
            {loading ? 'Creating...' : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

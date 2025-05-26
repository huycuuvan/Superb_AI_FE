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
  const [agentTasks, setAgentTasks] = useState('');
  const [agentKnowledge, setAgentKnowledge] = useState('');
  const [agentTarget, setAgentTarget] = useState('');
  const [agentChannel, setAgentChannel] = useState('');
  const [agentLocalization, setAgentLocalization] = useState('');
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
      // Hàm tiện ích để tách chuỗi thành mảng, loại bỏ khoảng trắng thừa
      const toArray = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);
      const instructionsJson = {
        ObjectivesAndPurpose: toArray(agentDescription),
        DutiesAndResponsibilities: toArray(agentTasks),
        Expertise: toArray(agentKnowledge),
        TargetAudience: toArray(agentTarget),
        CommunicationChannels: toArray(agentChannel),
        LocalizationAndCulturalConsiderations: toArray(agentLocalization)
      };

      const newAgentData = {
        name: agentName.trim(),
        workspace_id: workspace.id,
        folder_id: targetFolderId,
        role_description: agentType,
        instructions: JSON.stringify(instructionsJson),
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

      // Refetch các query cache liên quan đến agents trong folder cụ thể
      await queryClient.refetchQueries({
        queryKey: ['agentsByFolder', targetFolderId],
        exact: true,
      });

      // Refetch query chung cho danh sách agents để cập nhật trang Agents
      await queryClient.refetchQueries({
        queryKey: ['agents', workspace.id],
        exact: true,
      });

      // Có thể vẫn cần invalidate các query chung khác nếu cần
      queryClient.invalidateQueries({ queryKey: ['agentsByWorkspace', workspace.id] });

      onSuccess?.();

      setAgentName('');
      setAgentType('');
      setAgentDescription('');
      setAgentTasks('');
      setAgentKnowledge('');
      setAgentTarget('');
      setAgentChannel('');
      setAgentLocalization('');
      setOpen(false);
    } catch (error) {
      console.error('Error creating agent:', error);
      setError('Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFolderSelectionNeeded = propFolderId === undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('create_agent')}</DialogTitle>
          <DialogDescription>
            {t('create_agent_description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid gap-4 py-4">
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-name" className="text-right">
                {t('name')}
              </Label>
              <Input
                id="agent-name"
                className="col-span-3"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder={t('enter_agent_name')}
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
                Mục tiêu và Mục đích
              </Label>
              <Textarea
                id="agent-description"
                className="col-span-3"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                rows={3}
                placeholder="Nhập mục tiêu và mục đích của agent"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-tasks" className="text-right">
                Nhiệm vụ và Trách nhiệm
              </Label>
              <Textarea
                id="agent-tasks"
                className="col-span-3"
                value={agentTasks}
                onChange={(e) => setAgentTasks(e.target.value)}
                rows={3}
                placeholder="Nhập nhiệm vụ và trách nhiệm của agent"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-knowledge" className="text-right">
                Kiến thức Chuyên môn
              </Label>
              <Textarea
                id="agent-knowledge"
                className="col-span-3"
                value={agentKnowledge}
                onChange={(e) => setAgentKnowledge(e.target.value)}
                rows={3}
                placeholder="Nhập kiến thức chuyên môn của agent"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-target" className="text-right">
                Đối tượng Mục tiêu
              </Label>
              <Textarea
                id="agent-target"
                className="col-span-3"
                value={agentTarget}
                onChange={(e) => setAgentTarget(e.target.value)}
                rows={3}
                placeholder="Nhập đối tượng mục tiêu của agent"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-channel" className="text-right">
                Kênh Giao tiếp
              </Label>
              <Textarea
                id="agent-channel"
                className="col-span-3"
                value={agentChannel}
                onChange={(e) => setAgentChannel(e.target.value)}
                rows={3}
                placeholder="Nhập kênh giao tiếp của agent"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-localization" className="text-right">
                Địa phương hóa và Cân nhắc Văn hóa
              </Label>
              <Textarea
                id="agent-localization"
                className="col-span-3"
                value={agentLocalization}
                onChange={(e) => setAgentLocalization(e.target.value)}
                rows={3}
                placeholder="Nhập thông tin về địa phương hóa và cân nhắc văn hóa"
              />
            </div>
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

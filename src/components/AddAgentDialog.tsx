import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
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
import { Folder, ModelConfig } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

type AgentStatus = 'private' | 'system_public' | 'workspace_shared';

export const AddAgentDialog = ({ open: openProp, onOpenChange, folderId: propFolderId, onSuccess }: { open?: boolean, onOpenChange?: (open: boolean) => void, folderId?: string, onSuccess?: () => void }) => {
  const { t } = useLanguage();
  const { workspace, isLoading: isLoadingWorkspace } = useSelectedWorkspace();
  const { user } = useAuth();
  const [agentName, setAgentName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [jobBrief, setJobBrief] = useState('');
  const [language, setLanguage] = useState('Tiếng Việt');
  const [position, setPosition] = useState('');
  const [greetingMessage, setGreetingMessage] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState('0.8');
  const [webhookUrl, setWebhookUrl] = useState('https://mvp2.xcel.bot/webhook/12122');
  const [buildPromptWebhookUrl, setBuildPromptWebhookUrl] = useState('https://mvp2.xcel.bot/webhook/build-prompt');
  const [status, setStatus] = useState<AgentStatus>('private');
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

  // Xác định trạng thái mặc định dựa trên role của user
  useEffect(() => {
    if (user?.role === 'super_admin') {
      setStatus('system_public');
    } else if (user?.role === 'admin') {
      setStatus('private');
    } else {
      setStatus('workspace_shared');
    }
  }, [user?.role]);

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

    if (!agentName.trim() || !roleDescription || !targetFolderId || !workspace?.id) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc và đảm bảo đã chọn workspace/folder.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const modelConfig: ModelConfig = {
        model: model,
        temperature: parseFloat(temperature),
        webhook_url: webhookUrl,
        build_prompt_webhook_url: buildPromptWebhookUrl
      };

      const newAgentData = {
        name: agentName.trim(),
        role_description: roleDescription,
        job_brief: jobBrief,
        language: language,
        position: position,
        greeting_message: greetingMessage,
        model_config: modelConfig,
        status: status,
        folder_id: targetFolderId,
        workspace_id: workspace.id
      };

      console.log('Attempting to create agent with data:', newAgentData);
      const response = await createAgent(newAgentData);
      console.log('Agent created successfully:', response);

      toast({
        title: "Thành công!",
        description: "Agent đã được tạo thành công.",
        variant: "default",
      });

      await queryClient.refetchQueries({
        queryKey: ['agentsByFolder', targetFolderId],
        exact: true,
      });

      await queryClient.refetchQueries({
        queryKey: ['agents', workspace.id],
        exact: true,
      });

      queryClient.invalidateQueries({ queryKey: ['agentsByWorkspace', workspace.id] });

      onSuccess?.();

      // Reset form
      setAgentName('');
      setRoleDescription('');
      setJobBrief('');
      setPosition('');
      setLanguage('Tiếng Việt');
      setModel('gpt-4');
      setTemperature('0.8');
      setWebhookUrl('https://mvp2.xcel.bot/webhook/12122');
      setBuildPromptWebhookUrl('https://mvp2.xcel.bot/webhook/build-prompt');
      setStatus(user?.role === 'super_admin' ? 'system_public' : user?.role === 'admin' ? 'private' : 'workspace_shared');
      setGreetingMessage('');
      setOpen(false);
    } catch (error) {
      console.error('Error creating agent:', error);
      setError('Không thể tạo agent. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const isFolderSelectionNeeded = propFolderId === undefined;

  // Xác định các trạng thái có sẵn dựa trên role của user
  const availableStatuses = (() => {
    if (user?.role === 'super_admin') {
      return [
        { value: 'system_public', label: 'Công khai hệ thống' },
        { value: 'workspace_shared', label: 'Chia sẻ workspace' },
        { value: 'private', label: 'Riêng tư' }
      ];
    } else if (user?.role === 'admin') {
      return [
        { value: 'private', label: 'Riêng tư' },
        { value: 'workspace_shared', label: 'Chia sẻ workspace' }
      ];
    } else {
      return [
        { value: 'workspace_shared', label: 'Chia sẻ workspace' }
      ];
    }
  })();

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
            
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <h3 className="font-medium">Thông tin cơ bản</h3>
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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role-description" className="text-right">
                  Mô tả vai trò
                </Label>
                <Input
                  id="role-description"
                  className="col-span-3"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Nhập mô tả vai trò của agent"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="job-brief" className="text-right">
                  Mô tả công việc
                </Label>
                <Textarea
                  id="job-brief"
                  className="col-span-3"
                  value={jobBrief}
                  onChange={(e) => setJobBrief(e.target.value)}
                  rows={3}
                  placeholder="Nhập mô tả công việc của agent"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="language" className="text-right">
                  Ngôn ngữ
                </Label>
                <Input
                  id="language"
                  className="col-span-3"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="Nhập ngôn ngữ"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-right">
                  Vị trí phòng ban
                </Label>
                <Input
                  id="position"
                  className="col-span-3"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ví dụ: Phòng Kinh doanh, Phòng Kỹ thuật, Phòng Marketing..."
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="greeting-message" className="text-right">
                  Lời chào
                </Label>
                <Textarea
                  id="greeting-message"
                  className="col-span-3"
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  placeholder="Nhập lời chào mở đầu khi người dùng bắt đầu chat với agent"
                  rows={3}
                />
              </div>
            </div>

            {/* Cấu hình Model */}
            <div className="space-y-4">
              <h3 className="font-medium">Cấu hình Model</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">
                  Model
                </Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="temperature" className="text-right">
                  Temperature
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  className="col-span-3"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="webhook-url" className="text-right">
                  Webhook URL
                </Label>
                <Input
                  id="webhook-url"
                  className="col-span-3"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="Nhập webhook URL"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="build-prompt-webhook" className="text-right">
                  Build Prompt Webhook
                </Label>
                <Input
                  id="build-prompt-webhook"
                  className="col-span-3"
                  value={buildPromptWebhookUrl}
                  onChange={(e) => setBuildPromptWebhookUrl(e.target.value)}
                  placeholder="Nhập build prompt webhook URL"
                />
              </div>
            </div>

            {/* Cấu hình khác */}
            <div className="space-y-4">
              <h3 className="font-medium">Cấu hình khác</h3>
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
                <Label htmlFor="status" className="text-right">
                  Trạng thái
                </Label>
                <Select value={status} onValueChange={(value: AgentStatus) => setStatus(value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading} className="hover:bg-primary-pink/30 hover:text-primary-pink dark:hover:bg-primary-pink/50 dark:hover:text-primary-pink">
            {t('cancel')}
          </Button>
          <Button onClick={handleCreateAgent} disabled={loading || !agentName.trim() || !roleDescription || (isFolderSelectionNeeded && !selectedFolderId) || !workspace?.id}>
            {loading ? 'Đang tạo...' : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

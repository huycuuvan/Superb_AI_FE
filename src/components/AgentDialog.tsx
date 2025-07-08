import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Agent, ModelConfig } from '@/types';
import { useFolders } from '@/contexts/FolderContext';

interface AgentDialogProps {
  mode: 'add' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentData?: Partial<Agent>;
  onSave: (data: Partial<Agent> & { folder_id?: string }) => void;
  onCancel: () => void;
  isSaving?: boolean;
  folderId?: string;
}

const defaultAgent: Partial<Agent> = {
  name: '',
  role_description: '',
  job_brief: '',
  language: '',
  position: '',
  greeting_message: '',
  model_config: { webhook_url: '' },
  status: 'private',
};

export const AgentDialog: React.FC<AgentDialogProps> = ({
  mode,
  open,
  onOpenChange,
  agentData,
  onSave,
  onCancel,
  isSaving,
  folderId,
}) => {
  const [form, setForm] = useState<Partial<Agent>>(defaultAgent);
  const [selectedFolderId, setSelectedFolderId] = useState(folderId || '');
  const { folders, loadingFolders } = useFolders();

  useEffect(() => {
    if (mode === 'edit' && agentData) {
      setForm({ ...defaultAgent, ...agentData });
    } else {
      setForm(defaultAgent);
    }
    setSelectedFolderId(folderId || '');
  }, [mode, agentData, folderId]);

  const handleChange = (field: keyof Agent, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleModelConfigChange = (field: keyof Agent['model_config'], value: string) => {
    setForm(prev => ({
      ...prev,
      model_config: {
        ...prev.model_config,
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave({
      ...agentData,
      ...form,
      folder_id: selectedFolderId,
    });
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Tạo Agent mới' : `Chỉnh sửa Agent`}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Nhập thông tin để tạo agent mới.' : `Cập nhật thông tin cho agent "${agentData?.name}".`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-name" className="text-right">Tên</Label>
              <Input 
                id="agent-name"
                className="col-span-3"
                value={form.name || ''}
                onChange={e => handleChange('name', e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-role" className="text-right">Chức danh</Label>
              <Input 
                id="agent-role"
                className="col-span-3"
                value={form.role_description || ''}
                onChange={e => handleChange('role_description', e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Thông tin cơ bản</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agent-job-brief" className="text-right">Mô tả công việc</Label>
                <Textarea
                  id="agent-job-brief"
                  className="col-span-3"
                  value={form.job_brief || ''}
                  onChange={e => handleChange('job_brief', e.target.value)}
                  rows={3}
                  disabled={isSaving}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agent-language" className="text-right">Ngôn ngữ</Label>
                <Input
                  id="agent-language"
                  className="col-span-3"
                  value={form.language || ''}
                  onChange={e => handleChange('language', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agent-position" className="text-right">Vị trí phòng ban</Label>
                <Input
                  id="agent-position"
                  className="col-span-3"
                  value={form.position || ''}
                  onChange={e => handleChange('position', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agent-greeting-message" className="text-right">Lời chào</Label>
                <Textarea
                  id="agent-greeting-message"
                  className="col-span-3"
                  value={form.greeting_message || ''}
                  onChange={e => handleChange('greeting_message', e.target.value)}
                  rows={3}
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Cấu hình Webhook</h3> 
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agent-webhook-url" className="text-right">Webhook URL</Label>
                <Input
                  id="agent-webhook-url"
                  className="col-span-3"
                  value={form.model_config?.webhook_url || ''}
                  onChange={e => handleModelConfigChange('webhook_url', e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Cấu hình khác</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agent-folder-id" className="text-right">Thư mục</Label>
                <Select value={selectedFolderId} onValueChange={setSelectedFolderId} disabled={isSaving || loadingFolders}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={loadingFolders ? "Đang tải..." : "Chọn thư mục"} />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label htmlFor="agent-status" className="text-right">Trạng thái</Label>
                <Select value={form.status || 'private'} onValueChange={value => handleChange('status', value)} disabled={isSaving}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Riêng tư</SelectItem>
                    <SelectItem value="workspace_shared">Chia sẻ workspace</SelectItem>
                    <SelectItem value="system_public">Công khai hệ thống</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>Hủy</Button>
          <Button onClick={handleSave} disabled={isSaving || !form.name}>
            {isSaving ? 'Đang lưu...' : (mode === 'add' ? 'Tạo mới' : 'Lưu thay đổi')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AgentDialog; 
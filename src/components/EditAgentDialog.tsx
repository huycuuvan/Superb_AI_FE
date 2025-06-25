import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Agent } from '@/types';

type AgentStatus = 'private' | 'system_public' | 'workspace_shared';

interface EditAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentToEdit: Partial<Agent> | null;
  editedAgentData: Partial<Agent>;
  setEditedAgentData: (data: Partial<Agent>) => void;
  editedTemperature: string;
  setEditedTemperature: (val: string) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  agentTypeOptions: string[];
  agentCategoryOptions: string[];
  agentStatusOptions: string[];
}

const EditAgentDialog: React.FC<EditAgentDialogProps> = ({
  open,
  onOpenChange,
  agentToEdit,
  editedAgentData,
  setEditedAgentData,
  editedTemperature,
  setEditedTemperature,
  isSaving,
  onSave,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Agent</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho agent "{agentToEdit?.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-agent-name" className="text-right">Tên</Label>
              <Input 
                id="edit-agent-name"
                className="col-span-3"
                value={editedAgentData.name || ''}
                onChange={(e) => setEditedAgentData({ ...editedAgentData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-agent-role" className="text-right">Chức danh</Label>
              <Input 
                id="edit-agent-role"
                className="col-span-3"
                value={editedAgentData.role_description || ''}
                onChange={(e) => setEditedAgentData({ ...editedAgentData, role_description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-agent-instructions" className="text-right">Mô tả vai trò</Label>
              <Textarea 
                id="edit-agent-instructions"
                className="col-span-3"
                value={editedAgentData.instructions || ''}
                onChange={(e) => setEditedAgentData({ ...editedAgentData, instructions: e.target.value })}
                rows={4}
              />
            </div>

            {/* Thông tin cơ bản */} 
            <div className="space-y-4">
              <h3 className="font-medium">Thông tin cơ bản</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-job-brief" className="text-right">
                  Mô tả công việc
                </Label>
                <Textarea
                  id="edit-agent-job-brief"
                  className="col-span-3"
                  value={editedAgentData.job_brief || ''}
                  onChange={(e) => setEditedAgentData({ ...editedAgentData, job_brief: e.target.value })} rows={3} placeholder="Nhập mô tả công việc của agent" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-language" className="text-right">
                  Ngôn ngữ
                </Label>
                <Input
                  id="edit-agent-language"
                  className="col-span-3"
                  value={editedAgentData.language || ''}
                  onChange={(e) => setEditedAgentData({ ...editedAgentData, language: e.target.value })} placeholder="Nhập ngôn ngữ" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-position" className="text-right">
                  Vị trí phòng ban
                </Label>
                <Input
                  id="edit-agent-position"
                  className="col-span-3"
                  value={editedAgentData.position || ''}
                  onChange={(e) => setEditedAgentData({ ...editedAgentData, position: e.target.value })} placeholder="Ví dụ: Phòng Kinh doanh, Phòng Kỹ thuật, Phòng Marketing..." />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-greeting-message" className="text-right">
                  Lời chào
                </Label>
                <Textarea
                  id="edit-agent-greeting-message"
                  className="col-span-3"
                  value={editedAgentData.greeting_message || ''}
                  onChange={(e) => setEditedAgentData({ ...editedAgentData, greeting_message: e.target.value })} placeholder="Nhập lời chào mở đầu khi người dùng bắt đầu chat với agent" rows={3} />
              </div>
            </div>

            {/* Cấu hình Model */} 
            <div className="space-y-4">
              <h3 className="font-medium">Cấu hình Model</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-model" className="text-right">
                  Model
                </Label>
                <Select value={editedAgentData.model_config?.model || 'gpt-4'} onValueChange={(value) => setEditedAgentData({ ...editedAgentData, model_config: { ...editedAgentData.model_config, model: value } })}>
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
                <Label htmlFor="edit-agent-temperature" className="text-right">
                  Temperature
                </Label>
                <Input
                  id="edit-agent-temperature"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  className="col-span-3"
                  value={editedTemperature}
                  onChange={(e) => setEditedTemperature(e.target.value)} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-webhook-url" className="text-right">
                  Webhook URL
                </Label>
                <Input
                  id="edit-agent-webhook-url"
                  className="col-span-3"
                  value={editedAgentData.model_config?.webhook_url || ''}
                  onChange={(e) => setEditedAgentData({ ...editedAgentData, model_config: { ...editedAgentData.model_config, webhook_url: e.target.value } })} placeholder="Nhập webhook URL" />
              </div>
            </div>

            {/* Cấu hình khác */} 
            <div className="space-y-4">
              <h3 className="font-medium">Cấu hình khác</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-status" className="text-right">
                  Trạng thái
                </Label>
                <Select value={editedAgentData.status || 'private'} onValueChange={(value: AgentStatus) => setEditedAgentData({ ...editedAgentData, status: value })}> 
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {[{ value: 'private', label: 'Riêng tư' }, { value: 'workspace_shared', label: 'Chia sẻ workspace' }, { value: 'system_public', label: 'Công khai hệ thống' }].map((statusOption) => (
                      <SelectItem key={statusOption.value} value={statusOption.value}>
                        {statusOption.label}
                      </SelectItem>
                    ))} 
                  </SelectContent>
                </Select>
              </div>
            </div>
             {/* Add other fields for editing if needed */} 
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>Hủy</Button>
          <Button onClick={onSave} disabled={isSaving || !editedAgentData.name}>
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgentDialog; 
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
import { TaskType, UpdateTaskRequest } from '@/services/taskService';
import { X, Upload } from 'lucide-react';
import { getAgents } from '@/services/api';
import { Agent, ApiTaskType } from '@/types';
import { toast } from "sonner";

interface EditTaskDialogProps {
  task: ApiTaskType;
  onClose: () => void;
  onSubmit: (taskData: UpdateTaskRequest) => Promise<void>;
}

export const EditTaskDialog = ({ task, onClose, onSubmit }: EditTaskDialogProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState(task.name || '');
  const [description, setDescription] = useState(task.description || '');
  const [taskType, setTaskType] = useState<TaskType>('pretrained_configurable');
  const [executionConfig, setExecutionConfig] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [creditCost, setCreditCost] = useState(20);
  const [isSystemTask, setIsSystemTask] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(task.assignedAgentId || '');

  const creditCostOptions = [
    { value: 20, label: 'Normal (20 credits)' },
    { value: 50, label: 'Premium (50 credits)' },
    { value: 100, label: 'Enterprise (100 credits)' }
  ];

  useEffect(() => {
    const fetchAgents = async () => {
        try {
          const response = await getAgents(1, 100);
          setAgents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error('Lỗi khi tải danh sách agents:', error);
        }
    };
    fetchAgents();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          // Validate JSON
          JSON.parse(content);
          setExecutionConfig(content);
        } catch (error) {
          console.error('Lỗi khi đọc file JSON:', error);
          toast.error("File không phải là JSON hợp lệ");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUpdateTask = async () => {
    if (!name.trim() || !description.trim() || !category.trim() || !selectedAgentId) {
      toast.error("Vui lòng điền đầy đủ thông tin", {
        description: "Tên task, mô tả, danh mục và agent là bắt buộc"
      });
      return;
    }

    if (taskType === 'pretrained_configurable' && !executionConfig.trim()) {
      toast.error("Vui lòng nhập cấu hình JSON", {
        description: "Cấu hình JSON là bắt buộc cho loại task này"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const taskData: UpdateTaskRequest = {
        id: task.id,
        name: name.trim(),
        description: description.trim(),
        task_type: taskType,
        execution_config: taskType === 'pretrained_configurable' ? JSON.parse(executionConfig) : {},
        credit_cost: creditCost,
        category,
        is_system_task: isSystemTask,
        agent_id: selectedAgentId
      };
      
      await onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error('Lỗi khi cập nhật task:', error);
      toast.error("Lỗi khi cập nhật task", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
          <DialogTitle>{t('editTask')}</DialogTitle>
          <DialogDescription>
            {t('updateTask')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-name" className="text-right">
              Tên task
            </Label>
            <Input
              id="task-name"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên task"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-description" className="text-right">
              Mô tả
            </Label>
            <Textarea
              id="task-description"
              className="col-span-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả task"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent" className="text-right">
              Agent
            </Label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-type" className="text-right">
              Loại task
            </Label>
            <Select value={taskType} onValueChange={(value: TaskType) => setTaskType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn loại task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pretrained_configurable">Pretrained Configurable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {taskType === 'pretrained_configurable' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Cấu hình JSON
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="json-upload"
                  />
                  <Label
                    htmlFor="json-upload"
                    className="flex items-center gap-2 cursor-pointer bg-secondary px-3 py-2 rounded-md hover:bg-secondary/80"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Import JSON</span>
                  </Label>
                </div>
                <Textarea
                  value={executionConfig}
                  onChange={(e) => setExecutionConfig(e.target.value)}
                  placeholder="Nhập cấu hình JSON hoặc import từ file..."
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Danh mục
            </Label>
            <Input
              id="category"
              className="col-span-3"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ví dụ: design"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="credit-cost" className="text-right">
              Chi phí credit
            </Label>
            <Select value={creditCost.toString()} onValueChange={(value) => setCreditCost(Number(value))}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn mức credit" />
              </SelectTrigger>
              <SelectContent>
                {creditCostOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is-system-task" className="text-right">
              Task hệ thống
            </Label>
            <div className="col-span-3">
              <input
                type="checkbox"
                id="is-system-task"
                checked={isSystemTask}
                onChange={(e) => setIsSystemTask(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleUpdateTask} 
            disabled={
              isLoading || 
              !name.trim() || 
              !description.trim() || 
              !category.trim() ||
              !selectedAgentId ||
              (taskType === 'pretrained_configurable' && !executionConfig.trim())
            }
          >
            {isLoading ? 'Đang cập nhật...' : t('update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
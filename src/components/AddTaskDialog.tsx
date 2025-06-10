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
import { CreateTaskRequest, TaskType } from '@/services/taskService';
import { X, Upload } from 'lucide-react';
import { getAgents } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { Agent } from '@/types';
import { toast } from "sonner";
import { useTheme } from '@/hooks/useTheme';

interface AddTaskDialogProps {
  onClose: () => void;
  onSubmit: (taskData: CreateTaskRequest) => Promise<void>;
}

export const AddTaskDialog = ({ onClose, onSubmit }: AddTaskDialogProps) => {
  const { t } = useLanguage();
  const { workspace } = useSelectedWorkspace();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('external_webhook');
  const [executionConfig, setExecutionConfig] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [category, setCategory] = useState('Social Media');
  const [isLoading, setIsLoading] = useState(false);
  const [creditCost, setCreditCost] = useState(5);
  const [isSystemTask, setIsSystemTask] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [imgUrl, setImgUrl] = useState('');

  const creditCostOptions = [
    { value: 5, label: 'Basic (5 credits)' },
    { value: 10, label: 'Standard (10 credits)' },
    { value: 20, label: 'Premium (20 credits)' }
  ];

  const taskTypeOptions = [
    { value: 'external_webhook', label: 'External Webhook' },
    { value: 'pretrained_configurable', label: 'Pretrained Configurable' },
    { value: 'prompt_template', label: 'Prompt Template' }
  ];

  const categoryOptions = [
    'Social Media',
    'Marketing',
    'Content Creation',
    'Data Analysis',
    'Customer Service',
    'Other'
  ];

  useEffect(() => {
    const fetchAgents = async () => {
      if (workspace?.id) {
        try {
          const response = await getAgents(workspace.id);
          setAgents(response.data || []);
        } catch (error) {
          console.error('Lỗi khi tải danh sách agents:', error);
        }
      }
    };
    fetchAgents();
  }, [workspace?.id]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          // Validate JSON
          const jsonData = JSON.parse(content);
          // Kiểm tra xem JSON có phải là object không
          if (typeof jsonData !== 'object' || jsonData === null) {
            throw new Error('JSON phải là một object');
          }
          setExecutionConfig(content);
        } catch (error) {
          console.error('Lỗi khi đọc file JSON:', error);
          toast.error("File JSON không hợp lệ", {
            description: "File phải chứa một JSON object hợp lệ"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCreateTask = async () => {
    if (!name.trim() || !description.trim() || !category.trim() || !selectedAgentId) {
      toast.error("Vui lòng điền đầy đủ thông tin", {
        description: "Tên task, mô tả, danh mục và agent là bắt buộc"
      });
      return;
    }

    if (!webhookUrl.trim()) {
      toast.error("Vui lòng nhập webhook URL", {
        description: "Webhook URL là bắt buộc"
      });
      return;
    }

    try {
      new URL(webhookUrl.trim());
    } catch (e) {
      toast.error("Webhook URL không hợp lệ", {
        description: "Vui lòng nhập một URL hợp lệ"
      });
      return;
    }

    let executionConfigData = {};
    if (executionConfig.trim()) {
      try {
        executionConfigData = JSON.parse(executionConfig);
      } catch (e) {
        toast.error("Cấu hình JSON không hợp lệ", {
          description: "Vui lòng kiểm tra lại định dạng JSON"
        });
        return;
      }
    }
    
    try {
      setIsLoading(true);
      const taskData: CreateTaskRequest = {
        name: name.trim(),
        description: description.trim(),
        task_type: taskType,
        execution_config: executionConfigData,
        credit_cost: creditCost,
        category,
        is_system_task: isSystemTask,
        agent_id: selectedAgentId,
        webhook_url: webhookUrl.trim(),
        img_url: imgUrl.trim() || undefined
      };
      
      await onSubmit(taskData);
      
      // Reset form
      setName('');
      setDescription('');
      setTaskType('external_webhook');
      setExecutionConfig('');
      setPromptContent('');
      setCategory('Social Media');
      setCreditCost(5);
      setIsSystemTask(true);
      setSelectedAgentId('');
      setWebhookUrl('');
      setImgUrl('');
      onClose();
    } catch (error) {
      console.error('Lỗi khi tạo task:', error);
      toast.error("Lỗi khi tạo task", {
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
          <DialogTitle>{t('addTask')}</DialogTitle>
          <DialogDescription>
            {t('createTask')}
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
                {taskTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Danh mục
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="img-url" className="text-right">
              URL ảnh
            </Label>
            <Input
              id="img-url"
              className="col-span-3"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="Nhập URL ảnh (tùy chọn)"
            />
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
            onClick={handleCreateTask} 
            disabled={
              isLoading || 
              !name.trim() || 
              !description.trim() || 
              !category.trim() ||
              !selectedAgentId ||
              !webhookUrl.trim() ||
              !executionConfig.trim()
            }
            className={`${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white`}
          >
            {isLoading ? 'Đang tạo...' : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

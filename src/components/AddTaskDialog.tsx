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
import { CreateTaskRequest, TaskType, Task } from '@/services/taskService';
import { X, Upload } from 'lucide-react';
import { getAgents } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { Agent } from '@/types';
import { toast } from "sonner";
import { useTheme } from '@/hooks/useTheme';

interface AddTaskDialogProps {
  onClose: () => void;
  onSubmit: (taskData: CreateTaskRequest) => Promise<void>;
  initialData?: Task | null;
}

export const AddTaskDialog = ({ onClose, onSubmit, initialData }: AddTaskDialogProps) => {
  const { t } = useLanguage();
  const { workspace } = useSelectedWorkspace();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [taskType, setTaskType] = useState<TaskType>(initialData?.task_type || 'external_webhook');
  const [executionConfig, setExecutionConfig] = useState(initialData?.execution_config ? JSON.stringify(initialData.execution_config, null, 2) : '');
  const [promptContent, setPromptContent] = useState('');
  const [category, setCategory] = useState(initialData?.category || 'Social Media');
  const [isLoading, setIsLoading] = useState(false);
  const [creditCost, setCreditCost] = useState(initialData?.credit_cost || 5);
  const [isSystemTask, setIsSystemTask] = useState(initialData?.is_system_task ?? true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialData?.agent_id || '');
  const [webhookUrl, setWebhookUrl] = useState(initialData?.webhook_url || '');
  const [imgUrl, setImgUrl] = useState(initialData?.img_url || '');

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
        try {
          const response = await getAgents(1, 100);
          setAgents(Array.isArray(response.data?.data) ? response.data.data : []);
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
    {/*
      - `DialogContent` sẽ tự xử lý việc cuộn khi nội dung quá dài.
      - Thêm class `no-scrollbar` mà chúng ta đã tạo trước đây để ẩn thanh cuộn.
    */}
    <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col no-scrollbar">
      <DialogHeader className="p-6 pb-4 flex-shrink-0">
        <DialogTitle className="text-2xl">{t('addTask')}</DialogTitle>
        <DialogDescription>{t('createTask')}</DialogDescription>
      </DialogHeader>
  
      {/*
        - Bỏ cấu trúc grid 2 cột lặp lại.
        - Dùng `space-y-6` để tạo khoảng cách nhất quán giữa các nhóm trường.
      */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6 no-scrollbar">
        {/* --- Nhóm Tên và Mô tả --- */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="task-name" className="font-semibold">Tên task</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Tạo video giới thiệu sản phẩm"
              autoFocus
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="task-description" className="font-semibold">Mô tả</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết về mục đích và yêu cầu của task..."
              rows={3}
              className="mt-2"
            />
          </div>
        </div>
  
        {/* --- Nhóm Agent và Loại Task (trên 1 hàng để tiết kiệm không gian) --- */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="agent" className="font-semibold">Agent</Label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger id="agent" className="mt-2">
                <SelectValue placeholder="Chọn agent thực thi" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="task-type" className="font-semibold">Loại task</Label>
            <Select value={taskType} onValueChange={(value: TaskType) => setTaskType(value)}>
              <SelectTrigger id="task-type" className="mt-2">
                <SelectValue placeholder="Chọn loại task" />
              </SelectTrigger>
              <SelectContent>
                {taskTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* --- Nhóm Webhook và Cấu hình JSON --- */}
        <div className="space-y-4">
            <div>
                <Label htmlFor="webhook-url" className="font-semibold">Webhook URL</Label>
                <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-endpoint.com/webhook"
                    className="mt-2"
                />
            </div>
            <div>
                <Label htmlFor="execution-config" className="font-semibold">Cấu hình JSON</Label>
                <Textarea
                    id="execution-config"
                    value={executionConfig}
                    onChange={(e) => setExecutionConfig(e.target.value)}
                    placeholder='{ "key": "value", "prompt": "Nội dung prompt..." }'
                    rows={8}
                    className="mt-2 font-mono text-sm bg-muted/50"
                />
            </div>
        </div>

        {/* --- Nhóm Category và Credit Cost --- */}
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <Label htmlFor="category" className="font-semibold">Danh mục</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="mt-2">
                        <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                        {categoryOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="credit-cost" className="font-semibold">Chi phí credit</Label>
                <Select value={creditCost.toString()} onValueChange={(value) => setCreditCost(parseInt(value))}>
                    <SelectTrigger id="credit-cost" className="mt-2">
                        <SelectValue placeholder="Chọn chi phí credit" />
                    </SelectTrigger>
                    <SelectContent>
                        {creditCostOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* --- Nhóm System Task và Image URL --- */}
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="system-task"
                    checked={isSystemTask}
                    onChange={(e) => setIsSystemTask(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="system-task" className="font-semibold">Task hệ thống</Label>
            </div>
            <div>
                <Label htmlFor="image-url" className="font-semibold">URL hình ảnh</Label>
                <Input
                    id="image-url"
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                />
            </div>
        </div>
        
        {/* ... Các trường khác có thể thêm vào đây theo cấu trúc tương tự ... */}
  
      </div>
  
      {/*
        - `DialogFooter` sẽ luôn nằm ở dưới cùng.
        - Sử dụng các class gradient đã định nghĩa cho nút chính.
      */}
      <DialogFooter className="p-6 pt-4 border-t flex-shrink-0">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleCreateTask}
          disabled={isLoading || !name.trim() /* ... các điều kiện disable khác ... */}
          className="button-gradient-light dark:button-gradient-dark text-white"
        >
          {isLoading ? 'Đang tạo...' : t('create')}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};

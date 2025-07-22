import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateScheduledTask } from '@/hooks/useScheduledTasks';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { getAgentTasks } from '@/services/api';
import { usePublicAgents } from '@/hooks/useAgentsByFolders';
import { Agent, ApiTaskType } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';

interface CreateScheduledTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateScheduledTaskDialog: React.FC<CreateScheduledTaskDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { workspace } = useSelectedWorkspace();
  const createTask = useCreateScheduledTask();
  const { t } = useLanguage();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agentId, setAgentId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [time, setTime] = useState('09:00');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [cronExpression, setCronExpression] = useState('');
  const [autoCreateConversation, setAutoCreateConversation] = useState(true);
  const [conversationTemplate, setConversationTemplate] = useState('');
  const [message, setMessage] = useState('');

  // Thêm state cho input động theo execution_config
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Lấy danh sách agent public
  const { data: agentsData, isLoading: isLoadingAgents } = usePublicAgents(1, 1000);
  const agents = Array.isArray(agentsData?.data?.data) ? agentsData.data.data : [];
  const [tasks, setTasks] = useState<ApiTaskType[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Load tasks when agent changes
  useEffect(() => {
    if (agentId) {
      setLoadingTasks(true);
      getAgentTasks(agentId)
        .then(response => {
          setTasks(Array.isArray(response.data) ? response.data : []);
        })
        .catch(error => {
          setTasks([]);
          // Có thể show toast lỗi ở đây
        })
        .finally(() => {
          setLoadingTasks(false);
        });
    } else {
      setTasks([]);
    }
  }, [agentId]);

  // Khi taskId thay đổi, lấy execution_config của task đó để render input động
  useEffect(() => {
    const selectedTask = tasks.find(t => t.id === taskId);
    if (selectedTask && selectedTask.execution_config) {
      const initial: Record<string, string> = {};
      Object.keys(selectedTask.execution_config).forEach(key => {
        initial[key] = String(selectedTask.execution_config[key] || '');
      });
      setInputValues(initial);
    } else {
      setInputValues({});
    }
  }, [taskId, tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspace?.id || !agentId || (!taskId && !message.trim()) || !name.trim()) {
      return;
    }
    // Validate inputValues: tất cả key phải có value
    for (const key of Object.keys(inputValues)) {
      if (!inputValues[key] || inputValues[key].trim() === '') {
        // Có thể show toast hoặc báo lỗi ở đây
        return;
      }
    }

    const scheduleConfig: {
      time?: string;
      day_of_week?: number;
      day_of_month?: number;
      cron_expression?: string;
    } = {};
    
    switch (scheduleType) {
      case 'daily':
        scheduleConfig.time = time;
        break;
      case 'weekly':
        scheduleConfig.day_of_week = dayOfWeek;
        scheduleConfig.time = time;
        break;
      case 'monthly':
        scheduleConfig.day_of_month = dayOfMonth;
        scheduleConfig.time = time;
        break;
      case 'custom':
        scheduleConfig.cron_expression = cronExpression;
        break;
    }

    // Build conversation_template.input_data
    let conversationTemplate;
    if (taskId && Object.keys(inputValues).length > 0) {
      conversationTemplate = { input_data: inputValues };
    } else if (!taskId && message.trim()) {
      conversationTemplate = { input_data: { message: message.trim() } };
    }

    const taskData = {
      agent_id: agentId,
      workspace_id: workspace.id,
      task_id: taskId || undefined,
      name: name.trim(),
      description: description.trim(),
      schedule_type: scheduleType,
      schedule_config: scheduleConfig,
      auto_create_conversation: autoCreateConversation,
      conversation_template: conversationTemplate
    };

    try {
      await createTask.mutateAsync(taskData);
      handleClose();
    } catch (error) {
      console.error('Error creating scheduled task:', error);
    }
  };

  const handleClose = () => {
    // Reset form
    setName('');
    setDescription('');
    setAgentId('');
    setTaskId('');
    setScheduleType('daily');
    setTime('09:00');
    setDayOfWeek(1);
    setDayOfMonth(1);
    setCronExpression('');
    setAutoCreateConversation(true);
    setConversationTemplate('');
    setMessage('');
    setInputValues({}); // Reset input values
    
    onOpenChange(false);
  };

  const getScheduleConfigFields = () => {
    switch (scheduleType) {
      case 'daily':
        return (
          <div className="space-y-2">
            <Label htmlFor="time">Thời gian</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        );
      
      case 'weekly':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Ngày trong tuần</Label>
              <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Chủ nhật</SelectItem>
                  <SelectItem value="1">Thứ 2</SelectItem>
                  <SelectItem value="2">Thứ 3</SelectItem>
                  <SelectItem value="3">Thứ 4</SelectItem>
                  <SelectItem value="4">Thứ 5</SelectItem>
                  <SelectItem value="5">Thứ 6</SelectItem>
                  <SelectItem value="6">Thứ 7</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Thời gian</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
        );
      
      case 'monthly':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Ngày trong tháng</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Thời gian</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
        );
      
      case 'custom':
        return (
          <div className="space-y-2">
            <Label htmlFor="cronExpression">Cron Expression</Label>
            <Input
              id="cronExpression"
              placeholder="0 9 * * 1"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Format: phút giờ ngày tháng thứ (VD: 0 9 * * 1 = 9h sáng thứ 2)
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo task theo lịch trình</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên task *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên task"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả task"
                rows={3}
              />
            </div>
          </div>

          {/* Agent & Task Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent">{t('agent.name')} *</Label>
              <Select value={agentId} onValueChange={setAgentId} disabled={isLoadingAgents}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingAgents ? t('common.loading') : t('agent.name')} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(agents) && agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task">{t('tasks')}</Label>
              <Select value={taskId === '' ? 'none' : taskId} onValueChange={value => setTaskId(value === 'none' ? '' : value)} disabled={!agentId || loadingTasks}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTasks ? t('common.loading') : t('tasks')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common.none') || '---'}</SelectItem>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleType">Loại lịch trình *</Label>
              <Select value={scheduleType} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'custom') => setScheduleType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Hàng ngày</SelectItem>
                  <SelectItem value="weekly">Hàng tuần</SelectItem>
                  <SelectItem value="monthly">Hàng tháng</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh (Cron)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {getScheduleConfigFields()}
          </div>

          {/* Input động cho execution_config: chỉ hiển thị khi có taskId */}
          {taskId ? (
            <div className="space-y-2">
              <Label>{t('common.create')}</Label>
              {Object.keys(inputValues).length === 0 && (
                <div className="text-xs text-muted-foreground italic">Task này không yêu cầu input hoặc chưa có cấu hình.</div>
              )}
              {Object.keys(inputValues).map(key => (
                <div key={key} className="mb-2">
                  <Label htmlFor={`input-${key}`}>{key}</Label>
                  <Input
                    id={`input-${key}`}
                    value={inputValues[key]}
                    onChange={e => setInputValues({ ...inputValues, [key]: e.target.value })}
                    placeholder={`Nhập ${key}`}
                    className="bg-background text-foreground"
                    required
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="message">{t('scheduled_task.message_label')}</Label>
              <Textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t('scheduled_task.message_placeholder')}
                rows={3}
                required={!taskId}
              />
            </div>
          )}

          {/* Conversation Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoCreateConversation"
                checked={autoCreateConversation}
                onCheckedChange={setAutoCreateConversation}
              />
              <Label htmlFor="autoCreateConversation">Tự động tạo cuộc hội thoại mới</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={createTask.isPending || !name.trim() || !agentId || (!taskId && !message.trim())}
            >
              {createTask.isPending ? t('common.loading') : t('common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 
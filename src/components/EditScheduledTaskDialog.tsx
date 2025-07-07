import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUpdateScheduledTask } from '@/hooks/useScheduledTasks';
import { ScheduledTask, UpdateScheduledTaskRequest } from '@/services/api';

interface EditScheduledTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ScheduledTask;
}

export const EditScheduledTaskDialog: React.FC<EditScheduledTaskDialogProps> = ({
  open,
  onOpenChange,
  task
}) => {
  const updateTask = useUpdateScheduledTask();
  
  // Form state
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>(task.schedule_type);
  const [time, setTime] = useState(task.schedule_config.time || '09:00');
  const [dayOfWeek, setDayOfWeek] = useState(task.schedule_config.day_of_week || 1);
  const [dayOfMonth, setDayOfMonth] = useState(task.schedule_config.day_of_month || 1);
  const [cronExpression, setCronExpression] = useState(task.schedule_config.cron_expression || '');
  const [isEnabled, setIsEnabled] = useState(task.is_enabled);
  const [conversationTemplate, setConversationTemplate] = useState(
    task.conversation_template ? JSON.stringify(task.conversation_template.input_data, null, 2) : ''
  );

  // Update form when task changes
  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description);
      setScheduleType(task.schedule_type);
      setTime(task.schedule_config.time || '09:00');
      setDayOfWeek(task.schedule_config.day_of_week || 1);
      setDayOfMonth(task.schedule_config.day_of_month || 1);
      setCronExpression(task.schedule_config.cron_expression || '');
      setIsEnabled(task.is_enabled);
      setConversationTemplate(
        task.conversation_template ? JSON.stringify(task.conversation_template.input_data, null, 2) : ''
      );
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    const updateData: UpdateScheduledTaskRequest = {
      name: name.trim(),
      description: description.trim(),
      schedule_config: scheduleConfig,
      is_enabled: isEnabled
    };

    // Add conversation template if provided
    if (conversationTemplate.trim()) {
      try {
        const parsedTemplate = JSON.parse(conversationTemplate);
        updateData.conversation_template = {
          input_data: parsedTemplate
        };
      } catch (error) {
        console.error('Invalid JSON in conversation template:', error);
        return;
      }
    }

    try {
      await updateTask.mutateAsync({ taskId: task.id, data: updateData });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating scheduled task:', error);
    }
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
          <DialogTitle>Chỉnh sửa task theo lịch trình</DialogTitle>
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

          {/* Status */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isEnabled"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
              <Label htmlFor="isEnabled">Bật task</Label>
            </div>
          </div>

          {/* Conversation Template */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conversationTemplate">Template cuộc hội thoại (JSON)</Label>
              <Textarea
                id="conversationTemplate"
                value={conversationTemplate}
                onChange={(e) => setConversationTemplate(e.target.value)}
                placeholder='{"key": "value"}'
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Dữ liệu JSON sẽ được gửi khi tạo cuộc hội thoại mới
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={updateTask.isPending || !name.trim()}
            >
              {updateTask.isPending ? "Đang cập nhật..." : "Cập nhật task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 
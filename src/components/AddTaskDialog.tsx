
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { ListPlus } from 'lucide-react';
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
import { agents } from '@/services/mockData';

export const AddTaskDialog = () => {
  const { t } = useLanguage();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [open, setOpen] = useState(false);

  const handleCreateTask = () => {
    if (taskTitle.trim()) {
      console.log('Creating task:', { 
        title: taskTitle, 
        description: taskDescription,
        assignedAgentId,
        dueDate
      });
      // In a real app, this would save the task
    }
    setTaskTitle('');
    setTaskDescription('');
    setAssignedAgentId('');
    setDueDate('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ListPlus className="h-[1rem] w-[1rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addTask')}</DialogTitle>
          <DialogDescription>
            {t('createTask')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-title" className="text-right">
              {t('taskTitle')}
            </Label>
            <Input
              id="task-title"
              className="col-span-3"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-description" className="text-right">
              {t('taskDescription')}
            </Label>
            <Textarea
              id="task-description"
              className="col-span-3"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assigned-agent" className="text-right">
              {t('assignTo')}
            </Label>
            <Select onValueChange={setAssignedAgentId} value={assignedAgentId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="due-date" className="text-right">
              {t('dueDate')}
            </Label>
            <Input
              id="due-date"
              type="date"
              className="col-span-3"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleCreateTask} disabled={!taskTitle.trim()}>
            {t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

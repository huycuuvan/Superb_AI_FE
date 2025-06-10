import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { EditTaskDialog } from '@/components/EditTaskDialog';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTasks, createTask, updateTask, deleteTask, CreateTaskRequest, UpdateTaskRequest, Task } from '@/services/taskService';
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { agents } from "@/services/mockData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';

export const Tasks = () => {
  const { t } = useLanguage();
  const { workspace } = useSelectedWorkspace();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: tasksData, isLoading, refetch: fetchTasks } = useQuery({
    queryKey: ['tasks', workspace?.id],
    queryFn: () => getTasks(),
    enabled: !!workspace?.id,
  });

  const tasks = tasksData?.data || [];

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    try {
      await createTask(taskData);
      toast.success("Tạo task thành công", {
        description: "Task đã được tạo và sẵn sàng sử dụng"
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      fetchTasks();
    } catch (error) {
      console.error('Lỗi khi tạo task:', error);
      toast.error("Lỗi khi tạo task", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại"
      });
    }
  };

  const handleUpdateTask = async (taskData: UpdateTaskRequest) => {
    try {
      await updateTask(taskData.id, taskData);
      toast.success("Cập nhật task thành công", {
        description: "Task đã được cập nhật thành công"
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      fetchTasks();
    } catch (error) {
      console.error('Lỗi khi cập nhật task:', error);
      toast.error("Lỗi khi cập nhật task", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại"
      });
    }
  };

  const confirmDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setShowConfirmDeleteDialog(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      toast.success("Xóa task thành công", {
        description: "Task đã được xóa khỏi hệ thống"
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      fetchTasks();
      setShowConfirmDeleteDialog(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Lỗi khi xóa task:', error);
      toast.error("Lỗi khi xóa task", {
        description: "Vui lòng thử lại sau"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('tasks')}</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addTask')}
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={t('searchTasks')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? 'Không tìm thấy task nào' : 'Chưa có task nào'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{task.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {task.category}
                    </span>
                    <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                      {task.credit_cost} credits
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDeleteTask(task)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddDialogOpen && (
        <AddTaskDialog
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {isEditDialogOpen && selectedTask && (
        <EditTaskDialog
          task={selectedTask}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedTask(null);
          }}
          onSubmit={handleUpdateTask}
        />
      )}

      {/* Confirm Delete Dialog */}
      <Dialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa Task</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa task "{taskToDelete?.name}" không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDeleteDialog(false)} disabled={isDeleting}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeleteTask} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

const TaskList = ({ tasks, isLoading }: { tasks: Task[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Không tìm thấy công việc nào</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        task ? <TaskCard key={task.id} task={task} /> : null
      ))}
    </div>
  );
};

const TaskCard = ({ task }: { task: Task }) => {
  const assignedAgent = task.assignedAgentId 
    ? agents.find(agent => agent.id === task.assignedAgentId) 
    : undefined;
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return 'N/A'; // Or return '' or any other placeholder
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date'; // Handle cases where dateString is present but invalid
      }
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Error'; // Handle any other potential errors during formatting
    }
  };
  
  let statusColor = '';
  switch (task.status) {
    case 'todo':
      statusColor = 'bg-orange-100 text-orange-800';
      break;
    case 'in-progress':
      statusColor = 'bg-blue-100 text-blue-800';
      break;
    case 'completed':
      statusColor = 'bg-green-100 text-green-800';
      break;
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor}`}>
              {task.status.replace('-', ' ')}
            </span>
            <span className="text-xs text-muted-foreground">
              Created on {formatDate(task.createdAt)}
            </span>
          </div>
          
          <h3 className="font-medium">{task.title || task.name}</h3>
          
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-4 mt-4 md:mt-0">
          {assignedAgent ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage 
                  src={assignedAgent.avatar} 
                  alt={assignedAgent.name} 
                />
                <AvatarFallback className="bg-teampal-100 text-teampal-500 text-xs">
                  {assignedAgent.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{assignedAgent.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
              </svg>
              <span className="text-sm">Unassigned</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Assign</Button>
            <Button variant="outline" size="sm">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor"></path>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  MoreVertical, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  useScheduledTasks, 
  useToggleScheduledTask, 
  useRunScheduledTaskNow, 
  useDeleteScheduledTask,
  useUpdateScheduledTaskStatus
} from '@/hooks/useScheduledTasks';
import { ScheduledTask } from '@/services/api';
import { websocketService } from '@/services/websocket';
import { CreateScheduledTaskDialog } from './CreateScheduledTaskDialog';
import { EditScheduledTaskDialog } from './EditScheduledTaskDialog';
import { WS_URL } from '@/config/api'; // Thêm dòng này nếu chưa có
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export const ScheduledTasksManager: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set());
  const [taskRunMapping, setTaskRunMapping] = useState<Record<string, { thread_id: string; task_run_id: string }>>({});
  const taskRunMappingRef = useRef(taskRunMapping);
  useEffect(() => { taskRunMappingRef.current = taskRunMapping; }, [taskRunMapping]);
  const [taskRunStatus, setTaskRunStatus] = useState<Record<string, { status: 'idle' | 'running' | 'failed' | 'success', error?: string }>>({});

  const { data: scheduledTasksData, isLoading, error } = useScheduledTasks();
  const toggleTask = useToggleScheduledTask();
  const runTaskNow = useRunScheduledTaskNow();
  const deleteTask = useDeleteScheduledTask();
  const updateTaskStatus = useUpdateScheduledTaskStatus();

  const scheduledTasks = scheduledTasksData?.data || [];

  const handleToggleTask = (taskId: string, enabled: boolean) => {
    const task = scheduledTasks.find(t => t.id === taskId);
    
    // Nếu task đang bị paused và muốn kích hoạt lại
    if (task?.status === 'paused' && enabled) {
      updateTaskStatus.mutate({ taskId, status: 'active', is_enabled: true });
    } else {
      // Xử lý bật/tắt bình thường
      toggleTask.mutate({ taskId, enabled });
    }
  };

  // WebSocket handler cho scheduled task status
  useEffect(() => {
    const handler = (data: {
      thread_id: string;
      task_run_id: string;
      status: string;
      error?: string;
      message?: string;
    }) => {
      const { thread_id, task_run_id, status, error, message } = data;
      // Tìm scheduled task ID từ mapping mới nhất
      let scheduledTaskId = Object.keys(taskRunMappingRef.current).find(
        key => taskRunMappingRef.current[key].thread_id === thread_id
      );
      if (!scheduledTaskId && task_run_id) {
        scheduledTaskId = Object.keys(taskRunMappingRef.current).find(
          key => taskRunMappingRef.current[key].task_run_id === task_run_id
        );
      }
      if (scheduledTaskId) {
        if (status === 'completed') {
          setTaskRunStatus(prev => ({ ...prev, [scheduledTaskId]: { status: 'success' } }));
          setRunningTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(scheduledTaskId);
            return newSet;
          });
          toast.success('Task hoàn thành thành công!');
        } else if (status === 'failed') {
          setTaskRunStatus(prev => ({ ...prev, [scheduledTaskId]: { status: 'failed', error: message || error } }));
          setRunningTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(scheduledTaskId);
            return newSet;
          });
          toast.error(message || error || 'Task thất bại');
        }
        // Xóa mapping khi hoàn thành
        setTaskRunMapping(prev => {
          const newMapping = { ...prev };
          delete newMapping[scheduledTaskId!];
          return newMapping;
        });
      }
    };
    websocketService.handleScheduledTaskStatus(handler);
    return () => {
      websocketService.unsubscribe('status', handler);
      websocketService.disconnect(); // Đảm bảo disconnect khi unmount
    };
  }, []); // Đăng ký handler chỉ 1 lần khi mount

  const handleRunNow = async (taskId: string) => {
    console.log('[DEBUG] Bắt đầu handleRunNow với taskId:', taskId);
    setTaskRunStatus(prev => ({ ...prev, [taskId]: { status: 'running' } }));
    try {
      const response = await runTaskNow.mutateAsync(taskId);
      console.log('[DEBUG] API run-now trả về:', response);

      // Lấy các trường có thể có từ response
      const thread_id = response.thread_id;
      const task_run_id = response.task_run_id;
      // Kiểm tra exec_status có tồn tại không
      const exec_status = 'exec_status' in response ? response.exec_status : undefined;
      const execMessage = response.message;

      // Nếu BE trả về exec_status completed (ví dụ với message schedule), hiển thị thành công luôn
      if (exec_status === 'completed') {
        setTaskRunStatus(prev => ({ ...prev, [taskId]: { status: 'success' } }));
        setRunningTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
        toast.success(execMessage || 'Task hoàn thành thành công!');
        // Không cần join websocket nếu đã completed
        return;
      }

      // Nếu chưa completed, join websocket như cũ
      setTaskRunMapping(prev => ({
        ...prev,
        [taskId]: { thread_id, task_run_id }
      }));

      setTimeout(() => {
        const token = localStorage.getItem('token');
        const wsUrl = `${WS_URL}?token=${token}&thread_id=${thread_id}`;
        if (websocketService.getConnectionState() === 'open') {
          console.log('[DEBUG] Socket đã open, gọi joinThread ngay');
          websocketService.joinThread(thread_id);
        } else {
          console.log('[DEBUG] Socket chưa open, sẽ subscribe onOpen');
          const onOpen = (state: string) => {
            if (state === 'open') {
              console.log('[DEBUG] Socket vừa open, gọi joinThread');
              websocketService.joinThread(thread_id);
              websocketService.unsubscribeFromStateChange(onOpen);
            }
          };
          websocketService.subscribeToStateChange(onOpen);
          websocketService.connect(wsUrl);
        }
      }, 0);

      setRunningTasks(prev => new Set(prev).add(taskId));
    } catch (error) {
      setTaskRunStatus(prev => ({ ...prev, [taskId]: { status: 'failed', error: 'Không thể chạy task. Vui lòng thử lại.' } }));
      console.error('[DEBUG] Lỗi khi chạy run-now:', error);
      toast.error('Không thể chạy task. Vui lòng thử lại.');
    }
  };

  const handleDelete = (taskId: string) => {
    deleteTask.mutate(taskId);
  };

  const handleEdit = (task: ScheduledTask) => {
    setSelectedTask(task);
    setShowEditDialog(true);
  };

  const getScheduleTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Hàng ngày';
      case 'weekly': return 'Hàng tuần';
      case 'monthly': return 'Hàng tháng';
      case 'custom': return 'Tùy chỉnh';
      default: return type;
    }
  };

  const getScheduleConfigText = (task: ScheduledTask) => {
    const { schedule_type, schedule_config } = task;
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    
    switch (schedule_type) {
      case 'daily':
        return `Mỗi ngày lúc ${schedule_config.time}`;
      case 'weekly':
        return `${days[schedule_config.day_of_week || 0]} lúc ${schedule_config.time}`;
      case 'monthly':
        return `Ngày ${schedule_config.day_of_month} hàng tháng lúc ${schedule_config.time}`;
      case 'custom':
        return `Cron: ${schedule_config.cron_expression}`;
      default:
        return 'Không xác định';
    }
  };

  const getStatusIcon = (task: ScheduledTask) => {
    if (task.status === 'paused') {
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
    return task.is_enabled ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-400" />
    );
  };

  const getStatusBadge = (task: ScheduledTask) => {
    if (task.status === 'paused') {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Tạm dừng</Badge>;
    }
    return (
      <Badge variant={task.is_enabled ? "default" : "secondary"}>
        {task.is_enabled ? "Đang hoạt động" : "Đã tắt"}
      </Badge>
    );
  };

  const getStatusText = (task: ScheduledTask) => {
    if (task.status === 'paused') {
      return 'Tạm dừng do lỗi';
    }
    return task.is_enabled ? 'Đang hoạt động' : 'Đã tắt';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500">Lỗi khi tải danh sách task</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task theo lịch trình</h2>
          <p className="text-muted-foreground">
            Quản lý các task tự động chạy theo lịch trình
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo task mới
        </Button>
      </div>

      {/* Task List */}
      {scheduledTasks.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có task nào</h3>
              <p className="text-muted-foreground mb-4">
                Tạo task đầu tiên để bắt đầu tự động hóa công việc
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo task đầu tiên
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scheduledTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{task.name}</CardTitle>
                      {getStatusBadge(task)}
                      <Badge variant="outline">
                        {getScheduleTypeLabel(task.schedule_type)}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {task.description}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(task)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRunNow(task.id)}
                        disabled={runTaskNow.isPending || runningTasks.has(task.id)}
                      >
                        {runningTasks.has(task.id) ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        {runningTasks.has(task.id) ? 'Đang chạy...' : 'Chạy ngay'}
                      </DropdownMenuItem>
                      {task.status === 'paused' ? (
                        <DropdownMenuItem 
                          onClick={() => handleToggleTask(task.id, true)}
                          disabled={updateTaskStatus.isPending}
                        >
                          {updateTaskStatus.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          {updateTaskStatus.isPending ? 'Đang kích hoạt...' : 'Kích hoạt lại'}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleToggleTask(task.id, !task.is_enabled)}
                          disabled={toggleTask.isPending}
                        >
                          {task.is_enabled ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Tắt
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Bật
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa task "{task.name}"? 
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(task.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Paused Warning */}
                  {task.status === 'paused' && (
                    <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-800">Task đã bị tạm dừng</p>
                        <p className="text-orange-700">
                          Task này đã thất bại {task.failed_runs} lần liên tiếp và đã được tạm dừng tự động. 
                          Vui lòng kiểm tra cấu hình và thử lại.
                        </p>
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-orange-300 text-orange-700 hover:bg-orange-100"
                            onClick={() => handleToggleTask(task.id, true)}
                            disabled={updateTaskStatus.isPending}
                          >
                            {updateTaskStatus.isPending ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 mr-1" />
                            )}
                            {updateTaskStatus.isPending ? 'Đang kích hoạt...' : 'Kích hoạt lại ngay'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Schedule Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{getScheduleConfigText(task)}</span>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task)}
                    <span className="text-sm">
                      {getStatusText(task)}
                    </span>
                  </div>
                  
                  {/* Statistics */}
                  {(task.total_runs !== undefined || task.last_run_at) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {task.total_runs !== undefined && (
                        <div className="flex items-center gap-1">
                          <span>Tổng: {task.total_runs}</span>
                          {task.successful_runs !== undefined && (
                            <span className="text-green-600">✓ {task.successful_runs}</span>
                          )}
                          {task.failed_runs !== undefined && (
                            <span className="text-red-600">✗ {task.failed_runs}</span>
                          )}
                        </div>
                      )}
                      {task.last_run_at && (
                        <div>
                          Lần cuối: {new Date(task.last_run_at).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    {taskRunStatus[task.id]?.status === 'failed' ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-600 rounded font-medium cursor-pointer">
                              <AlertCircle className="w-4 h-4 mr-1 text-red-500" /> Thất bại
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {taskRunStatus[task.id]?.error || 'Task thất bại'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : taskRunStatus[task.id]?.status === 'running' ? (
                      <Button size="sm" variant="outline" disabled>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Đang chạy...
                      </Button>
                    ) : taskRunStatus[task.id]?.status === 'success' ? (
                      <Button size="sm" variant="outline" disabled className="border-green-500 text-green-600 bg-green-50">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-600" /> Thành công
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRunNow(task.id)}
                        disabled={runTaskNow.isPending || runningTasks.has(task.id) || task.status === 'paused'}
                      >
                        <Zap className="w-4 h-4 mr-1" /> Chạy thử
                      </Button>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Trạng thái:</span>
                      <Switch
                        checked={task.is_enabled}
                        onCheckedChange={(enabled) => handleToggleTask(task.id, enabled)}
                        disabled={toggleTask.isPending || updateTaskStatus.isPending || task.status === 'paused'}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Task Dialog */}
      <CreateScheduledTaskDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {/* Edit Task Dialog */}
      {selectedTask && (
        <EditScheduledTaskDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default ScheduledTasksManager; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getScheduledTasks,
  getScheduledTaskById,
  createScheduledTask,
  updateScheduledTask,
  enableScheduledTask,
  disableScheduledTask,
  runScheduledTaskNow,
  getScheduledTaskRuns,
  deleteScheduledTask,
  getRunningTasksCount,
  getRunningTasksList,
  CreateScheduledTaskRequest,
  UpdateScheduledTaskRequest,
  ScheduledTask,
  RunningTask,
} from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { websocketService } from "@/services/websocket";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

// Hook để lấy danh sách scheduled tasks
export const useScheduledTasks = () => {
  return useQuery({
    queryKey: ["scheduled-tasks"],
    queryFn: getScheduledTasks,
  });
};

// Hook để lấy chi tiết 1 scheduled task
export const useScheduledTask = (taskId: string) => {
  return useQuery({
    queryKey: ["scheduled-task", taskId],
    queryFn: () => getScheduledTaskById(taskId),
    enabled: !!taskId,
  });
};

// Hook để lấy lịch sử thực thi của scheduled task
export const useScheduledTaskRuns = (taskId: string) => {
  return useQuery({
    queryKey: ["scheduled-task-runs", taskId],
    queryFn: () => getScheduledTaskRuns(taskId),
    enabled: !!taskId,
  });
};

// Hook để lấy số lượng task đang chạy
export const useRunningTasksCount = () => {
  return useQuery({
    queryKey: ["running-tasks-count"],
    queryFn: getRunningTasksCount,
    refetchInterval: 30000, // Refetch mỗi 30 giây
  });
};

// Hook để lấy danh sách task đang chạy
export const useRunningTasksList = () => {
  return useQuery({
    queryKey: ["running-tasks-list"],
    queryFn: getRunningTasksList,
    refetchInterval: 10000, // Refetch mỗi 10 giây
  });
};

// Hook realtime số lượng task đang chạy qua WebSocket
export const useRunningTasksRealtime = () => {
  const [runningCount, setRunningCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const handler = (data: { type: string; content: string }) => {
      if (data.type === "running_count") {
        const payload = JSON.parse(data.content);
        if (payload.user_id === user?.id) {
          setRunningCount(payload.count);
        }
      }
    };
    websocketService.subscribe("running_count", handler);
    return () => websocketService.unsubscribe("running_count", handler);
  }, [user?.id]);

  useEffect(() => {
    if (!user) setRunningCount(0);
  }, [user]);

  return runningCount;
};

// Hook để tạo scheduled task
export const useCreateScheduledTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createScheduledTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      toast({
        title: "Thành công!",
        description: "Đã tạo task theo lịch trình thành công.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi!",
        description: `Không thể tạo task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook để cập nhật scheduled task
export const useUpdateScheduledTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: UpdateScheduledTaskRequest;
    }) => updateScheduledTask(taskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-task", taskId] });
      toast({
        title: "Thành công!",
        description: "Đã cập nhật task thành công.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi!",
        description: `Không thể cập nhật task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook để bật/tắt scheduled task
export const useToggleScheduledTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ taskId, enabled }: { taskId: string; enabled: boolean }) =>
      enabled ? enableScheduledTask(taskId) : disableScheduledTask(taskId),
    onSuccess: (_, { taskId, enabled }) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-task", taskId] });
      toast({
        title: "Thành công!",
        description: `Đã ${enabled ? "bật" : "tắt"} task thành công.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi!",
        description: `Không thể thay đổi trạng thái task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook để chạy ngay scheduled task
export const useRunScheduledTaskNow = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: runScheduledTaskNow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["running-tasks-count"] });
      queryClient.invalidateQueries({ queryKey: ["running-tasks-list"] });
      // Bỏ toast thành công ở đây, chỉ báo lỗi khi onError
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi!",
        description: `Không thể thực thi task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook để xóa scheduled task
export const useDeleteScheduledTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteScheduledTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      toast({
        title: "Thành công!",
        description: "Đã xóa task thành công.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi!",
        description: `Không thể xóa task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

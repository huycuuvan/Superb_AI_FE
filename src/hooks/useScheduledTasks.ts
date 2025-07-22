import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getScheduledTasks,
  getScheduledTaskById,
  createScheduledTask,
  updateScheduledTask,
  updateScheduledTaskStatus,
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
import { useEffect, useCallback, useState } from "react";
import { useSelectedWorkspace } from "@/hooks/useSelectedWorkspace";
import { WS_URL } from "@/config/api";

// Hook để lấy danh sách scheduled tasks với realtime updates
export const useScheduledTasks = () => {
  const queryClient = useQueryClient();
  const { workspace } = useSelectedWorkspace();
  const { user } = useAuth();

  // Tạo stable callback để xử lý task updates
  const handleTaskUpdate = useCallback(
    (data: {
      workspace_id: string;
      task_id: string;
      total_runs: number;
      successful_runs: number;
      failed_runs: number;
      last_run_at?: string;
      next_run_at?: string;
      thread_id?: string;
      status?: "active" | "paused";
    }) => {
      // Kiểm tra xem update có thuộc về workspace hiện tại không
      if (!workspace || data.workspace_id !== workspace.id) return;

      console.log(
        "[DEBUG] Nhận được task update cho workspace hiện tại:",
        data
      );

      // Sử dụng Promise để đảm bảo cập nhật state an toàn
      Promise.resolve().then(() => {
        queryClient.setQueryData<{ data: ScheduledTask[] }>(
          ["scheduled-tasks"],
          (oldData) => {
            if (!oldData?.data) return oldData;

            return {
              ...oldData,
              data: oldData.data.map((task) =>
                task.id === data.task_id
                  ? {
                      ...task,
                      total_runs: data.total_runs,
                      successful_runs: data.successful_runs,
                      failed_runs: data.failed_runs,
                      last_run_at: data.last_run_at || task.last_run_at,
                      next_run_at: data.next_run_at || task.next_run_at,
                      status: data.status || task.status,
                    }
                  : task
              ),
            };
          }
        );
      });
    },
    [workspace, queryClient]
  );

  useEffect(() => {
    if (!workspace || !user) return;

    // Thiết lập kết nối WebSocket
    const token = localStorage.getItem("token");
    if (!token) return;

    // Kết nối WebSocket nếu chưa kết nối
    const wsUrl = `${WS_URL}?token=${token}`;
    if (websocketService.getConnectionState() !== "open") {
      websocketService.connect(wsUrl);
    }

    // Đăng ký lắng nghe task updates
    websocketService.handleScheduledTaskUpdate(handleTaskUpdate);

    return () => {
      websocketService.unsubscribe("scheduled_task_update", handleTaskUpdate);
    };
  }, [workspace?.id, user?.id, handleTaskUpdate]);

  const { data, error, isLoading } = useQuery({
    queryKey: ["scheduled-tasks"],
    queryFn: getScheduledTasks,
    staleTime: 5 * 60 * 1000, // Cache trong 5 phút
    gcTime: Infinity, // Giữ cache vô thời hạn
    refetchOnWindowFocus: false, // Không fetch lại khi focus window
  });

  return { data, error, isLoading };
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
    if (!user) {
      setRunningCount(0);
      return;
    }

    const handleRunningCount = (data: { type: string; content: string }) => {
      if (data.type === "running_count") {
        try {
          const payload = JSON.parse(data.content);
          if (payload.user_id === user.id) {
            setRunningCount(payload.count);
          }
        } catch (error) {
          console.error("Error parsing running_count payload:", error);
        }
      }
    };

    // Thiết lập kết nối WebSocket nếu chưa kết nối
    const token = localStorage.getItem("token");
    if (token && websocketService.getConnectionState() !== "open") {
      websocketService.connect(`${WS_URL}?token=${token}`);
    }

    websocketService.subscribe("running_count", handleRunningCount);

    return () => {
      websocketService.unsubscribe("running_count", handleRunningCount);
    };
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

// Hook để cập nhật status của scheduled task
export const useUpdateScheduledTaskStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      taskId,
      status,
      is_enabled,
    }: {
      taskId: string;
      status: "active" | "paused";
      is_enabled?: boolean;
    }) => updateScheduledTaskStatus(taskId, status, is_enabled),
    onSuccess: (_, { taskId, status }) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-task", taskId] });
      toast({
        title: "Thành công!",
        description: `Đã cập nhật trạng thái task thành ${
          status === "active" ? "hoạt động" : "tạm dừng"
        }.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi!",
        description: `Không thể cập nhật trạng thái task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

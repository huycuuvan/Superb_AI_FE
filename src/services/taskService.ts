/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_BASE_URL } from "@/config/api";
import { Task } from "@/types";
import { handleApiError } from "@/utils/errorHandler";

export type TaskType = "prompt_template" | "pretrained_configurable";

export interface ExecutionConfig {
  form_fields?: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
  }>;
  action_type?: string;
  credit_cost?: number;
  agent_id?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  required: boolean;
  options?: string[];
}

export interface CreateTaskRequest {
  name: string;
  description: string;
  task_type: TaskType;
  execution_config: Record<string, any>;
  credit_cost: number;
  category: string;
  is_system_task: boolean;
  agent_id: string;
}

export interface UpdateTaskRequest extends CreateTaskRequest {
  id: string;
}

export const createTask = async (
  taskData: CreateTaskRequest
): Promise<{ data: Task }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getTasks = async (): Promise<{ data: Task[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getTasksByAgentId = async (
  agentId: string
): Promise<{ data: Task[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/tasks/agent/${agentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const updateTask = async (
  taskId: string,
  taskData: UpdateTaskRequest
): Promise<{ data: Task }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};

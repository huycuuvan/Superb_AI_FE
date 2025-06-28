/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import {
  Workspace,
  Agent,
  ModelConfig,
  Thread,
  ChatMessage,
  ApiMessage,
  ApiTaskType,
  User,
  TaskRun,
} from "@/types";
import { handleApiError } from "@/utils/errorHandler";

export const registerWithEmail = async ({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) => {
  const res = await fetch(API_ENDPOINTS.auth.register, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const registerWithGoogle = async () => {
  const res = await fetch(API_ENDPOINTS.auth.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

// Thêm các hàm API khác ở đây
export const createWorkspace = async (workspaceData: {
  name: string;
  businessType: string;
  language: string;
  location: string;
  description: string;
  products?: string;
  url?: string;
  logo?: File;
}): Promise<{ data: Workspace }> => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.workspace.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(workspaceData),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const getAgents = async (
  workspaceId: string
): Promise<{ data: Agent[] }> => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.agents.list, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const createAgent = async (agentData: {
  name: string;
  workspace_id: string;
  folder_id: string;
  role_description: string;
  job_brief: string;
  language: string;
  position: string;
  status: string;
  greeting_message?: string;
  model_config?: ModelConfig;
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.agents.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(agentData),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const sendChatMessage = async (agentId: string, message: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.agents.chat, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ agentId, message }),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export interface FolderResponse {
  data: {
    id: string;
    name: string;
    workspace_id: string;
    created_at: string;
    updated_at: string;
  }[];
}

export const getFolders = async (
  workspaceId: string
): Promise<FolderResponse> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/folders/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ workspace_id: workspaceId }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export interface WorkspaceResponse {
  data: Workspace[] | null;
  status: number;
}

export const getWorkspace = async (): Promise<WorkspaceResponse> => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/workspaces`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export interface CreateFolderRequest {
  name: string;
  description: string;
  folder_type: "custom";
  status: "workspace_shared" | "system_shared";
  workspace_id?: string;
}

export const createFolder = async (
  folderData: CreateFolderRequest
): Promise<{ data: FolderResponse["data"][0] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/folders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(folderData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export interface FolderDetailResponse {
  data: {
    id: string;
    name: string;
    workspace_id: string;
    description?: string;
    order?: number;
    pin?: number;
    status?: number;
  };
}

export const getFolderDetail = async (
  folderId: string,
  workspaceId: string
): Promise<FolderDetailResponse> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  order?: number;
  pin?: number;
  status?: string;
  folder_type?: string;
}

export const updateFolder = async (
  folderId: string,
  folderData: UpdateFolderRequest
): Promise<{ data: FolderDetailResponse["data"] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(folderData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const deleteFolder = async (
  folderId: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return { success: true };
};

export const getAgentsByFolder = async (folderId: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.agents.byFolder, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ folder_id: folderId }),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const getAgentById = async (
  agentId: string
): Promise<{ data: Agent }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.agents.getById(agentId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export interface UpdateAgentRequest {
  name?: string;
  role_description?: string;
  instructions?: string;
  status?: string;
  model_config?: ModelConfig;
  folder_id?: string;
  greeting_message?: string;
}

export const updateAgent = async (
  agentId: string,
  agentData: UpdateAgentRequest
): Promise<{ data: Agent }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.agents.update(agentId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(agentData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const deleteAgent = async (
  agentId: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_ENDPOINTS.agents.delete(agentId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  // Assuming the delete endpoint returns a success indicator, adjust if needed.
  // For simplicity, assuming a successful response means deletion was successful.
  return { success: response.ok };
};

export interface WorkspaceProfile {
  workspace_id: string;
  brand_name: string;
  business_type: string;
  default_language_code: string;
  default_location_code: string;
  brand_description: string;
  brand_products_services: string;
  website_url?: string;
  brand_logo_url?: string;
}

export const createWorkspaceProfile = async (
  profileData: WorkspaceProfile
): Promise<{ data: WorkspaceProfile }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.workspace.profile, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getWorkspaceProfile = async (
  workspaceId: string
): Promise<{ data: WorkspaceProfile | null }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    API_ENDPOINTS.workspace.getProfile(workspaceId),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Handle 404 specifically - means profile doesn't exist
  if (response.status === 404) {
    return { data: null };
  }

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const updateWorkspaceProfile = async (
  workspaceId: string,
  profileData: Partial<WorkspaceProfile>
): Promise<{ data: WorkspaceProfile }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    API_ENDPOINTS.workspace.updateProfile(workspaceId),
    {
      method: "PUT", // Hoặc PATCH tùy thuộc vào API server
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const createThread = async (threadData: {
  workspace_id: string;
  agent_id: string;
  title: string;
}): Promise<{ data: Thread }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.threads.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(threadData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const checkThreadExists = async (
  agentId: string,
  workspaceId: string
): Promise<{ exists: boolean; thread_id?: string }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_ENDPOINTS.threads.check}?agent_id=${agentId}&workspace_id=${workspaceId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    // Handle non-200 responses, perhaps the API returns 404 if not found
    if (response.status === 404) {
      return { exists: false };
    }
    await handleApiError(response);
    throw new Error("Lỗi khi kiểm tra thread tồn tại");
  }

  const data = await response.json();
  return data;
};

// New function to send message to thread
export const sendMessageToThread = async (
  threadId: string,
  messageContent: string
): Promise<{ data: ChatMessage }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/threads/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      thread_id: threadId,
      message_content: messageContent,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// New function to get messages for a thread
export const getThreadMessages = async (
  threadId: string
): Promise<{ data: ApiMessage[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.threads.messages(threadId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
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
): Promise<{ data: ApiTaskType[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found.");

  const response = await fetch(`${API_ENDPOINTS.tasks.base}/agent/${agentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};
// New function to get tasks for a specific agent
export const getAgentTasks = async (
  agentId: string
): Promise<{ data: any[] }> => {
  // TODO: Thay 'any[]' bằng kiểu dữ liệu chính xác cho tasks
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.tasks.byAgent(agentId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const createTask = async (
  taskData: Omit<ApiTaskType, "id" | "created_at" | "updated_at"> & {
    agent_id: string;
  }
): Promise<{ data: ApiTaskType }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found.");

  const response = await fetch(API_ENDPOINTS.tasks.create, {
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

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  task_type?: string;
  execution_config?: Record<string, unknown>;
  credit_cost?: number;
  category?: string;
  is_system_task?: boolean;
  assignedAgentId?: string;
  status?: "todo" | "in-progress" | "completed";
}

export const updateTask = async (
  taskId: string,
  taskData: UpdateTaskRequest
): Promise<{ data: ApiTaskType }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found.");

  const response = await fetch(API_ENDPOINTS.tasks.update(taskId), {
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

// New function to execute a task
export const executeTask = async (
  taskId: string,
  inputData: { [key: string]: string },
  threadId: string,
  extra?: { provider?: string; credential?: object }
): Promise<{
  message: string;
  status: number;
  task_run_id?: string;
  webhook_response?: any;
}> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const userStr = localStorage.getItem("user");
  if (!userStr) throw new Error("Không tìm thấy thông tin người dùng");
  const user = JSON.parse(userStr);

  const body: any = {
    task_id: taskId,
    input_data: inputData,
    thread_id: threadId,
    user_id: user.id,
  };
  if (extra?.provider) body.provider = extra.provider;
  if (extra?.credential) body.credential = extra.credential;

  const response = await fetch(API_ENDPOINTS.tasks.execute, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const deleteTask = async (
  taskId: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found.");

  const response = await fetch(API_ENDPOINTS.tasks.delete(taskId), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return { success: response.ok };
};

export interface Invitation {
  ID: string;
  WorkspaceID: string;
  InviterID: string;
  InviteeUserID: string | null;
  InviteeEmail: string;
  Role: string;
  Status: "pending" | "accepted" | "rejected";
  Token: string;
  ExpiresAt: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Notification {
  id: string;
  user_id: string;
  workspace_id: string;
  type: "invitation"; // Assuming only invitation type for now
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const getNotifications = async (): Promise<{ data: Notification[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/workspaces/notifications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getAllInvitations = async (): Promise<{ data: Invitation[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/workspaces/me/invitations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const acceptInvitation = async (
  invitationId: string
): Promise<{ message: string; status: number }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.workspace.acceptInvitation(invitationId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const rejectInvitation = async (
  invitationId: string
): Promise<{ message: string; status: number }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.workspace.rejectInvitation(invitationId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const inviteMember = async (
  workspaceId: string,
  email: string,
  role: string,
  message: string
): Promise<{ message: string; status: number }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.workspace.inviteMember(workspaceId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        invitee_email: email,
        role: role,
        message: message,
      }),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user_name: string;
  user_email: string;
}

export const getWorkspaceMembers = async (
  workspaceId: string
): Promise<{ data: WorkspaceMember[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_ENDPOINTS.workspace.getMembers(workspaceId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// New function to remove a workspace member
export const removeWorkspaceMember = async (
  workspaceId: string,
  memberId: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}/workspaces/${workspaceId}/members/${memberId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json", // Include Content-Type header
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return { success: response.ok };
};

export const getThreadByAgentId = async (
  agentId: string
): Promise<{ data: Thread[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.threads.getByAgentId(agentId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// New function to get threads for a workspace
export const getThreads = async (
  workspaceId: string
): Promise<{ data: Thread[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/threads/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ workspace_id: workspaceId }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getThreadById = async (
  threadId: string
): Promise<{ data: Thread }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.threads.getById(threadId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getTaskRunsByThreadId = async (
  user_id: string,
  agent_id: string
): Promise<{ data: TaskRun[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.tasks.excuteHistory, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: user_id,
      agent_id: agent_id,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const assignAgentToFolder = async (
  agentId: string,
  folderId: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.agents.assignToFolder(agentId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ folder_id: folderId }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Create system prompt template for an agent
export const createSystemPrompt = async (promptData: {
  agent_id: string;
  name: string;
  description: string;
  template_content: string;
  category: string;
  template_type: string;
  is_featured: boolean;
  order_index: number;
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.promptTemplates.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(promptData),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

// Get prompt templates by agent
export interface PromptTemplate {
  id: string;
  agent_id: string;
  name: string;
  description: string;
  template_content: string;
  category: string;
  template_type: string;
  is_featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PromptTemplatesResponse {
  data: PromptTemplate[];
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
}

export const getPromptTemplatesByAgent = async (
  agentId: string,
  limit = 10,
  offset = 0
): Promise<PromptTemplatesResponse> => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    API_ENDPOINTS.promptTemplates.byAgent(agentId, limit, offset),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

// Render a prompt template
export const renderPromptTemplate = async (
  templateId: string,
  data: {
    agent_id: string;
    workspace_id: string;
  }
): Promise<{ rendered_content: string }> => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.promptTemplates.render(templateId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const getAllPromptTemplates = async (limit = 100, offset = 0) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${API_BASE_URL}/prompt-templates/all?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const updatePromptTemplate = async (
  id: string,
  data: Partial<PromptTemplate>
) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/prompt-templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const deletePromptTemplate = async (id: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/prompt-templates/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  // Nếu là 204 No Content thì không cần parse json
  if (res.status === 204) return;
  return res.json();
};

export const clearAgentThreadHistory = async (
  agent_id: string,
  workspace_id: string
) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${API_BASE_URL}/threads/clear?agent_id=${encodeURIComponent(
      agent_id
    )}&workspace_id=${encodeURIComponent(workspace_id)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    await handleApiError(res);
  }
  if (res.status === 204) return;
  return res.json();
};

// Gửi message kèm file lên thread
export const uploadMessageWithFile = async (
  threadId: string,
  messageContent: string,
  file: File,
  optimisticId: string
): Promise<{ data: any }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const formData = new FormData();
  formData.append("message_content", messageContent);
  formData.append("image", file);
  formData.append("optimistic_id", optimisticId);
  const response = await fetch(
    `${API_BASE_URL}/threads/${threadId}/messages/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Không set Content-Type, để browser tự set boundary cho multipart/form-data
      },
      body: formData,
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// ========== CREDENTIALS API ==========
export const createCredential = async (data: {
  provider: string;
  credential: object;
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.credentials.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const getCredentials = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.credentials.list, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const updateCredential = async (id: string, data: object) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.credentials.update(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const deleteCredential = async (id: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.credentials.delete(id), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return { success: res.ok };
};

// Lấy agents theo nhiều folder
export const getAgentsByFolders = async (
  folderIds: string[]
): Promise<{ data: Agent[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  const res = await fetch(`${API_BASE_URL}/agents/by-folders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ folder_ids: folderIds }),
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const scrapWorkspaceProfile = async ({
  workspace_id,
  website_url,
}: {
  workspace_id: string;
  website_url: string;
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.workspace.scrapUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ workspace_id, website_url }),
  });
  if (!res.ok)
    throw new Error("Không thể lấy thông tin doanh nghiệp từ website");
  return res.json();
};

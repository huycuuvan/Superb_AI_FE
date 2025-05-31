import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import {
  Workspace,
  Agent,
  ModelConfig,
  Thread,
  ChatMessage,
  ApiMessage,
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
  workspace_id: string;
  name: string;
  description: string;
  folder_type: "custom";
  status: "workspace_shared";
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
  status?: number;
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
}

export const updateAgent = async (
  agentId: string,
  agentData: UpdateAgentRequest
): Promise<{ data: Agent }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.agents.list}/${agentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(agentData),
    }
  );

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

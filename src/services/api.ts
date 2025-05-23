import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import { Workspace, Agent } from "@/types";
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

export const getAgents = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.agents.list, {
    headers: {
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
  type: string;
  description: string;
  category: string;
  avatar?: string;
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

  return res.json() as Promise<Agent>;
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
  data: Workspace | null;
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

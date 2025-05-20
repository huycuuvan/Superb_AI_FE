import { API_ENDPOINTS } from "@/config/api";
import { Workspace, Agent } from "@/types";

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
  let data;
  try {
    data = await res.json();
  } catch (err) {
    // Nếu không parse được JSON (ví dụ 403 trả về rỗng)
    throw new Error(
      "Không thể đăng ký. Có thể bạn không có quyền truy cập hoặc server từ chối request."
    );
  }
  if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");
  return data;
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
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Tạo workspace thất bại");
  return data;
};

export const getAgents = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.agents.list, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lấy danh sách agents thất bại");
  return data;
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
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Tạo agent thất bại");
  return data as Agent;
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
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gửi tin nhắn thất bại");
  return data;
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

  const response = await fetch("http://localhost:3000/folders/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ workspace_id: workspaceId }),
  });

  if (!response.ok) {
    throw new Error("Lỗi khi lấy danh sách folder");
  }

  return response.json();
};

export interface WorkspaceResponse {
  data: Workspace | null;
  status: number;
}

export const getWorkspace = async (): Promise<WorkspaceResponse> => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/workspaces", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Lấy workspace thất bại");
  return res.json();
};

export interface CreateFolderRequest {
  workspace_id: string;
  name: string;
  description?: string;
  order?: number;
  pin?: number;
  status?: number;
}

export const createFolder = async (
  folderData: CreateFolderRequest
): Promise<{ data: FolderResponse["data"][0] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch("http://localhost:3000/folders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(folderData),
  });

  if (!response.ok) {
    throw new Error("Lỗi khi tạo folder");
  }

  return response.json();
};

export interface FolderDetailResponse {
  data: {
    // Assuming the data structure based on potential API response
    id: string;
    name: string;
    workspace_id: string;
    description?: string;
    order?: number;
    pin?: number;
    status?: number;
    // Add other potential fields like agents if the API returns them
  };
}

export const getFolderDetail = async (
  folderId: string,
  workspaceId: string
): Promise<FolderDetailResponse> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  // Using POST method based on the provided curl example, although GET is typical for detail
  const response = await fetch(`http://localhost:3000/folders/${folderId}`, {
    method: "GET", // Assuming POST based on the curl data field
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Lỗi khi lấy chi tiết folder");
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

  const response = await fetch(`http://localhost:3000/folders/${folderId}`, {
    method: "PUT", // Assuming PUT method for update
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(folderData),
  });

  if (!response.ok) {
    throw new Error("Lỗi khi cập nhật folder");
  }

  return response.json();
};

export const deleteFolder = async (
  folderId: string
): Promise<{ success: boolean }> => {
  // Assuming API returns success status
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`http://localhost:3000/folders/${folderId}`, {
    method: "DELETE", // Assuming DELETE method for deletion
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Lỗi khi xóa folder");
  }

  // Assuming successful deletion returns a simple success indicator
  // You might need to adjust the return type and parsing based on actual API response
  return { success: true };
};

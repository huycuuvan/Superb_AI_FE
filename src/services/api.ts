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

export const getFolders = async (): Promise<{ id: string; name: string }[]> => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/folders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Lấy folders thất bại");
  return res.json();
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

export const API_BASE_URL = "https://aiemployee.site/api";

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    refresh: `${API_BASE_URL}/auth/refresh`,
  },
  workspace: {
    create: `${API_BASE_URL}/workspaces`,
    profile: `${API_BASE_URL}/workspaces/profile`,
    getProfile: (workspaceId: string) =>
      `${API_BASE_URL}/workspaces/${workspaceId}/profile`,
    updateProfile: (workspaceId: string) =>
      `${API_BASE_URL}/workspaces/${workspaceId}/profile`,
  },
  agents: {
    list: `${API_BASE_URL}/agents/all`,
    create: `${API_BASE_URL}/agents`,
    chat: `${API_BASE_URL}/agents/chat`,
    byFolder: `${API_BASE_URL}/agents/by-folder`,
    delete: (id: string) => `${API_BASE_URL}/agents/${id}`,
    getById: (id: string) => `${API_BASE_URL}/agents/${id}`,
  },
  tasks: {
    list: `${API_BASE_URL}/tasks/list`,
    create: `${API_BASE_URL}/tasks/create`,
  },
  folders: {
    create: `${API_BASE_URL}/folders`,
    list: `${API_BASE_URL}/folders`,
    getById: (id: string) => `${API_BASE_URL}/folders/${id}`,
    update: (id: string) => `${API_BASE_URL}/folders/${id}`,
    delete: (id: string) => `${API_BASE_URL}/folders/${id}`,
  },
  threads: {
    create: `${API_BASE_URL}/threads`,
    list: `${API_BASE_URL}/threads`,
    messages: (threadId: string) =>
      `${API_BASE_URL}/threads/${threadId}/messages`,
    check: `${API_BASE_URL}/threads/check`,
  },
  messages: {
    list: `${API_BASE_URL}/messages`,
  },
};

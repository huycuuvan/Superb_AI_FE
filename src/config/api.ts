export const API_BASE_URL = "https://aiemployee.site/api";

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    google: `${API_BASE_URL}/auth/google`,
  },
  workspace: {
    create: `${API_BASE_URL}/workspaces`,
  },
  agents: {
    list: `${API_BASE_URL}/agents/list`,
    create: `${API_BASE_URL}/agents/create`,
    chat: `${API_BASE_URL}/agents/chat`,
  },
  tasks: {
    list: `${API_BASE_URL}/tasks/list`,
    create: `${API_BASE_URL}/tasks/create`,
  },
};

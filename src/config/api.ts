export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    inviteMember: (workspaceId: string) =>
      `/workspaces/${workspaceId}/invitations`,
    acceptInvitation: (invitationId: string) =>
      `/workspaces/invitations/${invitationId}/accept`,
    rejectInvitation: (invitationId: string) =>
      `/workspaces/invitations/${invitationId}/decline`,
    getMembers: (workspaceId: string) =>
      `${API_BASE_URL}/workspaces/${workspaceId}/members`,
    scrapUrl: `${API_BASE_URL}/workspaces/profile/scrap-url`,
  },
  agents: {
    list: `${API_BASE_URL}/agents/all`,
    create: `${API_BASE_URL}/agents`,
    chat: `${API_BASE_URL}/agents/chat`,
    byFolder: `${API_BASE_URL}/agents/by-folder`,
    delete: (id: string) => `${API_BASE_URL}/agents/${id}`,
    getById: (id: string) => `${API_BASE_URL}/agents/${id}`,
    assignToFolder: (id: string) => `${API_BASE_URL}/agents/${id}/folders`,
    update: (id: string) => `${API_BASE_URL}/agents/${id}`,
  },
  tasks: {
    base: `${API_BASE_URL}/tasks`,
    list: `${API_BASE_URL}/tasks/list`,
    create: `${API_BASE_URL}/tasks/create`,
    update: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    delete: (id: string) => `${API_BASE_URL}/tasks/${id}`,

    byAgent: (agentId: string) => `${API_BASE_URL}/tasks/agent/${agentId}`,
    execute: `${API_BASE_URL}/tasks/execute`,
    excuteHistory: `${API_BASE_URL}/tasks/execute-history`,
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
    getById: (id: string) => `${API_BASE_URL}/threads/${id}`,
    getByAgentId: (agentId: string) =>
      `${API_BASE_URL}/threads/filter?agent_id=${agentId}`,
  },
  messages: {
    list: `${API_BASE_URL}/messages`,
  },
  promptTemplates: {
    create: `${API_BASE_URL}/prompt-templates`,
    list: `${API_BASE_URL}/prompt-templates`,
    getById: (id: string) => `${API_BASE_URL}/prompt-templates/${id}`,
    update: (id: string) => `${API_BASE_URL}/prompt-templates/${id}`,
    delete: (id: string) => `${API_BASE_URL}/prompt-templates/${id}`,
    byAgent: (agentId: string, limit = 10, offset = 0) =>
      `${API_BASE_URL}/prompt-templates/by-agent/${agentId}?template_type=user_prompt&limit=${limit}&offset=${offset}`,
    render: (id: string) => `${API_BASE_URL}/prompt-templates/${id}/render`,
  },
  credentials: {
    create: `${API_BASE_URL}/credentials`,
    list: `${API_BASE_URL}/credentials`,
    getById: (id: string) => `${API_BASE_URL}/credentials/${id}`,
    update: (id: string) => `${API_BASE_URL}/credentials/${id}`,
    delete: (id: string) => `${API_BASE_URL}/credentials/${id}`,
  },
};

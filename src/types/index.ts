export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  description?: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  avatar?: string;
  description?: string;
  category?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedAgentId?: string;
  status: "todo" | "in-progress" | "completed";
  createdAt: string;
  dueDate?: string;
}

export interface ChatTask {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: string;
  agentId?: string;
}

export interface SidebarItem {
  id: string;
  name: string;
  icon?: React.ReactNode;
  href?: string;
  items?: SidebarItem[];
}

export interface Folder {
  id: string;
  name: string;
  path: string;
}

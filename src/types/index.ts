export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  description?: string;
}

export interface ModelConfig {
  model: string;
  temperature: number;
  webhook_url: string;
  build_prompt_webhook_url: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  avatar?: string;
  category?: string;
  role_description?: string;
  status?: string;
  model_config?: ModelConfig;
  instructions?: string;
  job_brief?: string;
  language?: string;
  position?: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  folders: Folder[];
}

export interface ApiTaskType {
  id: string;
  name: string;
  description: string;
  task_type: string;
  execution_config: Record<string, unknown>;
  credit_cost: number;
  category: string;
  is_system_task: boolean;
  assignedAgentId?: string;
  status?: "todo" | "in-progress" | "completed";
  created_at?: string;
  updated_at?: string;
}

export interface Thread {
  id: string;
  user_id: string;
  agent_id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  messages?: ApiMessage[];
}

// New interface for message data from API
export interface ApiMessage {
  id: string;
  thread_id: string;
  sender_user_id?: string; // Optional for agent messages
  sender_agent_id?: string; // Optional for user messages
  sender_type: "user" | "agent";
  message_content: string;
  created_at: string;
  updated_at: string;
  parent_message_id?: string; // For replies
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
  path?: string;
}

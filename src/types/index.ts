export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credit?: number;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  owner: UserInfo;
  description?: string;
}

export interface ModelConfig {
  webhook_url: string;
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
  greeting_message?: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  folders: Folder[];
  image_urls?: string[];
  file_url?: string;
  // Add new fields from BE
  running_count?: number;
  successful_runs?: number;
  total_runs?: number;
  failed_runs?: number;
  is_running?: boolean;
  is_scheduled?: boolean;
  last_message_time?: string;
  last_message_content?: string;
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
  img_url?: string;
}

// Định nghĩa kiểu dữ liệu cho output video
export interface VideoOutputItem {
  url: string;
  filename?: string;
  snapshot_url?: string;
  [key: string]: unknown;
}

// Định nghĩa kiểu dữ liệu cho output_data dạng object
export interface TaskOutputData {
  video_url?: string;
  format?: string;
  error?: string | Record<string, unknown>;
  error_message?: string;
  [key: string]: unknown;
}

export interface TaskRun {
  id: string;
  task_id: string;
  thread_id: string;
  user_id: string;
  status: string;
  input_data: Record<string, string>;
  output_data: TaskOutputData | VideoOutputItem[] | Record<string, unknown>;
  error?: string;
  error_message?: string;
  started_at: string;
  start_time: string;
  end_time?: string;
  completed_at?: string;
  is_scheduled?: boolean;
  created_at: string;
  updated_at: string;
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
  image_urls?: string[];
  file_url?: string;
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
  image_urls?: string[];
  file_url?: string;
  isStreaming?: boolean;
  parent_message_id?: string;
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
  folder_type?: string;
  status?: string;
}

export interface CreditTransaction {
  id: number;
  user_id: string;
  amount: number;
  type: string;
  ref_id: string;
  description: string;
  created_at: string;
  status: string;
  transactions: [];
}

export interface PayPalOrder {
  id: string;
  status: "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED";
  intent: "CAPTURE" | "AUTHORIZE";
  payment_source: {
    paypal: {
      account_id: string;
      account_type: string;
      name: {
        given_name: string;
        surname: string;
      };
      email_address: string;
    };
  };
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
    payee: {
      email_address: string;
      merchant_id: string;
    };
    shipping: {
      name: {
        full_name: string;
      };
      address: {
        address_line_1: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
    payments: {
      captures: Array<{
        id: string;
        status:
          | "COMPLETED"
          | "DECLINED"
          | "PARTIALLY_REFUNDED"
          | "PENDING"
          | "REFUNDED"
          | "FAILED";
        amount: {
          currency_code: string;
          value: string;
        };
        final_capture: boolean;
        seller_protection: {
          status: "ELIGIBLE" | "PARTIALLY_ELIGIBLE" | "NOT_ELIGIBLE";
          dispute_categories: string[];
        };
        seller_receivable_breakdown: {
          gross_amount: {
            currency_code: string;
            value: string;
          };
          paypal_fee: {
            currency_code: string;
            value: string;
          };
          net_amount: {
            currency_code: string;
            value: string;
          };
        };
        invoice_id: string;
        create_time: string;
        update_time: string;
      }>;
    };
  }>;
  create_time: string;
  update_time: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface CreateOrderRequest {
  amount: string;
  currency?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  approval_url: string;
  status: string;
}

export interface CaptureOrderRequest {
  order_id: string;
}

export interface CaptureOrderResponse {
  success?: boolean;
  status?: string;
  new_credit_balance?: number;
  new_credit?: number;
  transaction_id?: string;
  message?: string;
  credit_added?: number;
}

export interface Invitation {
  ID: string;
  WorkspaceID: string;
  InviterID: string;
  InviteeEmail: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
  WorkspaceName?: string;
  InviterEmail?: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  name: string;
  email: string;
}

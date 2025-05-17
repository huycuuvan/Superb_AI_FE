
import { Agent, Task, User, Workspace } from "@/types";

export const currentUser: User = {
  id: "user-1",
  name: "AI Automation",
  email: "admin@teampal.ai",
  avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AA&backgroundColor=e91e63",
};

export const workspaces: Workspace[] = [
  {
    id: "workspace-1",
    name: "AI Automation's Workspace",
    ownerId: "user-1",
  },
];

export const agents: Agent[] = [
  {
    id: "agent-1",
    name: "Dev",
    type: "developer",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Dev",
    description: "Expert in software development and technical problem solving.",
    category: "IT",
  },
  {
    id: "agent-2",
    name: "Web",
    type: "web-developer",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Web",
    description: "Specializes in web development and design implementations.",
    category: "IT",
  },
  {
    id: "agent-3",
    name: "Quản lý Thiết kế",
    type: "design-manager",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Design",
    description: "Oversees design processes and manages creative teams.",
    category: "Design",
  },
  {
    id: "agent-4",
    name: "Nhà Thiết Kế Hành Ảnh",
    type: "visual-designer",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Visual",
    description: "Creates compelling visual designs for various platforms.",
    category: "Design",
  },
  {
    id: "agent-5",
    name: "Quản lý Kinh doanh",
    type: "business-manager",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Business",
    description: "Expert in business strategy and operational management.",
    category: "Sales",
  },
];

export const tasks: Task[] = [
  {
    id: "task-1",
    title: "Suggest upselling strategies for existing customers",
    status: "todo",
    createdAt: "2025-05-10T10:00:00Z",
  },
  {
    id: "task-2",
    title: "Generate ideas for sales promotions and discounts",
    status: "in-progress",
    assignedAgentId: "agent-5",
    createdAt: "2025-05-09T14:30:00Z",
  },
  {
    id: "task-3",
    title: "Generate ideas for sales contests and incentives",
    status: "completed",
    assignedAgentId: "agent-5",
    createdAt: "2025-05-08T09:15:00Z",
  },
  {
    id: "task-4",
    title: "Suggest cross-selling opportunities based on purchase history",
    status: "todo",
    createdAt: "2025-05-07T16:45:00Z",
  },
  {
    id: "task-5",
    title: "Suggest strategies for handling difficult customers",
    status: "todo",
    createdAt: "2025-05-06T11:20:00Z",
  },
];

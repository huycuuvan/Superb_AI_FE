import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import DashboardLayout from '@/layouts/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import { Agents } from '@/pages/Agents';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import AgentChat from '@/pages/AgentChat';
import Register from '@/pages/Register';
import WorkspacePage from '@/pages/Workspace';
import ProtectedRoute from '@/components/ProtectedRoute';
import FolderDetail from '@/pages/FolderDetail';
import AgentTaskConfig from '@/pages/AgentTaskConfig';
import { Tasks } from '@/pages/Tasks';
import WorkspaceProfilePage from '@/pages/WorkspaceProfilePage';
import WhatsNews from '@/pages/WhatsNews';
import Roadmap from '@/pages/Roadmap';
import TermsOfUse from '@/pages/TermsOfUse';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Knowledge from '@/pages/Knowledge';
import AdminLogin from "@/pages/admin/Login";
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from "@/pages/admin/Dashboard";
import Users from "@/pages/admin/Users";
import Messages from "@/pages/admin/Messages";
import Documents from "@/pages/admin/Documents";
import Analytics from "@/pages/admin/Analytics";
import Security from "@/pages/admin/Security";
import AdminWorkspaces from "@/pages/admin/Workspaces";
import AdminFolders from "@/pages/admin/Folders";
import AdminAgents from "@/pages/admin/Agents";
import AdminAgentConfigs from "@/pages/admin/AgentConfigs";
import AdminAgentDetail from "@/pages/admin/AgentDetail";
import PricingPage from '@/pages/Pricing';
import AboutPage from '@/pages/About';
import DocsPage from '@/pages/Docs';
import BlogPage from '@/pages/Blog';
import AgentProfilePage from '@/pages/AgentProfilePage';
import PromptTemplatesPage from '@/pages/PromptTemplates';
import CredentialsPage from '@/pages/Credentials';
import DepartmentsPage from '@/pages/Departments';
import ScheduledTasksPage from '@/pages/ScheduledTasks';
import { PayPalCallback } from '@/components/PayPalCallback';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/whats-news',
    element: <WhatsNews />,
  },
  {
    path: '/roadmap',
    element: <Roadmap />,
  },
  {
    path: '/terms',
    element: <TermsOfUse />,
  },
  {
    path: '/privacy',
    element: <PrivacyPolicy />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/payment/callback',
    element: <PayPalCallback />,
  },

  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'agents',
        element: <Agents />,
      },
      {
        path: 'agents/:agentId',
        element: <AgentChat />,
      },
      {
        path: 'agents/:agentId/task/:taskId/config',
        element: <AgentTaskConfig />,
      },
      {
        path: 'agents/:agentId/profile',
        element: <AgentProfilePage />,
      },
      {
        path: 'tasks',
        element: <Tasks />,
      },
      {
        path: 'knowledge',
        element: <Knowledge />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'folder/:folderId',
        element: <FolderDetail />,
      },
      {
        path: 'prompts',
        element: <PromptTemplatesPage />,
      },
      {
        path: 'credentials',
        element: <CredentialsPage />,
      },
      {
        path: 'departments',
        element: <DepartmentsPage />,
      },
      {
        path: 'scheduled-tasks',
        element: <ScheduledTasksPage />,
      },
    ],
  },
  {
    path: '/workspace',
    element: (
      <ProtectedRoute>
        <WorkspacePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout><Outlet /></AdminLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'messages',
        element: <Messages />,
      },
      {
        path: 'documents',
        element: <Documents />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'security',
        element: <Security />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'workspaces',
        element: <AdminWorkspaces />,
      },
      {
        path: 'folders',
        element: <AdminFolders />,
      },
      {
        path: 'agents',
        element: <AdminAgents />,
      },
      {
        path: 'agents/:agentId',
        element: <AdminAgentDetail />,
      },
      {
        path: 'agent-configs',
        element: <AdminAgentConfigs />,
      },
    ],
  },
  {
    path: '/pricing',
    element: <PricingPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/docs/*',
    element: <DocsPage />,
  },
  {
    path: '/blog',
    element: <BlogPage />,
  },
  {
    path: '/workspace/:workspaceId/profile',
    element: <WorkspaceProfilePage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);

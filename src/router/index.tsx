import { createBrowserRouter, RouteObject } from 'react-router-dom';
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

const routes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
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
        path: 'agents/:agentId/task/config',
        element: <AgentTaskConfig />,
      },
      {
        path: 'tasks',
        element: <Tasks />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'folder/:folderId',
        element: <FolderDetail />,
      },
    ],
  },
  {
    path: '/workspace',
    element: <WorkspacePage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);

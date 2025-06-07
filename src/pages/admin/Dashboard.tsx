import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  FileText, 
  BarChart, 
  Settings, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  MessageSquare,
  Calendar,
  UserCheck,
  FileCheck,
  Loader2,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Activity,
  ChevronDown,
  Star,
  BrainCircuit,
  BarChart3,
  PieChart,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ComposedChart
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardStats {
  totalUsers: number;
  activeSessions: number;
  totalDocuments: number;
  avgResponseTime: number;
  change: {
    users: number;
    sessions: number;
    documents: number;
    responseTime: number;
  };
}

interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  avatar: string;
}

interface Project {
  name: string;
  progress: number;
  status: string;
  team: string[];
  dueDate: string;
}

const defaultStats: DashboardStats = {
  totalUsers: 0,
  activeSessions: 0,
  totalDocuments: 0,
  avgResponseTime: 0,
  change: {
    users: 0,
    sessions: 0,
    documents: 0,
    responseTime: 0
  }
};

const defaultActivities: Activity[] = [];
const defaultProjects: Project[] = [];

// Time range options
const timeRanges = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

// Sample data for stats charts
const userStatsData = [
  { date: 'Jan', value: 1200 },
  { date: 'Feb', value: 1400 },
  { date: 'Mar', value: 1600 },
  { date: 'Apr', value: 1800 },
  { date: 'May', value: 2000 },
  { date: 'Jun', value: 2200 },
];

const sessionStatsData = [
  { date: 'Mon', value: 800 },
  { date: 'Tue', value: 900 },
  { date: 'Wed', value: 1000 },
  { date: 'Thu', value: 950 },
  { date: 'Fri', value: 1100 },
  { date: 'Sat', value: 700 },
  { date: 'Sun', value: 600 },
];

const documentStatsData = [
  { date: 'Jan', value: 500 },
  { date: 'Feb', value: 600 },
  { date: 'Mar', value: 700 },
  { date: 'Apr', value: 800 },
  { date: 'May', value: 900 },
  { date: 'Jun', value: 1000 },
];

const responseTimeData = [
  { date: 'Mon', value: 2.4 },
  { date: 'Tue', value: 2.2 },
  { date: 'Wed', value: 2.0 },
  { date: 'Thu', value: 1.8 },
  { date: 'Fri', value: 1.6 },
  { date: 'Sat', value: 1.4 },
  { date: 'Sun', value: 1.2 },
];

// Sample data for main charts
const salesData = [
  { date: 'Jan', value: 4000 },
  { date: 'Feb', value: 3000 },
  { date: 'Mar', value: 2000 },
  { date: 'Apr', value: 2780 },
  { date: 'May', value: 1890 },
  { date: 'Jun', value: 2390 },
];

const taskDistributionData = [
  { name: 'Completed', value: 400 },
  { name: 'In Progress', value: 300 },
  { name: 'Pending', value: 200 },
  { name: 'Overdue', value: 100 },
];

const userActivityData = [
  { date: 'Mon', users: 2400, sessions: 1800 },
  { date: 'Tue', users: 1398, sessions: 1200 },
  { date: 'Wed', users: 9800, sessions: 8000 },
  { date: 'Thu', users: 3908, sessions: 3000 },
  { date: 'Fri', users: 4800, sessions: 4000 },
  { date: 'Sat', users: 3800, sessions: 3000 },
  { date: 'Sun', users: 4300, sessions: 3500 },
];

const performanceData = [
  { name: 'Research', value: 85 },
  { name: 'Analysis', value: 92 },
  { name: 'Content', value: 78 },
  { name: 'Support', value: 88 },
  { name: 'Development', value: 95 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Free 3D illustrations & animations from IconScout
// const DASHBOARD_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-dashboard-1954033-1650720.png?f=webp";
// const USERS_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-users-group-3695642-3081772.png?f=webp";
// const SESSIONS_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-message-7291434-5950901.png?f=webp";
// const DOCS_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-document-1459459-1231535.png?f=webp"; 
// const CLOCK_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-clock-1439794-1214370.png?f=webp";
// const CHART_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-bar-chart-1767002-1502119.png?f=webp";
// const TASK_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-task-completion-1976138-1673546.png?f=webp";
// const AVATAR_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp";
// const ACTIVITY_3D_ANIMATION = "https://static.iconscout.com/animation/free/preview/loading-5123018-4299174.gif";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [activities, setActivities] = useState<Activity[]>(defaultActivities);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [timeRange, setTimeRange] = useState('month');
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate API call with mock data
        setTimeout(() => {
          setStats({
            totalUsers: 1456,
            activeSessions: 342,
            totalDocuments: 2570,
            avgResponseTime: 1.8,
            change: {
              users: 12.5,
              sessions: 8.3,
              documents: 15.2,
              responseTime: -6.2
            }
          });
          
          setActivities([
            {
              id: 1,
              user: "John Doe",
              action: "uploaded a new document",
              target: "Financial Report Q2",
              time: "5 mins ago",
              avatar: "https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff"
            },
            {
              id: 2,
              user: "Sarah Johnson",
              action: "created a new workspace",
              target: "Marketing Team",
              time: "30 mins ago",
              avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=10b981&color=fff"
            },
            {
              id: 3,
              user: "Mike Brown",
              action: "added new members to",
              target: "Sales Department",
              time: "2 hours ago",
              avatar: "https://ui-avatars.com/api/?name=Mike+Brown&background=f59e0b&color=fff"
            }
          ]);
          
          setProjects([
            {
              name: "Product Launch",
              progress: 75,
              status: "In Progress",
              team: ["John D.", "Sarah J.", "Mike B."],
              dueDate: "Jul 15, 2024"
            },
            {
              name: "Marketing Campaign",
              progress: 45,
              status: "In Progress",
              team: ["Emily R.", "Chris P."],
              dueDate: "Aug 3, 2024"
            },
            {
              name: "Website Redesign",
              progress: 90,
              status: "Completed",
              team: ["Alex T.", "Mia L.", "Daniel S."],
              dueDate: "Jun 30, 2024"
            }
          ]);
          
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load dashboard data');
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <img 
          src="https://static.iconscout.com/animation/free/preview/loading-5123018-4299174.gif" 
          alt="Loading" 
          className="w-20 h-20 mb-4" 
        />
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const StatCard = ({ title, value, change, isPositive, icon: Icon, description, color, chartData, chartType = 'line', gradientFrom, gradientTo }) => (
    <Card className="hover:shadow-lg transition-all duration-300 bg-white/40 dark:bg-slate-900/40 border border-white/30 dark:border-slate-700/40 backdrop-blur-sm shadow-md rounded-xl overflow-hidden transform hover:translate-y-[-2px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={`h-7 w-7 ${color} drop-shadow-md animate-pulse`} />
          {title}
        </CardTitle>
        <span className="rounded-full p-2 bg-gradient-to-br from-white/60 to-white/10 dark:from-slate-700/60 dark:to-slate-900/10 shadow-md">
          <Icon className={`h-5 w-5 ${color} drop-shadow`} />
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">{value}</span>
          {typeof change === 'number' && (
            <span className={`text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
              {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
        {chartData && (
          <div className="mt-2">
            {chartType === 'line' ? (
              <ResponsiveContainer width="100%" height={32}>
                <LineChart data={chartData}>
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <img src="https://static.iconscout.com/icon/free/png-256/free-dashboard-1954033-1650720.png?f=webp" alt="Dashboard" className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Welcome to your administration dashboard
            </p>
          </div>
        </div>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={stats.change.users}
          isPositive={stats.change.users > 0}
          icon={Users}
          description="vs last month"
          color="text-blue-500"
          chartData={userStatsData}
          chartType="line"
          gradientFrom="#6366f1"
          gradientTo="#6366f140"
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          change={stats.change.sessions}
          isPositive={stats.change.sessions > 0}
          icon={MessageSquare}
          description="vs last month"
          color="text-green-500"
          chartData={sessionStatsData}
          chartType="line"
          gradientFrom="#10b981"
          gradientTo="#10b98140"
        />
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          change={stats.change.documents}
          isPositive={stats.change.documents > 0}
          icon={FileText}
          description="vs last month"
          color="text-amber-500"
          chartData={documentStatsData}
          chartType="line"
          gradientFrom="#f59e0b"
          gradientTo="#f59e0b40"
        />
        <StatCard
          title="Response Time"
          value={`${stats.avgResponseTime}s`}
          change={stats.change.responseTime}
          isPositive={stats.change.responseTime < 0}
          icon={Clock}
          description="vs last month"
          color="text-purple-500"
          chartData={responseTimeData}
          chartType="line"
          gradientFrom="#8b5cf6"
          gradientTo="#8b5cf640"
        />
      </div>

      {/* Middle Charts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-white dark:bg-slate-950 pb-2 border-b border-slate-100 dark:border-slate-800/60 flex flex-row items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                <CardTitle>User Activity</CardTitle>
              </div>
              <CardDescription>Users and sessions over time</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-50 hover:bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                <Users className="h-3.5 w-3.5 mr-1" />
                Users
              </Badge>
              <Badge variant="secondary" className="bg-green-50 hover:bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <Activity className="h-3.5 w-3.5 mr-1" />
                Sessions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={userActivityData}
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#6366f1" name="Users" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} name="Sessions" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-white dark:bg-slate-950 pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <PieChart className="h-6 w-6 text-purple-500" />
              <CardTitle>Task Distribution</CardTitle>
            </div>
            <CardDescription>Current task status</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={taskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity Section */}
        <Card className="lg:col-span-3 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-white dark:bg-slate-950 pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest user activities</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors duration-200">
                  <Avatar className="h-9 w-9 mr-4 border-2 border-white shadow-sm">
                    <AvatarImage src={activity.avatar} alt={activity.user} />
                    <AvatarFallback>
                      <User className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <img src="https://static.iconscout.com/icon/free/png-256/free-empty-3665355-3065657.png?f=webp" className="w-16 h-16 mb-4 opacity-50" alt="No activities" />
                  <p className="text-sm text-muted-foreground">No recent activities found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-white dark:bg-slate-950 pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              System Performance
            </CardTitle>
            <CardDescription>Metrics by category</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Projects Status */}
        <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-white dark:bg-slate-950 pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-amber-500" />
              Projects Status
            </CardTitle>
            <CardDescription>Ongoing project progress</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {projects.map((project, index) => (
                <div key={index} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors duration-200">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{project.name}</div>
                    <Badge variant={
                      project.status === 'Completed' ? 'default' : 
                      project.status === 'In Progress' ? 'secondary' :
                      project.status === 'On Hold' ? 'outline' : 'destructive'
                    }>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{project.team.join(', ')}</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1" />
                    <div className="flex justify-between text-xs">
                      <span>Due: <span className="text-muted-foreground">{project.dueDate}</span></span>
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <img src="https://static.iconscout.com/icon/free/png-256/free-empty-3665355-3065657.png?f=webp" className="w-16 h-16 mb-4 opacity-50" alt="No projects" />
                  <p className="text-sm text-muted-foreground">No projects found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
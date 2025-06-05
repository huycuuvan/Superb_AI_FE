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
  ChevronDown
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
  PieChart,
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

// 3D illustration URLs
const DASHBOARD_3D_ICON = "https://cdn.iconscout.com/3d/premium/thumb/dashboard-4567890-3801234.png";
const USERS_3D_ICON = "https://cdn.iconscout.com/3d/premium/thumb/user-group-4567890-3801234.png";
const SESSIONS_3D_ICON = "https://cdn.iconscout.com/3d/premium/thumb/online-status-4567890-3801234.png";
const DOCS_3D_ICON = "https://cdn.iconscout.com/3d/premium/thumb/document-4567890-3801234.png";
const CLOCK_3D_ICON = "https://cdn.iconscout.com/3d/premium/thumb/clock-4567890-3801234.png";

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
        // TODO: Replace with actual API calls
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        
        setStats(data.stats || defaultStats);
        setActivities(data.activities || defaultActivities);
        setProjects(data.projects || defaultProjects);
      } catch (err) {
        setError('Failed to load dashboard data');
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const StatCard = ({ title, value, change, isPositive, icon: Icon, description, color, chartData, chartType = 'line', gradientFrom, gradientTo, illustration }) => (
    <Card className="hover:shadow-2xl transition-shadow bg-white/40 dark:bg-slate-900/40 border border-white/30 dark:border-slate-700/40 backdrop-blur-xl shadow-xl rounded-xl group overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {illustration && <img src={illustration} alt="" className="h-7 w-7" />}
          {title}
        </CardTitle>
        <span className="rounded-full p-2 bg-gradient-to-br from-white/60 to-white/10 dark:from-slate-700/60 dark:to-slate-900/10 shadow-md">
          <Icon className={`h-5 w-5 ${color} drop-shadow`} />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-sm">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mb-4">
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-rose-500 mr-1" />
          )}
          {change} {description}
        </div>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={gradientTo} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={gradientFrom} 
                  strokeWidth={2}
                  dot={false}
                  fill={`url(#gradient-${title})`}
                />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={gradientTo} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={gradientFrom} 
                  fill={`url(#gradient-${title})`}
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <RechartsBarChart data={chartData}>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="value" fill={`url(#gradient-${title})`}>
                  <defs>
                    <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={gradientTo} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </RechartsBarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with 3D illustration */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img src={DASHBOARD_3D_ICON} alt="Dashboard" className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your admin panel today.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
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
      </div>

      {/* Stats Grid with 3D icons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={`${stats.change.users}%`}
          isPositive={stats.change.users > 0}
          icon={Users}
          description="From last month"
          color="text-blue-500"
          chartData={userStatsData}
          chartType="area"
          gradientFrom="#6366f1"
          gradientTo="#a5b4fc"
          illustration={USERS_3D_ICON}
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions.toLocaleString()}
          change={`${stats.change.sessions}%`}
          isPositive={stats.change.sessions > 0}
          icon={UserCheck}
          description="Active in last 24h"
          color="text-emerald-500"
          chartData={sessionStatsData}
          chartType="line"
          gradientFrom="#10b981"
          gradientTo="#6ee7b7"
          illustration={SESSIONS_3D_ICON}
        />
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments.toLocaleString()}
          change={`${stats.change.documents}%`}
          isPositive={stats.change.documents > 0}
          icon={FileText}
          description="From last month"
          color="text-amber-500"
          chartData={documentStatsData}
          chartType="bar"
          gradientFrom="#f59e42"
          gradientTo="#fde68a"
          illustration={DOCS_3D_ICON}
        />
        <StatCard
          title="Avg. Response Time"
          value={`${stats.avgResponseTime}s`}
          change={`${stats.change.responseTime}s`}
          isPositive={stats.change.responseTime < 0}
          icon={Clock}
          description="From last week"
          color="text-rose-500"
          chartData={responseTimeData}
          chartType="line"
          gradientFrom="#f43f5e"
          gradientTo="#fda4af"
          illustration={CLOCK_3D_ICON}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Overview Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Distribution Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Current task status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* User Activity Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Daily user engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" name="Users" />
                  <Line type="monotone" dataKey="sessions" stroke="#82ca9d" name="Sessions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Team performance by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Projects Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarImage src={activity.avatar} alt="Avatar" />
                      <AvatarFallback>{activity.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {activity.user}{' '}
                          <span className="font-normal text-muted-foreground">
                            {activity.action}{' '}
                            <span className="font-medium text-foreground">
                              {activity.target}
                            </span>
                          </span>
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activities
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects Progress */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Track your team's progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{project.name}</h3>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress: {project.progress}%</span>
                        <span>Due: {project.dueDate}</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="flex -space-x-2">
                        {project.team.map((member, i) => (
                          <Avatar key={i} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={member} />
                            <AvatarFallback>TM</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active projects
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats with Illustrations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">+12</div>
                <p className="text-xs text-muted-foreground">
                  Since last hour
                </p>
              </div>
              <img 
                src="https://cdn-iconscout.com/illustration/premium/thumb/message-notification-3678644-3098691.png" 
                alt="Messages" 
                className="h-16 w-16 object-contain"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documents Pending Review
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Waiting for approval
                </p>
              </div>
              <img 
                src="https://cdn-iconscout.com/illustration/premium/thumb/document-review-3678644-3098691.png" 
                alt="Documents" 
                className="h-16 w-16 object-contain"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Health
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">Operational</div>
                <p className="text-xs text-muted-foreground">
                  All systems normal
                </p>
              </div>
              <img 
                src="https://cdn-iconscout.com/illustration/premium/thumb/system-health-3678644-3098691.png" 
                alt="System Health" 
                className="h-16 w-16 object-contain"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 
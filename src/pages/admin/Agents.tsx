import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Bot, 
  Activity, 
  Settings, 
  Loader2, 
  Clock, 
  Filter, 
  DownloadCloud, 
  Sparkles,
  Cpu,
  BrainCircuit,
  Zap
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Free 3D icons from IconScout 
const BOT_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-robot-3132709-2606860.png?f=webp";
const AI_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-artificial-intelligence-4441256-3697528.png?f=webp";
const CHAT_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-chatbot-1932138-1638660.png?f=webp";
const PERFORMANCE_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-performance-1632523-1382857.png?f=webp";
const LOADING_ANIMATION = "https://static.iconscout.com/animation/free/preview/loading-5123018-4299174.gif";

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  tasks: number;
  lastActive: string;
  performance: number;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  usageStats: {
    messages: number;
    tokens: number;
    threads: number;
  };
  createdAt: string;
  modelConfig: {
    model: string;
    temperature: number;
  }
}

// Performance data for each agent
const performanceData = [
  { name: 'Mon', agent1: 65, agent2: 70, agent3: 55 },
  { name: 'Tue', agent1: 70, agent2: 68, agent3: 60 },
  { name: 'Wed', agent1: 75, agent2: 65, agent3: 63 },
  { name: 'Thu', agent1: 80, agent2: 72, agent3: 68 },
  { name: 'Fri', agent1: 85, agent2: 75, agent3: 70 },
  { name: 'Sat', agent1: 82, agent2: 78, agent3: 73 },
  { name: 'Sun', agent1: 80, agent2: 80, agent3: 75 },
];

// Usage data chart
const usageData = [
  { name: 'Jan', tokens: 12400, messages: 1540 },
  { name: 'Feb', tokens: 14800, messages: 1820 },
  { name: 'Mar', tokens: 18600, messages: 2150 },
  { name: 'Apr', tokens: 21000, messages: 2400 },
  { name: 'May', tokens: 19800, messages: 2200 },
  { name: 'Jun', tokens: 22400, messages: 2580 },
];

const Agents = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        // Simulate API call with timeout
        setTimeout(() => {
          // Mock data based on database schema
          const mockAgents: Agent[] = [
            {
              id: "1",
              name: "Customer Support Assistant",
              type: "Support",
              status: "active",
      tasks: 12,
              lastActive: "2 mins ago",
              performance: 92,
              creator: {
                id: "2",
                name: "Jane Smith",
                avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=fff"
              },
              usageStats: {
                messages: 1240,
                tokens: 45600,
                threads: 320
              },
              createdAt: "2024-03-10",
              modelConfig: {
                model: "gpt-4",
                temperature: 0.7
              }
            },
            {
              id: "2",
              name: "Sales Agent",
              type: "Sales",
              status: "active",
      tasks: 8,
              lastActive: "15 mins ago",
              performance: 86,
              creator: {
                id: "1",
                name: "John Doe",
                avatar: "https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff"
              },
              usageStats: {
                messages: 980,
                tokens: 36400,
                threads: 210
              },
              createdAt: "2024-02-15",
              modelConfig: {
                model: "gpt-3.5-turbo",
                temperature: 0.8
              }
            },
            {
              id: "3",
              name: "Document Analyzer",
              type: "Analytics",
              status: "maintenance",
      tasks: 5,
              lastActive: "2 days ago",
              performance: 75,
              creator: {
                id: "3",
                name: "Bob Johnson",
                avatar: "https://ui-avatars.com/api/?name=Bob+Johnson&background=f59e0b&color=fff"
              },
              usageStats: {
                messages: 450,
                tokens: 24800,
                threads: 180
              },
              createdAt: "2024-01-20",
              modelConfig: {
                model: "gpt-4",
                temperature: 0.5
              }
            },
            {
              id: "4",
              name: "Content Writer",
              type: "Content",
              status: "inactive",
              tasks: 3,
              lastActive: "5 days ago",
              performance: 68,
              creator: {
                id: "4",
                name: "Alice Brown",
                avatar: "https://ui-avatars.com/api/?name=Alice+Brown&background=6366f1&color=fff"
              },
              usageStats: {
                messages: 320,
                tokens: 18900,
                threads: 150
              },
              createdAt: "2024-04-05",
              modelConfig: {
                model: "gpt-3.5-turbo",
                temperature: 0.9
              }
            }
          ];
          
          setAgents(mockAgents);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load agents data');
        toast({
          title: "Error",
          description: "Failed to load agents data. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchAgents();
  }, [toast]);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesType = typeFilter === 'all' || agent.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = async (agentId: string, newStatus: Agent['status']) => {
    try {
      // Simulate API call success
      setAgents(agents.map(agent =>
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      ));

      toast({
        title: "Success",
        description: "Agent status updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <img 
          src={LOADING_ANIMATION} 
          alt="Loading" 
          className="w-20 h-20 mb-4" 
        />
        <p className="text-muted-foreground">Loading agent data...</p>
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

  // Calculate metrics for the stats cards
  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const totalTasks = agents.reduce((total, agent) => total + agent.tasks, 0);
  const avgPerformance = Math.round(
    agents.reduce((sum, agent) => sum + agent.performance, 0) / agents.length
  );
  const totalMessages = agents.reduce((sum, agent) => sum + agent.usageStats.messages, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg animate-pulse">
            <img src={AI_3D_ICON} alt="Agents" className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300">
              Agents Management
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Monitor and manage AI agents performance and settings
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-300 shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Agent Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <img src={BOT_3D_ICON} alt="" className="h-5 w-5" />
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{activeAgents}</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <Bot className="h-3 w-3 mr-1" />
              {activeAgents} of {agents.length} agents online
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{totalTasks}</div>
            <div className="flex items-center text-xs text-blue-500 mt-1">
              <Activity className="h-3 w-3 mr-1" />
              Configured across all agents
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <img src={PERFORMANCE_3D_ICON} alt="" className="h-5 w-5" />
              Avg. Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{avgPerformance}%</div>
            <div className="flex items-center text-xs text-amber-500 mt-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Based on response quality
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm transform hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <img src={CHAT_3D_ICON} alt="" className="h-5 w-5" />
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{totalMessages.toLocaleString()}</div>
            <div className="flex items-center text-xs text-purple-500 mt-1">
              <Zap className="h-3 w-3 mr-1" />
              Processed this month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage and Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="bg-white dark:bg-slate-950 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Daily performance metrics for top agents</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                  <Line 
                    type="monotone" 
                    dataKey="agent1" 
                    stroke="#6366f1" 
                    strokeWidth={2} 
                    name="Customer Support Assistant"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, stroke: "#6366f1", strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="agent2" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    name="Sales Agent"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="agent3" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    name="Document Analyzer"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="bg-white dark:bg-slate-950 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle>Agent Usage</CardTitle>
                <CardDescription>Monthly token and message usage</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#6366f1" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="tokens" fill="#6366f1" name="Tokens" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="messages" fill="#10b981" name="Messages" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="bg-white dark:bg-slate-950 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                Agents List
              </CardTitle>
              <CardDescription>
                Showing {filteredAgents.length} of {agents.length} agents
              </CardDescription>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search agents..." 
                  className="pl-8 w-full sm:w-[180px] md:w-[200px] border-slate-200 dark:border-slate-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Content">Content</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="border-slate-200 dark:border-slate-800">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-slate-200 dark:border-slate-800">
                <DownloadCloud className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/20">
                <TableRow className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30">
                  <TableHead className="w-[250px]">Agent</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Tasks</TableHead>
                  <TableHead className="hidden lg:table-cell">Performance</TableHead>
                  <TableHead className="hidden md:table-cell">Creator</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredAgents.length > 0 ? (
                  filteredAgents.map((agent) => (
                    <TableRow key={agent.id} className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-900/20 transition-colors duration-200">
                  <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800 bg-primary/10">
                            <AvatarFallback>
                              <Bot className="h-4 w-4 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {agent.modelConfig.model}
                            </div>
                            <div className="text-xs text-muted-foreground sm:hidden">
                              <Badge variant="outline" className="border-slate-200 dark:border-slate-700">{agent.type}</Badge>
                            </div>
                          </div>
                    </div>
                  </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="border-slate-200 dark:border-slate-700">{agent.type}</Badge>
                  </TableCell>
                  <TableCell>
                        <Badge
                          variant={
                            agent.status === 'active'
                              ? 'default'
                              : agent.status === 'maintenance'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="whitespace-nowrap"
                        >
                          <span className={`inline-block h-2 w-2 rounded-full ${
                            agent.status === 'active' ? 'bg-green-400' : 
                            agent.status === 'maintenance' ? 'bg-amber-400' : 'bg-red-400'
                          } mr-1 animate-pulse`}></span>
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                      {agent.tasks}
                    </div>
                  </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{agent.performance}%</span>
                            <Sparkles className={`h-3 w-3 ${
                              agent.performance >= 80 ? 'text-green-500' : 
                              agent.performance >= 60 ? 'text-amber-500' : 'text-red-500'
                            }`} />
                          </div>
                          <Progress 
                            value={agent.performance} 
                            className={`h-1 ${
                              agent.performance >= 80 ? '[&>div]:bg-green-500' : 
                              agent.performance >= 60 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                            }`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-slate-200 dark:border-slate-800">
                            <AvatarImage src={agent.creator.avatar} alt={agent.creator.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">{agent.creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{agent.creator.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{agent.lastActive}</span>
                        </div>
                      </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Settings className="h-4 w-4" />
                      </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-slate-200 dark:border-slate-700 shadow-lg">
                              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                                Edit Configuration
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                                View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(agent.id, 'active')}
                                className="cursor-pointer text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                              >
                                Set Active
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(agent.id, 'maintenance')}
                                className="cursor-pointer text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              >
                                Set Maintenance
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(agent.id, 'inactive')}
                                className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                Set Inactive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <img 
                          src="https://static.iconscout.com/icon/free/png-256/free-no-results-2315107-1936989.png?f=webp" 
                          alt="No agents found" 
                          className="w-16 h-16 mb-2 opacity-50"
                        />
                        <p className="text-sm text-muted-foreground">No agents found</p>
                        {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                          <Button 
                            variant="link" 
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('all');
                              setTypeFilter('all');
                            }}
                            className="mt-2"
                          >
                            Clear filters
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
                )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agents; 
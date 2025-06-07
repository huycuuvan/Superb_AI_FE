import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Users, 
  FolderOpen,
  Filter,
  DownloadCloud,
  Briefcase,
  FileText,
  Building2,
  CalendarDays,
  Globe,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  members: number;
  folders: number;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  company?: {
    id: string;
    name: string;
  };
  profile?: {
    brand_name?: string;
    business_type?: string;
    logo_url?: string;
  };
  stats: {
    documents: number;
    agents: number;
    threads: number;
    activity: number;
  };
}

// Activity data for workspaces
const activityData = [
  { name: 'Mon', marketing: 65, development: 70, sales: 55 },
  { name: 'Tue', marketing: 70, development: 68, sales: 60 },
  { name: 'Wed', marketing: 75, development: 65, sales: 63 },
  { name: 'Thu', marketing: 80, development: 72, sales: 68 },
  { name: 'Fri', marketing: 85, development: 75, sales: 70 },
  { name: 'Sat', marketing: 82, development: 78, sales: 73 },
  { name: 'Sun', marketing: 80, development: 80, sales: 75 },
];

// Content distribution by workspace
const contentData = [
  { name: 'Marketing', value: 35 },
  { name: 'Development', value: 45 },
  { name: 'Sales', value: 20 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];

const Workspaces = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        // Mock data based on the database schema
        const mockWorkspaces: Workspace[] = [
          { 
            id: '1', 
      name: 'Marketing Team', 
            description: 'Team workspace for all marketing content and campaigns',
            owner: {
              id: '1',
              name: 'John Doe',
              avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff'
            },
      members: 12, 
      folders: 8,
            status: 'active',
            createdAt: '2024-03-01',
            company: {
              id: '1',
              name: 'Acme Inc.'
            },
            profile: {
              brand_name: 'Acme Marketing',
              business_type: 'B2B SaaS',
              logo_url: 'https://via.placeholder.com/150'
            },
            stats: {
              documents: 156,
              agents: 5,
              threads: 423,
              activity: 85
            }
          },
          { 
            id: '2', 
      name: 'Development Team', 
            description: 'Software development workspace with technical documentation',
            owner: {
              id: '2',
              name: 'Jane Smith',
              avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=fff'
            },
      members: 15, 
      folders: 12,
            status: 'active',
            createdAt: '2024-02-15',
            company: {
              id: '1',
              name: 'Acme Inc.'
            },
            profile: {
              brand_name: 'Acme Development',
              business_type: 'Software Development',
              logo_url: 'https://via.placeholder.com/150'
            },
            stats: {
              documents: 284,
              agents: 8,
              threads: 720,
              activity: 92
            }
          },
          { 
            id: '3', 
      name: 'Sales Team', 
            description: 'Sales and customer relationship management',
            owner: {
              id: '3',
              name: 'Bob Johnson',
              avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=f59e0b&color=fff'
            },
      members: 8, 
      folders: 5,
            status: 'inactive',
            createdAt: '2024-01-20',
            company: {
              id: '2',
              name: 'Beta Corp'
            },
            profile: {
              brand_name: 'Beta Sales',
              business_type: 'B2C Retail',
              logo_url: 'https://via.placeholder.com/150'
            },
            stats: {
              documents: 98,
              agents: 3,
              threads: 256,
              activity: 45
            }
          },
          { 
            id: '4', 
            name: 'Customer Support', 
            description: 'Customer support and service workspace',
            owner: {
              id: '4',
              name: 'Alice Brown',
              avatar: 'https://ui-avatars.com/api/?name=Alice+Brown&background=6366f1&color=fff'
            },
            members: 10, 
            folders: 6,
            status: 'active',
            createdAt: '2024-04-10',
            company: {
              id: '1',
              name: 'Acme Inc.'
            },
            profile: {
              brand_name: 'Acme Support',
              business_type: 'Customer Service',
              logo_url: 'https://via.placeholder.com/150'
            },
            stats: {
              documents: 132,
              agents: 6,
              threads: 890,
              activity: 78
            }
          },
        ];
        
        setWorkspaces(mockWorkspaces);
      } catch (err) {
        setError('Failed to load workspaces data');
        toast({
          title: "Error",
          description: "Failed to load workspaces data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [toast]);

  const filteredWorkspaces = workspaces.filter(workspace => {
    const matchesSearch = workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        workspace.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        workspace.company?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || workspace.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats for the metrics cards
  const activeWorkspaces = workspaces.filter(w => w.status === 'active').length;
  const totalMembers = workspaces.reduce((sum, w) => sum + w.members, 0);
  const totalFolders = workspaces.reduce((sum, w) => sum + w.folders, 0);
  const totalDocuments = workspaces.reduce((sum, w) => sum + w.stats.documents, 0);

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

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Workspaces Management</h1>
            <p className="text-muted-foreground">
              Manage workspaces, members, and shared resources.
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workspace
        </Button>
      </div>

      {/* Workspace Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Workspaces</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{activeWorkspaces}</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <Briefcase className="h-3 w-3 mr-1" />
              {activeWorkspaces} of {workspaces.length} workspaces
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{totalMembers}</div>
            <div className="flex items-center text-xs text-blue-500 mt-1">
              <Users className="h-3 w-3 mr-1" />
              Across all workspaces
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Folders</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{totalFolders}</div>
            <div className="flex items-center text-xs text-amber-500 mt-1">
              <FolderOpen className="h-3 w-3 mr-1" />
              Organized content
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{totalDocuments.toLocaleString()}</div>
            <div className="flex items-center text-xs text-purple-500 mt-1">
              <FileText className="h-3 w-3 mr-1" />
              Knowledge base size
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Content Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-white dark:bg-slate-950 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <CardTitle>Workspace Activity</CardTitle>
            <CardDescription>Daily activity metrics for top workspaces</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="marketing" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    name="Marketing Team"
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="development" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Development Team"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Sales Team"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-white dark:bg-slate-950 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Knowledge items across workspaces</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {contentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Content Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workspaces List */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-white dark:bg-slate-950 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
            <CardTitle>Workspaces List</CardTitle>
              <CardDescription>
                Showing {filteredWorkspaces.length} of {workspaces.length} workspaces
              </CardDescription>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search workspaces..." 
                  className="pl-8 w-full sm:w-[180px] md:w-[240px] border-slate-200 dark:border-slate-800"
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
                  <SelectItem value="archived">Archived</SelectItem>
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
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/20">
              <TableRow className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30">
                <TableHead>Workspace</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Folders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkspaces.map((workspace) => (
                <TableRow key={workspace.id} className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-900/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-800 bg-primary/10">
                        {workspace.profile?.logo_url ? (
                          <AvatarImage src={workspace.profile.logo_url} alt={workspace.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {workspace.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{workspace.name}</div>
                        {workspace.profile?.brand_name && (
                          <div className="text-xs text-muted-foreground">
                            {workspace.profile.brand_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-slate-200 dark:border-slate-800">
                        <AvatarImage src={workspace.owner.avatar} alt={workspace.owner.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">{workspace.owner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{workspace.owner.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {workspace.company ? (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        <Building2 className="h-3 w-3 mr-1" />
                        {workspace.company.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground border-slate-200 dark:border-slate-700">
                        Personal
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      {workspace.members}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <FolderOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                      {workspace.folders}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      workspace.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      workspace.status === 'inactive' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {workspace.status.charAt(0).toUpperCase() + workspace.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{workspace.createdAt}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-slate-200 dark:border-slate-700">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Workspace</DropdownMenuItem>
                        <DropdownMenuItem>Manage Members</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {workspace.status !== 'active' && (
                          <DropdownMenuItem className="text-green-600 dark:text-green-400">
                            Activate Workspace
                          </DropdownMenuItem>
                        )}
                        {workspace.status === 'active' && (
                          <DropdownMenuItem className="text-amber-600 dark:text-amber-400">
                            Deactivate Workspace
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                          Archive Workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="bg-white dark:bg-slate-950 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest activity across workspaces</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-6">
            <div className="flex items-start">
              <Avatar className="h-9 w-9 mr-3 border border-slate-200 dark:border-slate-800">
                <AvatarImage src="https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=fff" alt="Jane Smith" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Jane Smith{' '}
                    <span className="font-normal text-muted-foreground">
                      added 2 new documents to{' '}
                      <span className="font-medium text-foreground">
                        Development Team
                      </span>
                    </span>
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Just now
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <Avatar className="h-9 w-9 mr-3 border border-slate-200 dark:border-slate-800">
                <AvatarImage src="https://ui-avatars.com/api/?name=Bob+Johnson&background=f59e0b&color=fff" alt="Bob Johnson" />
                <AvatarFallback>BJ</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Bob Johnson{' '}
                    <span className="font-normal text-muted-foreground">
                      added 3 new members to{' '}
                      <span className="font-medium text-foreground">
                        Sales Team
                      </span>
                    </span>
                  </p>
                  <div className="text-xs text-muted-foreground">
                    2 hours ago
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <Avatar className="h-9 w-9 mr-3 border border-slate-200 dark:border-slate-800">
                <AvatarImage src="https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff" alt="John Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    John Doe{' '}
                    <span className="font-normal text-muted-foreground">
                      created a new folder in{' '}
                      <span className="font-medium text-foreground">
                        Marketing Team
                      </span>
                    </span>
                  </p>
                  <div className="text-xs text-muted-foreground">
                    1 day ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Workspaces; 
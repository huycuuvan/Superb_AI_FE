import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, MoreVertical, Filter, UserPlus, DownloadCloud, Users as UsersIcon, User, Mail, Shield, Calendar, Pencil, Coins, Ban, FileText } from "lucide-react";
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
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

// IconScout 3D icons
const USERS_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-users-group-3695642-3081772.png?f=webp";
const USER_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-user-3665363-3065820.png?f=webp"; 
const ADMIN_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-admin-panel-1526507-1290947.png?f=webp";
const CALENDAR_3D_ICON = "https://static.iconscout.com/icon/free/png-256/free-calendar-1439794-1214368.png?f=webp";
const LOADING_ANIMATION = "https://static.iconscout.com/animation/free/preview/loading-5123018-4299174.gif";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarUrl?: string;
  createdAt: string;
  lastActive?: string;
  credits: number;
}

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Simulate API call with timeout
        setTimeout(() => {
          // Mock data based on the database schema
          const mockUsers: User[] = [
            { 
              id: '1', 
              name: 'John Doe', 
              email: 'john@example.com', 
              role: 'user', 
              status: 'active',
              avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff',
              createdAt: '2024-04-01',
              lastActive: '2024-05-15 14:30',
              credits: 100
            },
            { 
              id: '2', 
              name: 'Jane Smith', 
              email: 'jane@example.com', 
              role: 'system_admin', 
              status: 'active',
              avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=fff',
              createdAt: '2024-03-15',
              lastActive: '2024-05-15 15:45',
              credits: 250
            },
            { 
              id: '3', 
              name: 'Bob Johnson', 
              email: 'bob@example.com', 
              role: 'content_creator', 
              status: 'inactive',
              avatarUrl: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=f59e0b&color=fff',
              createdAt: '2024-02-10',
              lastActive: '2024-04-20 09:15',
              credits: 50
            },
            { 
              id: '4', 
              name: 'Alice Brown', 
              email: 'alice@example.com', 
              role: 'user', 
              status: 'active',
              avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Brown&background=6366f1&color=fff',
              createdAt: '2024-01-05',
              lastActive: '2024-05-14 11:30',
              credits: 75
            },
            { 
              id: '5', 
              name: 'David Miller', 
              email: 'david@example.com', 
              role: 'user', 
              status: 'active',
              avatarUrl: 'https://ui-avatars.com/api/?name=David+Miller&background=6366f1&color=fff',
              createdAt: '2024-03-22',
              lastActive: '2024-05-15 10:15',
              credits: 120
            },
            { 
              id: '6', 
              name: 'Emma Wilson', 
              email: 'emma@example.com', 
              role: 'content_creator', 
              status: 'active',
              avatarUrl: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=f59e0b&color=fff',
              createdAt: '2024-04-10',
              lastActive: '2024-05-14 16:40',
              credits: 85
            },
          ];
          
          setUsers(mockUsers);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load users data');
        toast({
          title: "Error",
          description: "Failed to load users data. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'system_admin':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Admin</span>
          </Badge>
        );
      case 'content_creator':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Creator</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>User</span>
          </Badge>
        );
    }
  };

  // Count active users
  const activeUsers = users.filter(user => user.status === 'active').length;
  // Count admins
  const adminUsers = users.filter(user => user.role === 'system_admin').length;
  // Count recent signups (in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = users.filter(user => new Date(user.createdAt) >= thirtyDaysAgo).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <img 
          src={LOADING_ANIMATION} 
          alt="Loading" 
          className="w-20 h-20 mb-4" 
        />
        <p className="text-muted-foreground">Loading user data...</p>
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
    <div className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <img src={USERS_3D_ICON} alt="Users" className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300">
              Users Management
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <img src={USERS_3D_ICON} alt="" className="h-5 w-5 opacity-80" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{users.length}</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <UsersIcon className="h-3 w-3 mr-1" />
              All registered users
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <img src={USER_3D_ICON} alt="" className="h-5 w-5 opacity-80" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{activeUsers}</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <User className="h-3 w-3 mr-1" />
              Currently active
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <img src={ADMIN_3D_ICON} alt="" className="h-5 w-5 opacity-80" />
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{adminUsers}</div>
            <div className="flex items-center text-xs text-amber-500 mt-1">
              <Shield className="h-3 w-3 mr-1" />
              System administrators
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <img src={CALENDAR_3D_ICON} alt="" className="h-5 w-5 opacity-80" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{recentUsers}</div>
            <div className="flex items-center text-xs text-blue-500 mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="bg-white dark:bg-slate-950 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Users List</CardTitle>
              <CardDescription>
                Showing {filteredUsers.length} of {users.length} users
              </CardDescription>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-8 w-full sm:w-[180px] md:w-[240px] border-slate-200 dark:border-slate-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[160px] border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="system_admin">Admins</SelectItem>
                  <SelectItem value="content_creator">Content Creators</SelectItem>
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
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/20">
              <TableRow className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30">
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Credits</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-900/20 transition-colors duration-200">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {getRoleBadge(user.role)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="font-mono border-slate-200 dark:border-slate-700">
                        {user.credits}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-slate-200 dark:border-slate-700 shadow-lg">
                          <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Pencil className="h-4 w-4 mr-2 text-amber-500" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Coins className="h-4 w-4 mr-2 text-green-500" />
                            Manage Credits
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <img 
                        src="https://static.iconscout.com/icon/free/png-256/free-no-results-2315107-1936989.png?f=webp" 
                        alt="No users found" 
                        className="w-16 h-16 mb-2 opacity-50"
                      />
                      <p className="text-sm text-muted-foreground">No users found</p>
                      {searchQuery && (
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setSearchQuery('');
                            setRoleFilter('all');
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Users; 
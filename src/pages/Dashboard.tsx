import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { agents } from "@/services/mockData";
import { Agent } from "@/types";
import { Folder, MoreVertical, Edit, Pin, Trash } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddAgentDialog } from '@/components/AddAgentDialog';

const Dashboard = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  // Group agents by category (đặt lên trên)
  const agentsByCategory = agents.reduce((acc, agent) => {
    const category = agent.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);
  const [folders, setFolders] = useState(() => Object.entries(agentsByCategory).map(([category, agents]) => ({ name: category, agents })));
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (editingFolder && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingFolder]);

  // Mock dữ liệu chat history
  const recentChats = [
    {
      id: '1',
      title: 'Create a mood board for a new product',
      agentId: 'agent-2',
      agentName: 'Web',
      agentAvatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Web',
      lastUpdate: '2025/05/13 - 15:38',
    },
  ];

  // Ghim folder lên đầu
  const handlePin = (name: string) => {
    setFolders(prev => {
      const idx = prev.findIndex(f => f.name === name);
      if (idx === -1) return prev;
      const pinned = prev[idx];
      return [pinned, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  // Đổi tên folder
  const handleRename = (name: string) => {
    setEditingFolder(name);
    setEditValue(name);
  };
  const handleRenameSubmit = (oldName: string) => {
    setFolders(prev => prev.map(f => f.name === oldName ? { ...f, name: editValue } : f));
    setEditingFolder(null);
  };

  // Xoá folder
  const handleDelete = (name: string) => {
    setConfirmDelete(name);
  };
  const confirmDeleteFolder = () => {
    setFolders(prev => prev.filter(f => f.name !== confirmDelete));
    setConfirmDelete(null);
  };
  const cancelDelete = () => setConfirmDelete(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Welcome to your Superb AI dashboard. Manage your AI agents and tasks.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-teampal-500 text-white font-medium hover:opacity-90 transition w-full sm:w-auto"
            onClick={() => setShowAddAgentDialog(true)}
          >
            <span className="text-lg">+</span> Create agent
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-border bg-white font-medium hover:bg-accent/50 transition w-full sm:w-auto">
            <span className="text-lg">+</span> Create folder
          </button>
        </div>
      </div>

      
      {/* {folders?.map(({ name: category, agents: categoryAgents }) => (
        <div key={category} className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-teampal-500" />
              {editingFolder === category ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(category)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(category); }}
                  className="border rounded px-2 py-1 text-lg md:text-xl font-bold w-32 md:w-40"
                />
              ) : (
                <h2 className="text-lg md:text-xl font-bold">{category}</h2>
              )}
              <span className="ml-2 text-muted-foreground text-xs md:text-sm">({categoryAgents.length})</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full p-1.5 hover:bg-accent/50 focus:outline-none ml-1">
                    <MoreVertical className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleRename(category)}>
                    <Edit className="h-4 w-4 mr-2" /> Đổi tên
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePin(category)}>
                    <Pin className="h-4 w-4 mr-2" /> Ghim
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(category)} className="text-red-600 focus:text-red-600">
                    <Trash className="h-4 w-4 mr-2" /> Xoá
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton
                    key={idx}
                    className={`h-32 md:h-40 rounded-xl ${theme === 'teampal-pink' ? 'bg-teampal-100' : theme === 'blue' ? 'bg-blue-100' : theme === 'purple' ? 'bg-purple-100' : 'bg-muted'}`}
                  />
                ))
              : categoryAgents.map((agent) => (
                  <Card key={agent.id} className="bg-teampal-50 border-none rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border bg-white flex items-center justify-center">
                          {agent.avatar ? (
                            <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-teampal-500 font-bold text-lg md:text-xl">{agent.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-sm md:text-base font-semibold">{agent.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{agent.type}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2 text-xs md:text-sm text-foreground/80">
                        {agent.description || "Chưa có mô tả cho agent này."}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      ))} */}
      {/* Section recent chats */}
      <div className="mt-8 md:mt-12">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Your recent chats</h2>
        <div className="bg-white rounded-xl shadow-sm border p-3 md:p-4">
          <div className="flex items-center mb-2">
            <input 
              type="text" 
              placeholder="Find chat" 
              className="border rounded px-2 md:px-3 py-1.5 md:py-2 w-full md:w-64 mr-0 md:mr-4 text-sm" 
            />
          </div>
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">#</th>
                  <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Chat history</th>
                  <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Agent</th>
                  <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Last update</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={idx}>
                        <td className="px-2 md:px-3 py-2"><Skeleton className="h-4 w-6 md:w-8" /></td>
                        <td className="px-2 md:px-3 py-2"><Skeleton className="h-4 w-32 md:w-40" /></td>
                        <td className="px-2 md:px-3 py-2"><Skeleton className="h-5 md:h-6 w-20 md:w-24 rounded-full" /></td>
                        <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden md:table-cell"><Skeleton className="h-4 w-20 md:w-24" /></td>
                      </tr>
                    ))
                  : recentChats.map((chat, idx) => (
                      <tr key={chat.id} className="border-b hover:bg-accent/30">
                        <td className="px-2 md:px-3 py-2 text-xs md:text-sm">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-2 md:px-3 py-2 text-xs md:text-sm">{chat.title}</td>
                        <td className="px-2 md:px-3 py-2 flex items-center gap-2">
                          <Avatar className="h-5 w-5 md:h-6 md:w-6">
                            <img src={chat.agentAvatar} alt={chat.agentName} className="h-full w-full rounded-full object-cover" />
                          </Avatar>
                          <span className="text-xs md:text-sm">{chat.agentName}</span>
                        </td>
                        <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden md:table-cell">{chat.lastUpdate}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Xác nhận xoá folder */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-[300px] md:min-w-[300px]">
            <div className="mb-4 text-base md:text-lg">Bạn có chắc muốn xoá thư mục <b>{confirmDelete}</b>?</div>
            <div className="flex gap-2 justify-end">
              <button className="px-3 md:px-4 py-1.5 md:py-2 rounded bg-gray-200 text-sm md:text-base" onClick={cancelDelete}>Huỷ</button>
              <button className="px-3 md:px-4 py-1.5 md:py-2 rounded bg-red-500 text-white text-sm md:text-base" onClick={confirmDeleteFolder}>Xoá</button>
            </div>
          </div>
        </div>
      )}
      {/* Hiển thị modal AddAgentDialog khi showAddAgentDialog = true */}
      <AddAgentDialog open={showAddAgentDialog} onOpenChange={setShowAddAgentDialog} />
    </div>
  );
};

export default Dashboard;

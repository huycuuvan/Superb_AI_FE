import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { getWorkspace, createWorkspace, WorkspaceResponse, getFolders, FolderResponse } from "@/services/api";
import { Plus, LogOut, Folder } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface Workspace {
  id: string;
  name: string;
  description?: string;
}

const WorkspacePage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(""); // Local error state for create form
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Fetch workspace using React Query
  const { data, isLoading, error: fetchError, refetch } = useQuery<WorkspaceResponse | null>({
    queryKey: ['workspaces'],
    queryFn: getWorkspace,
    enabled: !!user,
    refetchOnMount: true,
    // options
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Fetch folders when workspace is selected
  const { data: foldersData, isLoading: isLoadingFolders } = useQuery<FolderResponse | null>({
    queryKey: ['folders', selectedWorkspaceId],
    queryFn: () => selectedWorkspaceId ? getFolders(selectedWorkspaceId) : Promise.resolve(null),
    enabled: !!selectedWorkspaceId,
  });

  // Convert fetched data to a consistent array format for rendering
  const workspaces = (data && data.data) ? (Array.isArray(data.data) ? data.data : [data.data]) : [];
  const folders = foldersData?.data || [];

  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
  };

  const handleGoToDashboard = (workspaceId: string) => {
    if (workspaceId) {
      localStorage.setItem('selectedWorkspace', workspaceId);
      navigate('/dashboard');
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const ws = await createWorkspace({ name, businessType: '', language: '', location: '', description });
      if (ws && ws.data && ws.data.id) {
        localStorage.setItem('selectedWorkspace', ws.data.id);
        await refetch();
        setShowCreate(false);
        navigate('/dashboard');
      } else {
        setError('Tạo workspace thành công nhưng không nhận được ID.');
      }
    } catch (err) {
      setError((err as Error).message || 'Tạo workspace thất bại');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div>Đang tải workspace...</div></div>;
  }

  if (fetchError) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-red-500">Lỗi khi tải workspace: {(fetchError as Error).message}</div>;
  }

  if (!isLoading && !fetchError && workspaces.length === 0 && !showCreate) {
    setShowCreate(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative">
      <Button 
        variant="ghost" 
        className="absolute top-4 right-4 flex items-center gap-2"
        onClick={() => {
          logout();
          navigate('/login');
        }}
      >
        <LogOut className="w-4 h-4" />
        Đăng xuất
      </Button>
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Workspace của bạn</h1>
        {showCreate ? (
          <form onSubmit={handleCreateWorkspace} className="w-full max-w-md bg-white rounded-xl shadow border p-8 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Tạo workspace mới</h2>
            <div className="w-full mb-4">
              <Label htmlFor="name">Tên workspace</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="w-full mb-4">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Tạo mới</Button>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            {(workspaces.length > 0 || isLoading) && (
              <Button type="button" variant="outline" className="w-full mt-4" onClick={() => setShowCreate(false)}>
                Quay lại danh sách workspace
              </Button>
            )}
          </form>
        ) : (
          <>
            {workspaces.length > 0 ? (
              <div className="w-full max-w-md bg-white rounded-xl shadow border p-8 flex flex-col items-center">
                <div className="w-full space-y-4">
                  {workspaces.map((workspace) => (
                    <div key={workspace.id}>
                      <div
                        className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSelectWorkspace(workspace.id)}
                      >
                        <Avatar className="bg-gray-200 text-foreground w-10 h-10 flex items-center justify-center">
                          <span className="font-bold text-lg">{workspace.name.charAt(0).toUpperCase()}</span>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-base">{workspace.name}</div>
                          {workspace.description && (
                            <div className="text-sm text-gray-500">{workspace.description}</div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoToDashboard(workspace.id);
                          }}
                        >
                          Vào Dashboard
                        </Button>
                      </div>
                      
                      {selectedWorkspaceId === workspace.id && (
                        <div className="mt-4 ml-12 space-y-2">
                          {isLoadingFolders ? (
                            <div className="text-sm text-gray-500">Đang tải folders...</div>
                          ) : folders.length > 0 ? (
                            folders.map((folder) => (
                              <div 
                                key={folder.id}
                                className="flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <Folder className="w-4 h-4" />
                                {folder.name}
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">Chưa có folder nào</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md bg-white rounded-xl shadow border p-8 flex flex-col items-center text-gray-500 text-center">
                Bạn chưa có workspace nào
              </div>
            )}
            <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2 mt-6">
              <Plus className="w-4 h-4" />
              Tạo workspace mới
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkspacePage; 
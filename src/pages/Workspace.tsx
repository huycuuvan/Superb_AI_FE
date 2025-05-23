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
import { isApiError } from "@/utils/errorHandler";
import { Alert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

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
    retry: 3,
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
      // Cập nhật thông tin user trong useAuth với workspace đã chọn
      if (user && data && data.data) {
        const selectedWorkspace = (Array.isArray(data.data) ? data.data : [data.data]).find(ws => ws.id === workspaceId);
        if (selectedWorkspace) {
          updateUser({ ...user, workspace: selectedWorkspace });
        }
      }
      navigate('/dashboard');
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
      if (isApiError(err)) {
        setError(err.message);
      } else {
        setError('Tạo workspace thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-teampal-500" />
          <div className="text-gray-600">Đang tải workspace...</div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    let errorMessage = 'Lỗi khi tải workspace. Vui lòng thử lại sau.';

    if (isApiError(fetchError)) {
      if (fetchError.status === 502) {
        errorMessage = 'Không thể kết nối đến máy chủ (Bad Gateway). Vui lòng thử lại sau.';
      } else {
        errorMessage = fetchError.message;
      }
    } else if (fetchError instanceof Error) {
      errorMessage = fetchError.message;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            {errorMessage}
          </Alert>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => refetch()}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
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
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center p-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Workspace của bạn</h1>
        {showCreate ? (
          <form onSubmit={handleCreateWorkspace} className="w-full max-w-md bg-white rounded-xl shadow border p-8 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Tạo workspace mới</h2>
            {error && (
              <Alert variant="destructive" className="w-full mb-4">
                {error}
              </Alert>
            )}
            <div className="w-full mb-4">
              <Label htmlFor="name">Tên workspace</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            <div className="w-full mb-4">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo mới'
              )}
            </Button>
            {(workspaces.length > 0 || isLoading) && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setShowCreate(false)}
                disabled={loading}
              >
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
                        className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
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
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang tải folders...
                            </div>
                          ) : folders.length > 0 ? (
                            folders.map((folder) => (
                              <div 
                                key={folder.id}
                                className="flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer transition-colors"
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
            <Button 
              onClick={() => setShowCreate(true)} 
              className="flex items-center gap-2 mt-6"
            >
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
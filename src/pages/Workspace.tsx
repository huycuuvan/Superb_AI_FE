import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { getWorkspace, createWorkspace, WorkspaceResponse, getFolders, FolderResponse, getWorkspaceProfile, WorkspaceProfile } from "@/services/api";
import { Plus, LogOut, Folder } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isApiError } from "@/utils/errorHandler";
import { Alert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import gsap from 'gsap';

interface Workspace {
  id: string;
  name: string;
  description?: string;
}

const WorkspacePage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

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

  // Fetch workspace profile for selected workspace
  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useQuery<{
    data: WorkspaceProfile | null
  } | null>({
    queryKey: ['workspaceProfile', selectedWorkspaceId],
    queryFn: () => selectedWorkspaceId ? getWorkspaceProfile(selectedWorkspaceId) : Promise.resolve(null),
    enabled: !!selectedWorkspaceId,
  });

  // Redirect if profile doesn't exist for selected workspace
  useEffect(() => {
    if (!isLoadingProfile && !profileError && selectedWorkspaceId && profileData && profileData.data === null) {
      navigate(`/workspace/${selectedWorkspaceId}/profile`);
    }
  }, [isLoadingProfile, profileError, selectedWorkspaceId, profileData, navigate]);

  // Fetch folders when workspace is selected
  const { data: foldersData, isLoading: isLoadingFolders } = useQuery<FolderResponse | null>({
    queryKey: ['folders', selectedWorkspaceId],
    queryFn: () => selectedWorkspaceId ? getFolders(selectedWorkspaceId) : Promise.resolve(null),
    enabled: !!selectedWorkspaceId,
  });

  // Convert fetched data to a consistent array format for rendering
  const workspaces = (data && data.data) ? (Array.isArray(data.data) ? data.data : [data.data]) : [];
  const folders = foldersData?.data || [];

  // Auto show create form if no workspace exists
  useEffect(() => {
    if (workspaces.length === 0 && !showCreate && !isLoading) {
      setShowCreate(true);
    }
  }, [workspaces.length, isLoading]);

  // Effect to hide loader when data is no longer loading
  useEffect(() => {
    if (!isLoading && !isLoadingFolders) {
      // Allow a small delay to see the animation before hiding
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 200); // Adjust delay as needed
      return () => clearTimeout(timer);
    }
  }, [isLoading, isLoadingFolders]);

  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
  };

  const handleGoToDashboard = async (workspaceId: string) => {
    if (workspaceId) {
      // Kiểm tra profile trước khi vào dashboard
      try {
        const profileResponse = await getWorkspaceProfile(workspaceId);
        if (profileResponse && profileResponse.data !== null) {
          // Profile tồn tại, lưu workspace đã chọn và vào dashboard
          localStorage.setItem('selectedWorkspace', workspaceId);
          if (user && data && data.data) {
            const selectedWorkspace = (Array.isArray(data.data) ? data.data : [data.data]).find(ws => ws.id === workspaceId);
            if (selectedWorkspace) {
              updateUser({ ...user, workspace: selectedWorkspace });
            }
          }
          navigate('/dashboard');
        } else {
          // Profile không tồn tại, điều hướng đến trang tạo profile
          navigate(`/workspace/${workspaceId}/profile`);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra profile:', error);
        // Xử lý lỗi hoặc thông báo cho người dùng nếu cần
        // Có thể vẫn cho vào dashboard hoặc ở lại trang workspace tùy luồng mong muốn
        // Hiện tại, tôi sẽ điều hướng về trang profile nếu có lỗi khi kiểm tra.
         navigate(`/workspace/${workspaceId}/profile`);
      }
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
        navigate(`/workspace/${ws.data.id}/profile`);
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

  // GSAP animation for card
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if(cardRef.current){
      gsap.from(cardRef.current, {opacity: 0, y: 20, duration: 0.7, ease: 'power2.out', delay: 0.2});
    }
  },[]);

  // Render PageLoader while initial data is loading
  if (showLoader) {
    return <PageLoader onComplete={() => setShowLoader(false)} />;
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

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 p-4 sm:p-6 antialiased selection:bg-pink-300 selection:text-pink-900 overflow-hidden relative`}>
      {/* Subtle animated background shapes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-300/40 rounded-full filter blur-3xl opacity-50 animate-pulse-slow animation-delay-200"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-80 sm:h-80 bg-pink-300/40 rounded-full filter blur-3xl opacity-50 animate-pulse-slower animation-delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-sky-300/30 rounded-full filter blur-3xl opacity-40 animate-pulse-slow animation-delay-500"></div>
      </div>
      <Button 
        variant="ghost" 
        className="absolute top-4 right-4 flex items-center gap-2 z-20"
        onClick={() => {
          logout();
          navigate('/login');
        }}
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
      <div ref={cardRef} className="w-full max-w-md relative z-10">
        <Card className={`shadow-2xl rounded-xl backdrop-filter backdrop-blur-lg bg-white/40 border border-white/20`}>
          <CardHeader className={`space-y-1.5 p-6 sm:p-8 border-b border-white/20`}>
            <CardTitle className={`text-2xl sm:text-3xl font-bold text-center text-slate-800`}>Your Workspace</CardTitle>
            <CardDescription className={`text-center text-slate-600 text-sm sm:text-base`}>
              {showCreate ? 'Enter details for your new workspace' : 'Choose a workspace to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8">
            {showCreate ? (
              <form onSubmit={handleCreateWorkspace} className="w-full space-y-6">
                <h2 className="text-xl font-semibold text-center text-slate-800">Create a new workspace</h2>
                {error && (
                  <Alert variant="destructive" className="w-full">
                    {error}
                  </Alert>
                )}
                <div className="w-full space-y-1.5">
                  <Label htmlFor="name" className="font-medium text-sm text-slate-700">Workspace name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    disabled={loading}
                    className="border-white/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 text-base py-2.5 px-3.5 bg-white/60 placeholder:text-slate-400 text-slate-800 rounded-md"
                  />
                </div>
                <div className="w-full space-y-1.5">
                  <Label htmlFor="description" className="font-medium text-sm text-slate-700">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    disabled={loading}
                    className="border-white/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 text-base py-2.5 px-3.5 bg-white/60 placeholder:text-slate-400 text-slate-800 rounded-md"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-gray-500/40"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create' 
                  )}
                </Button>
                {(workspaces.length > 0 || isLoading) && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-white/40 !text-slate-700 hover:bg-white/50 focus:ring-purple-500/30 py-2.5 bg-white/60"
                    onClick={() => setShowCreate(false)}
                    disabled={loading}
                  >
                    Back to workspace list
                  </Button>
                )}
              </form>
            ) : (
              <>
                {workspaces.length > 0 && (
                  <div className="w-full space-y-4">
                    {workspaces.map((workspace) => (
                      <div key={workspace.id}>
                        <div
                          className="flex items-center gap-3 p-4 border border-white/30 rounded-lg cursor-pointer hover:bg-white/40 transition-colors bg-white/60"
                          onClick={() => handleSelectWorkspace(workspace.id)}
                        >
                          <Avatar className="bg-gray-200 text-foreground w-10 h-10 flex items-center justify-center">
                            <span className="font-bold text-lg">{workspace.name.charAt(0).toUpperCase()}</span>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium text-base text-slate-800">{workspace.name}</div>
                            {workspace.description && (
                              <div className="text-sm text-gray-500">{workspace.description}</div>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-white/40 !text-slate-700 hover:bg-white/50 focus:ring-purple-500/30 py-2.5 bg-white/60"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGoToDashboard(workspace.id);
                            }}
                          >
                            Go to Dashboard
                          </Button>
                        </div>
                        {selectedWorkspaceId === workspace.id && (
                          <div className="mt-4 ml-12 space-y-2">
                            {isLoadingFolders ? (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading folders...
                              </div>
                            ) : folders.length > 0 ? (
                              folders.map((folder) => (
                                <div 
                                  key={folder.id}
                                  className="flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-white/40 rounded cursor-pointer transition-colors"
                                >
                                  <Folder className="w-4 h-4" />
                                  {folder.name}
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-500">No folders yet</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center p-6 bg-inherit border-t border-white/20 rounded-b-xl">
            {!showCreate && (
              <Button 
                onClick={() => setShowCreate(true)} 
                className="flex items-center gap-2 text-white bg-gray-900 hover:bg-black"
              >
                <Plus className="w-4 h-4" />
                Create a new workspace
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WorkspacePage; 
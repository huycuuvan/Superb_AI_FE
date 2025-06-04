import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { getWorkspace, createWorkspace, WorkspaceResponse, getFolders, FolderResponse, getWorkspaceProfile, WorkspaceProfile } from "@/services/api";
import { Plus, LogOut, Folder, ArrowRight } from "lucide-react";
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

  const { data, isLoading, error: fetchError, refetch } = useQuery<WorkspaceResponse | null>({
    queryKey: ['workspaces'],
    queryFn: getWorkspace,
    enabled: !!user,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
  });

  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useQuery<{
    data: WorkspaceProfile | null
  } | null>({
    queryKey: ['workspaceProfile', selectedWorkspaceId],
    queryFn: () => selectedWorkspaceId ? getWorkspaceProfile(selectedWorkspaceId) : Promise.resolve(null),
    enabled: !!selectedWorkspaceId,
  });

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
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f3e8ff 100%)' }} className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 antialiased selection:bg-pink-300 selection:text-pink-900 overflow-hidden relative text-slate-900 dark:text-white">
      {/* Subtle animated background shapes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-300/40 rounded-full filter blur-3xl opacity-50 animate-pulse-slow animation-delay-200"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-80 sm:h-80 bg-pink-300/40 rounded-full filter blur-3xl opacity-50 animate-pulse-slower animation-delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-sky-300/30 rounded-full filter blur-3xl opacity-40 animate-pulse-slow animation-delay-500"></div>
      </div>
      <Button 
        variant="ghost" 
        className="absolute top-4 right-4 flex items-center gap-2 z-20 bg-white dark:bg-[#23232a] text-slate-700 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#23232a]"
        onClick={() => {
          logout();
          navigate('/login');
        }}
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
      <div ref={cardRef} className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl rounded-xl bg-white border border-gray-200 dark:bg-[#18181b] dark:border-gray-700">
          <CardHeader className="space-y-1.5 p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-slate-800 dark:text-white">Your Workspace</CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              {showCreate ? 'Enter details for your new workspace' : 'Choose a workspace to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8 bg-white dark:bg-[#18181b]">
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
                    className="border-gray-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 text-base py-2.5 px-3.5 bg-white dark:bg-[#23232a] placeholder:text-slate-400 text-slate-800 dark:text-white rounded-md"
                  />
                </div>
                <div className="w-full space-y-1.5">
                  <Label htmlFor="description" className="font-medium text-sm text-slate-700">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    disabled={loading}
                    className="border-gray-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 text-base py-2.5 px-3.5 bg-white dark:bg-[#23232a] placeholder:text-slate-400 text-slate-800 dark:text-white rounded-md"
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
                    className="w-full border-gray-300 !text-slate-700 dark:!text-white hover:bg-gray-100 dark:hover:bg-[#23232a] focus:ring-purple-500/30 py-2.5 bg-white dark:bg-[#23232a]"
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
                      <div key={workspace.id} className="mb-3 last:mb-0">
                        <div
                          className="flex flex-row items-center p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm bg-white dark:bg-[#23232a] hover:shadow-md transition-all w-full max-w-full gap-2 sm:gap-4"
                          onClick={() => handleSelectWorkspace(workspace.id)}
                        >
                          <Avatar className="bg-gray-200 text-foreground w-9 h-9 flex items-center justify-center mr-2 text-base dark:bg-gray-700 dark:text-white">
                            <span className="font-bold dark:text-white">{workspace.name.charAt(0).toUpperCase()}</span>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base text-slate-800 dark:text-white truncate leading-tight">{workspace.name}</div>
                            {workspace.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-200 truncate leading-tight">{workspace.description}</div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              className="block sm:hidden rounded-full   bg-gradient-to-r from-[#c7d2fe] to-[#fbc2eb] text-slate-700  p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              onClick={e => { e.stopPropagation(); handleGoToDashboard(workspace.id); }}
                              aria-label="Go to Dashboard"
                            >
                              <ArrowRight className="w-5 h-5" />
                            </button>
                            <Button 
                              variant="default"
                              size="sm"
                              className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#c7d2fe] to-[#fbc2eb] text-slate-700 dark:text-slate-700 border-0 shadow hover:from-blue-400 hover:to-purple-400 hover:text-white transition-all"
                              onClick={e => { e.stopPropagation(); handleGoToDashboard(workspace.id); }}
                            >
                              Go to Dashboard
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center p-6 bg-white dark:bg-[#18181b] border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
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
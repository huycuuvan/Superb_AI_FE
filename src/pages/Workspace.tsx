import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { getWorkspace, createWorkspace, WorkspaceResponse, getFolders, FolderResponse, getWorkspaceProfile, WorkspaceProfile, getWorkspaceMembers, WorkspaceMember } from "@/services/api";
import { Plus, LogOut, Folder, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isApiError } from "@/utils/errorHandler";
import { Alert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import gsap from 'gsap';
import { InviteMember } from "@/components/workspace/InviteMember";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from '@/hooks/useTheme';
import { cn } from "@/lib/utils";

interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
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
  const { theme } = useTheme();

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [workspaceIdForMembers, setWorkspaceIdForMembers] = useState<string | null>(null);

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

  const { data: membersData, isLoading: isLoadingMembers, error: membersError } = useQuery<{
    data: WorkspaceMember[]
  }>({
    queryKey: ['workspaceMembers', workspaceIdForMembers],
    queryFn: () => getWorkspaceMembers(workspaceIdForMembers as string),
    enabled: !!user && !!workspaceIdForMembers && isMembersModalOpen,
  });

  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useQuery<{
    data: WorkspaceProfile | null
  } | null>({
    queryKey: ['workspaceProfile', selectedWorkspaceId],
    queryFn: () => selectedWorkspaceId ? getWorkspaceProfile(selectedWorkspaceId) : Promise.resolve(null),
    enabled: !!user && !!selectedWorkspaceId,
  });

  const { data: foldersData, isLoading: isLoadingFolders } = useQuery<FolderResponse | null>({
    queryKey: ['folders', selectedWorkspaceId],
    queryFn: () => selectedWorkspaceId ? getFolders(selectedWorkspaceId) : Promise.resolve(null),
    enabled: !!user && !!selectedWorkspaceId,
  });

  const workspaces = (data && data.data) ? (Array.isArray(data.data) ? data.data : [data.data]) : [];
  const folders = foldersData?.data || [];

  useEffect(() => {
    if (workspaces.length === 0 && !showCreate && !isLoading) {
      setShowCreate(true);
    }
  }, [workspaces.length, isLoading]);

  useEffect(() => {
    if (!isLoading && !isLoadingFolders && !isLoadingMembers) {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isLoadingFolders, isLoadingMembers]);

  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
  };

  const handleGoToDashboard = async (workspaceId: string) => {
    if (workspaceId) {
      try {
        const profileResponse = await getWorkspaceProfile(workspaceId);
        if (profileResponse && profileResponse.data !== null) {
          localStorage.setItem('selectedWorkspace', workspaceId);
          if (user && data && data.data) {
            const selectedWorkspace = (Array.isArray(data.data) ? data.data : [data.data]).find(ws => ws.id === workspaceId);
            if (selectedWorkspace) {
              updateUser({ ...user, workspace: selectedWorkspace });
            }
          }
          navigate('/dashboard');
        } else {
          navigate(`/workspace/${workspaceId}/profile`);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra profile:', error);
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

  const handleViewMembers = (workspaceId: string) => {
    setWorkspaceIdForMembers(workspaceId);
    setIsMembersModalOpen(true);
  };

  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if(cardRef.current){
      gsap.from(cardRef.current, {opacity: 0, y: 20, duration: 0.7, ease: 'power2.out', delay: 0.2});
    }
  },[]);

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
    <div className={cn(
      'min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 antialiased selection:bg-pink-300 selection:text-pink-900 overflow-hidden relative',
      // Thay đổi nền light theme để dịu mắt hơn
      'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
      // Giữ nguyên dark theme
      theme === 'dark' && 'dark bg-gradient-to-br from-zinc-900 via-zinc-950 to-black'
    )}>
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-400/20 dark:bg-purple-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-80 sm:h-80 bg-pink-400/20 dark:bg-pink-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse-slower animation-delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-sky-400/20 dark:bg-sky-500/10 rounded-full filter blur-3xl opacity-40 animate-pulse-slow animation-delay-500"></div>
      </div>
      <Button 
        variant="ghost" 
        className="absolute top-4 right-4 flex items-center gap-2 z-20 bg-white dark:bg-[#23232a] text-slate-700 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#23232a]"
        onClick={() => { logout(navigate); }}
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
      <div ref={cardRef} className="w-full max-w-md sm:max-w-lg mx-auto relative z-10 ">
        <Card className="shadow-2xl rounded-3xl border border-zinc-200 backdrop-blur-lg dark:bg-purple-500/20 bg-white text-slate-900 dark:bg-zinc-900/80 dark:text-white dark:border-zinc-700">
          <CardHeader className="space-y-1.5 p-6 sm:p-8 border-b border-purple-100 dark:border-purple-900">
            <CardTitle className="text-3xl font-bold text-center text-zinc-900 dark:text-white">Your Workspace</CardTitle>
            <CardDescription className="text-center text-purple-700 dark:text-purple-300 text-base sm:text-lg">
              {showCreate ? 'Enter details for your new workspace' : 'Choose a workspace to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-6 sm:p-8 bg-transparent">
            {showCreate ? (
              <form onSubmit={handleCreateWorkspace} className="w-full space-y-6">
                <h2 className="text-xl font-semibold text-center text-purple-700 drop-shadow-sm">Create a new workspace</h2>
                {error && (
                  <Alert variant="destructive" className="w-full">
                    {error}
                  </Alert>
                )}
                <div className="w-full space-y-1.5">
                  <Label htmlFor="name" className="font-medium text-sm  dark:text-zinc-200 text-primary">Workspace name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    disabled={loading}
                    className="border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/60 text-base py-2.5 px-3.5 bg-background text-foreground placeholder:text-muted-foreground rounded-md"
                  />
                </div>
                <div className="w-full space-y-1.5">
                  <Label htmlFor="description" className="font-medium text-sm text-primary  dark:text-zinc-200">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    disabled={loading}
                    className="border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/60 text-base py-2.5 px-3.5 bg-background text-foreground placeholder:text-muted-foreground rounded-md"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg hover:from-purple-600 hover:to-indigo-600 hover:shadow-xl transition-all font-bold py-2.5 rounded-md text-base"
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
                  <div className="w-full space-y-6">
                    {workspaces.map((workspace) => (
                      <div key={workspace.id} className="mb-2 last:mb-0">
                        <div
                          className="flex items-center p-4 border border-purple-200 dark:border-purple-800 rounded-2xl shadow-md bg-white/60 dark:bg-zinc-800/60 hover:bg-gradient-to-r hover:from-purple-500/80 hover:to-indigo-500/80 hover:text-white transition-all w-full max-w-full gap-4 group cursor-pointer"
                          onClick={() => handleSelectWorkspace(workspace.id)}
                        >
                          <Avatar className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white w-11 h-11 flex items-center justify-center mr-2 text-lg font-bold shadow-lg">
                            <span>{workspace.name.charAt(0).toUpperCase()}</span>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-lg leading-tight flex items-center gap-2">
                              <span className="truncate group-hover:text-white">{workspace.name}</span>
                              {user && (
                                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 group-hover:bg-white/20 group-hover:text-white min-w-[80px] px-4 py-1 text-center">
                                  {workspace.owner && workspace.owner.id === user.id ? 'Sở hữu' : 'Thành viên'}
                                </span>
                              )}
                            </div>
                            {workspace.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-200 truncate leading-tight group-hover:text-white/80">{workspace.description}</div>
                            )}
                          </div>
                          <Button 
                            variant="default"
                            size="sm"
                            className="rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow group-hover:from-purple-600 group-hover:to-indigo-600 group-hover:shadow-lg transition-all"
                            onClick={e => { e.stopPropagation(); handleGoToDashboard(workspace.id); }}
                          >
                            Go to Dashboard
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center p-6 bg-transparent border-t border-purple-100 dark:border-purple-900 rounded-b-3xl">
            {!showCreate && (
              <Button 
                onClick={() => setShowCreate(true)} 
                className="flex items-center gap-2 text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-full px-6 py-2 shadow-lg text-base font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create a new workspace
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isMembersModalOpen} onOpenChange={setIsMembersModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thành viên Workspace</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoadingMembers ? (
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground mt-2">Đang tải thành viên...</p>
              </div>
            ) : membersError ? (
              <div className="text-center text-red-600">
                <p>Không thể tải danh sách thành viên.</p>
                <p className="text-xs text-muted-foreground">{membersError.message}</p>
              </div>
            ) : membersData?.data && membersData.data.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {membersData.data.map(member => (
                  <div key={member.user_id} className="flex items-center gap-3 p-2 border rounded-md">
                    <Avatar className="w-8 h-8 flex items-center justify-center border">
                      <span className="font-bold text-sm">{member.user_name.charAt(0).toUpperCase()}</span>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{member.user_name}</p>
                      <p className="text-xs text-muted-foreground">{member.user_email} - <span className="font-medium">{member.role}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Không có thành viên nào trong workspace này.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspacePage; 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Sparkles, LogOut, Clock, Bell, Users, Trash2 } from "lucide-react";
import { useState, useEffect } from "react"; // Removed useRef as it's not used in the provided snippet
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar"; // AvatarImage, AvatarFallback not used directly in this part of snippet

// Import DropdownMenu components from your UI library (e.g., shadcn/ui)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"; // ENSURE THIS PATH IS CORRECT

// Add Sheet imports
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
// import { Separator } from "@/components/ui/separator"; // Not used in the final workspace dropdown

import { useSelectedWorkspace } from "@/hooks/useSelectedWorkspace";
import { useQuery, UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { getNotifications, acceptInvitation, rejectInvitation, Notification, Invitation, getAllInvitations, getWorkspaceMembers, WorkspaceMember, removeWorkspaceMember, getAgentById } from "@/services/api"; // Import getAgentById

import { LanguageToggle } from "./LanguageToggle";
// Dialog imports not used in this specific Header logic, but kept if used elsewhere
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
// import { WorkspaceProfileForm } from "@/components/workspace/WorkspaceProfile";

import { Puzzle, Share2 } from 'lucide-react'; // Edit icon not used in this part

import React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; // Import Loader2

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // Import breadcrumb components

interface DetailedInvitation extends Invitation {
  WorkspaceName?: string;
  InviterEmail?: string;
}

const Header = React.memo(() => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const { t } = useLanguage();
  const { user, logout } = useAuth(); // user object should contain email
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { workspace } = useSelectedWorkspace(); // isLoading, error not directly used in dropdown rendering logic shown
  const { agentId, threadId: paramThreadId } = useParams<{ agentId: string; threadId?: string }>();

  // Fetch current agent details using React Query
  const { data: agentData, isLoading: isLoadingAgent, error: agentError } = useQuery({
    queryKey: ['agent', agentId], // Query key includes agentId
    queryFn: () => getAgentById(agentId!), // Fetch agent details
    enabled: !!agentId, // Only fetch if agentId is available
  });

  // Use fetched agent data, fall back to mock/placeholder if needed
  const currentAgent = agentData?.data || null; // Access the 'data' property from the API response

  // const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Not used in provided snippet
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // State for managing the members modal
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  // State for managing the remove member confirmation modal
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [memberToRemoveId, setMemberToRemoveId] = useState<string | null>(null);

  // Use the workspace ID from the selected workspace context
  const workspaceIdForMembers = workspace?.id || null;

  const notificationsQuery: UseQueryResult<{ data: Notification[] }, Error> = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: isNotificationsOpen,
    staleTime: 60 * 1000,
  });

  const {
    data: invitationsData,
    isLoading: isLoadingInvitations,
    error: errorInvitations,
    refetch: refetchInvitations
  } = useQuery<{ data: DetailedInvitation[] }, Error>({
      queryKey: ['userInvitations'],
      queryFn: getAllInvitations,
      enabled: isNotificationsOpen,
      staleTime: 60 * 1000,
  });

  // Fetch workspace members using React Query in Header
  const { data: membersData, isLoading: isLoadingMembers, error: membersError } = useQuery<{
    data: WorkspaceMember[]
  }>({
    queryKey: ['workspaceMembers', workspaceIdForMembers],
    queryFn: () => getWorkspaceMembers(workspaceIdForMembers as string),
    enabled: !!workspaceIdForMembers && isMembersModalOpen, // Only fetch when modal is open and workspaceId is set
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (notificationsQuery.error) {
        console.error("Error fetching notifications:", notificationsQuery.error);
    }
    if (errorInvitations) {
        console.error("Error fetching invitations:", errorInvitations);
    }
    // Added error handling for members query
    if (membersError) {
        console.error("Error fetching workspace members:", membersError);
    }
  }, [notificationsQuery.error, errorInvitations, membersError]); // Added membersError dependency


  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      toast.success("Đã chấp nhận lời mời.");
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Also invalidate workspace query to potentially update workspace list if user joined a new one
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    } catch (error) {
      toast.error("Không thể chấp nhận lời mời.");
      console.error("Error accepting invitation:", error);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await rejectInvitation(invitationId);
      toast.success("Đã từ chối lời mời.");
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      toast.error("Không thể từ chối lời mời.");
      console.error("Error rejecting invitation:", error);
    }
  };

  const handleViewAllInvitations = () => {
    navigate('/dashboard/invitations');
    setIsNotificationsOpen(false);
  };

  // Function to open the members modal
  const handleViewMembers = () => {
    // workspaceIdForMembers is already set from useSelectedWorkspace
    setIsMembersModalOpen(true);
  };

  // Function to initiate removing a member (show confirmation modal)
  const confirmRemoveMember = (memberId: string) => {
      setMemberToRemoveId(memberId);
      setIsRemoveMemberModalOpen(true);
  };

  // Function to handle removing a member after confirmation
  const handleRemoveMember = async () => {
      if (!workspaceIdForMembers || !memberToRemoveId) {
          toast.error("Không tìm thấy thông tin thành viên hoặc workspace.");
          return;
      }

      try {
          await removeWorkspaceMember(workspaceIdForMembers, memberToRemoveId);
          toast.success("Đã xóa thành viên.");
          // Invalidate members query to refresh the list
          queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceIdForMembers] });
          setIsRemoveMemberModalOpen(false); // Close confirmation modal
          setMemberToRemoveId(null); // Clear temporary state
      } catch (error) {
          toast.error("Không thể xóa thành viên.");
          console.error("Error removing member:", error);
          setIsRemoveMemberModalOpen(false); // Close confirmation modal on error as well
          setMemberToRemoveId(null); // Clear temporary state
      }
  };

  // Determine if current path is agent chat page and agentId exists
  const isAgentChatPage = location.pathname.startsWith('/dashboard/agents/') && agentId;

  const breadcrumbs = pathSegments.map((segment, index) => {
    const displayName = segment.charAt(0).toUpperCase() + segment.slice(1);
    return {
      name: displayName,
      path: '/' + pathSegments.slice(0, index + 1).join('/'),
    };
  });
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const menuItems = [
    { icon: "🏠", label: t('home'), path: '/dashboard' },
    { icon: "🤖", label: t('agents'), path: '/dashboard/agents' },
    { icon: "✓", label: t('tasks'), path: '/dashboard/tasks' },
    { icon: "⚙️", label: t('settings'), path: '/dashboard/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter pending invitations directly from fetched data
  const pendingInvitations = invitationsData?.data?.filter(inv => inv.Status === 'pending') || [];

  // Determine if the current user is the owner of the selected workspace
  const isWorkspaceOwner = user && workspace && workspace.ownerId === user.id;

  // Find the member object to display info in the confirmation modal
  const memberToConfirmRemoval = membersData?.data.find(member => member.user_id === memberToRemoveId);

  return (
    <header className="bg-primary-gradient border-b border-border relative z-10">
      <div className="py-3 px-4 md:px-6 flex justify-between items-center">
        {/* Left Section: Mobile Menu Toggle & Breadcrumbs/Agent Info */}
        <div className="flex items-center gap-4 flex-grow"> {/* Add flex-grow here */} 
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Content for the left section - Agent Info (mobile) or Breadcrumb (desktop) */}
          {isAgentChatPage ? (
            // Content specific to Agent Chat Page
            <>
              {/* Mobile Agent Info (hidden on md and up) */}
              <div className="flex items-center space-x-3 md:hidden"> {/* Mobile view */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 bg-primary-gradient hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text"
                  aria-label="Lịch sử chat"
                  onClick={() => setShowMobileHistory(true)}
                >
                  <Clock className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-base font-semibold">{currentAgent?.name || 'Agent'}</h1>
                  <p className="text-xs text-muted-foreground">{currentAgent?.type || 'AI Assistant'}</p>
                </div>
              </div>

              {/* Desktop Agent Chat Breadcrumb (visible on md and up) */}
              <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm"> {/* Desktop view */}
                 <Breadcrumb>
                   <BreadcrumbList>
                     <BreadcrumbItem>
                       <BreadcrumbLink asChild>
                         <Link to="/dashboard">Dashboard</Link>
                       </BreadcrumbLink>
                     </BreadcrumbItem>
                     <BreadcrumbSeparator />
                     <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link to="/dashboard/agents">Agents</Link>
                        </BreadcrumbLink>
                     </BreadcrumbItem>
                     <BreadcrumbSeparator />
                     <BreadcrumbItem>
                        {/* Display Agent Name */}
                        <BreadcrumbPage>{currentAgent?.name || agentId || 'Agent'}</BreadcrumbPage>
                     </BreadcrumbItem>
                     {paramThreadId && ( // Optionally add Thread ID if it exists in URL
                        <>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbPage>{paramThreadId}</BreadcrumbPage>
                          </BreadcrumbItem>
                        </>
                      )}
                   </BreadcrumbList>
                 </Breadcrumb>
              </div>
            </>
          ) : (
            // Standard Breadcrumb Section for other pages
            <div className="flex items-center gap-2 text-muted-foreground text-sm flex-grow"> {/* Visible on md+, flex-grow */} 
               {breadcrumbs.length === 0 ? (
                 <span>{getGreeting()}, {user?.name || 'Guest'}</span>
               ) : (
                 <>
                   {/* Only show Dashboard link if not the first segment */}
                   {breadcrumbs[0]?.name.toLowerCase() !== 'dashboard' && ( // Check if first segment is not dashboard
                     <>
                       <Link to="/dashboard" className="hover:text-foreground transition-colors">
                         Dashboard
                       </Link>
                       <span className="mx-1 text-muted-foreground">/</span>
                     </>
                   )}
                   {/* Render breadcrumbs from path segments */}
                   {breadcrumbs.map((crumb, i) => (
                     <div key={i} className="flex items-center">
                       {i > 0 && <span className="mx-1 text-muted-foreground">/</span>}
                       <Link
                         to={crumb.path}
                         className="hover:text-foreground transition-colors"
                       >
                         {crumb.name}
                       </Link>
                     </div>
                   ))}
                 </>
               )}
            </div>
          )}
        </div>
        
        {/* Right Section: Notifications, Actions, Workspace, Logout */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notification Sheet (as implemented before) */}
          <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text">
                <Bell className="h-5 w-5" />
                {pendingInvitations.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {pendingInvitations.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[380px] sm:w-[450px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Thông báo</SheetTitle>
              </SheetHeader>
              <div className="flex-grow overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-md font-semibold mb-3 text-foreground">Lời mời tham gia Workspace</h3>
                  {isLoadingInvitations ? ( /* ... loading UI ... */ 
                    <div className="text-center py-6 text-muted-foreground">Đang tải lời mời...</div>
                  ) : errorInvitations ? ( /* ... error UI ... */ 
                    <div className="text-center py-6 text-red-600 bg-red-50 p-3 rounded-md">
                      <p>Không thể tải lời mời.</p>
                      <p className="text-xs">Vui lòng thử lại sau.</p>
                    </div>
                  ) : pendingInvitations.length === 0 ? ( /* ... no invitations UI ... */ 
                    <div className="text-sm text-muted-foreground py-6 text-center">
                      Không có lời mời nào đang chờ xử lý.
                    </div>
                  ) : ( /* ... list invitations ... */ 
                    <div className="space-y-3">
                      {pendingInvitations.map(invitation => (
                        <div key={invitation.ID} className="bg-card p-3 rounded-lg border shadow-sm">
                          <div className="mb-3">
                            <p className="text-sm font-medium text-foreground leading-relaxed">
                              Bạn đã được mời tham gia workspace <span className="font-semibold text-primary">{invitation.WorkspaceName || invitation.WorkspaceID}</span>
                              {invitation.InviterEmail && <span className="block text-xs text-muted-foreground">Từ: {invitation.InviterEmail}</span>}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Với vai trò: <span className="font-medium">{invitation.Role}</span>
                            </p>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleRejectInvitation(invitation.ID)} className="text-xs">
                              Từ chối
                            </Button>
                            <Button variant="default" size="sm" onClick={() => handleAcceptInvitation(invitation.ID)} className="text-xs">
                              Chấp nhận
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {(pendingInvitations.length > 0 || !isLoadingInvitations) && (
                <SheetFooter className="p-4 mt-auto border-t">
                  <Button variant="ghost" className="w-full justify-center" onClick={handleViewAllInvitations}>
                    Xem tất cả lời mời
                  </Button>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>

          {/* Conditional Rendering for Agent Chat vs Default Header Icons */}
          {location.pathname.startsWith('/dashboard/agent-chat/') ? (
            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="ghost" size="icon" aria-label="Plugins">
                <Puzzle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Share">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Delete">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <LanguageToggle className="hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text" />
              <Button variant="outline" size="sm" className="hidden md:inline-flex hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text">
                {t('editBrand')}
              </Button>

              {/* Workspace Selector Dropdown - CORRECTED */}
              {workspace && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text">
                      <Avatar className="bg-gradient-to-r from-primary-from to-primary-to text-primary-text  w-8 h-8 flex items-center justify-center border">
                        <span className="font-bold text-sm">
                          {/* Display first letter of workspace name, or user email, or 'W' */}
                          {workspace.name ? workspace.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "W")}
                        </span>
                      </Avatar>
                      <span className="font-semibold hidden md:flex items-center justify-center md:text-sm text-foreground">
                        {/* Display "WorkspaceName's workspace" or "UserEmail's workspace" */}
                        {workspace.name ? `${workspace.name}'s workspace` : (user?.email ? `${user.email}'s workspace` : "My Workspace")}
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56"> {/* Standard shadcn/ui classes will apply */}
                    {user?.email && (
                      <>
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium text-foreground leading-none">{user.name || "User"}</p>
                          <p className="text-xs text-muted-foreground leading-none mt-1">{user.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {/* Added View Members DropdownMenuItem */}
                    <DropdownMenuItem onClick={handleViewMembers} className="cursor-pointer hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text  ">
                      <Users className="mr-2 h-4 w-4" />
                      Xem thành viên
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/workspace')} className="cursor-pointer hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text">
                      Chọn workspace khác
                    </DropdownMenuItem>
                    {/* You can add more items here, e.g., "Workspace Settings" */}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button variant="outline" size="icon" onClick={handleLogout} className="hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text" aria-label="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu (remains the same) */}
      <div className={cn("md:hidden border-t border-border bg-background", mobileMenuOpen ? "block" : "hidden")}>
        <nav className="px-2 py-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                  className={cn("flex items-center px-3 py-2 rounded-md text-sm font-medium", isActive ? "bg-primary-pink/30 text-primary-foreground dark:bg-primary-pink/50 dark:text-primary-pink" : "hover:bg-primary-pink/30 hover:text-primary-pink dark:hover:bg-primary-pink/50 dark:hover:text-primary-pink", "transition-colors")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2.5">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile History Bottom Sheet (remains the same) */}
      {showMobileHistory && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileHistory(false)} />
          <div className="relative w-full max-h-[70%] bg-card rounded-t-xl shadow-xl p-4 flex flex-col">
            <button className="absolute top-3 right-3 p-1.5 bg-muted rounded-full hover:bg-muted/80" onClick={() => setShowMobileHistory(false)} aria-label="Close history">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Lịch sử chat</h2>
            <div className="overflow-y-auto flex-grow">
              <p className="text-sm text-muted-foreground text-center py-5">Chưa có lịch sử chat.</p>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal (Moved to Header) */}
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
                     {/* Add remove button if user is owner and not the member themselves */}
                    {user?.id !== member.user_id && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto text-muted-foreground hover:text-red-500"
                            onClick={() => confirmRemoveMember(member.user_id)}
                            aria-label="Xóa thành viên"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
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

      {/* Remove Member Confirmation Modal */}
      <Dialog open={isRemoveMemberModalOpen} onOpenChange={setIsRemoveMemberModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa thành viên</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thành viên <span className="font-semibold">{memberToConfirmRemoval?.user_name || "này"}</span> khỏi workspace không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveMemberModalOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleRemoveMember}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
});

export default Header;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { workspaces } from "@/services/mockData";
import { useTheme, Theme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { CreditPurchaseDialog } from "@/components/CreditPurchaseDialog";
import { TransactionHistory } from "@/components/TransactionHistory";
import toast, { Toaster } from "react-hot-toast";
import { Coins, Plus } from "lucide-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWorkspace, getWorkspaceProfile } from "@/services/api";
import { WorkspaceProfileForm } from "@/components/workspace/WorkspaceProfile";

const Settings = () => {
  // Lấy workspace đầu tiên và profile
  const { data: wsData } = useQuery({ queryKey: ['workspaces'], queryFn: getWorkspace });
  const workspace = wsData && 'data' in wsData && Array.isArray(wsData.data) ? wsData.data[0] : undefined;
  const workspaceId = workspace?.id;
  const { data: profileData } = useQuery({ queryKey: ['workspaceProfile', workspaceId], queryFn: () => workspaceId ? getWorkspaceProfile(workspaceId) : Promise.resolve({ data: null }), enabled: !!workspaceId });
  const workspaceProfile = profileData && 'data' in profileData ? profileData.data : undefined;
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "");
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<Theme>(theme || 'light');
  const { user, updateUser } = useAuth();
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);

  // State for account form
  const [accountForm, setAccountForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setAccountForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleSaveAppearance = () => {
    setTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    toast.success("Saved successfully!");
  };

  const handleAccountFormChange = (field: string, value: string) => {
    setAccountForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateAccount = () => {
    // Validate form
    if (!accountForm.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!accountForm.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // If password change is requested, validate passwords
    if (accountForm.newPassword || accountForm.confirmPassword) {
      if (!accountForm.currentPassword) {
        toast.error("Current password is required to change password");
        return;
      }
      if (accountForm.newPassword !== accountForm.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
      if (accountForm.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long");
        return;
      }
    }

    // Update user data
    if (user) {
      const updatedUser = {
        ...user,
        name: accountForm.name.trim(),
        email: accountForm.email.trim()
      };
      
      updateUser(updatedUser);
      toast.success("Account updated successfully!");
      
      // Clear password fields
      setAccountForm(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    }
  };
  
  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">
        Manage your account settings and preferences
      </p>
      
      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          
          <TabsTrigger value="credit">Credit</TabsTrigger>
          
        </TabsList>
        
        <TabsContent value="workspace">
          <div className="grid gap-6">
            {workspace && (
              <Card>
                <CardHeader>
                  <CardTitle>Workspace</CardTitle>
                  <CardDescription>Thông tin cơ bản workspace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  
                  <div><b>Name:</b> {workspace.name}</div>
                  <div><b>Owner:</b> {workspace.owner.name}</div>
                  {workspace.description && <div><b>Description:</b> {workspace.description}</div>}
                </CardContent>
              </Card>
            )}
            {workspaceId && (
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Profile</CardTitle>
                  <CardDescription>Thông tin profile workspace</CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkspaceProfileForm workspaceId={workspaceId} initialData={workspaceProfile || undefined} />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={accountForm.name}
                  onChange={(e) => handleAccountFormChange("name", e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={accountForm.email}
                  onChange={(e) => handleAccountFormChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              
              {/* User Role Display */}
              {user?.role && (
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              )}

              {/* User ID Display */}
              {user?.id && (
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <Input 
                    value={user.id}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={accountForm.currentPassword}
                      onChange={(e) => handleAccountFormChange("currentPassword", e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={accountForm.newPassword}
                      onChange={(e) => handleAccountFormChange("newPassword", e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={accountForm.confirmPassword}
                      onChange={(e) => handleAccountFormChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="superb-button"
                onClick={handleUpdateAccount}
                disabled={!user}
              >
                Update Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
   
        
        <TabsContent value="credit">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  Credit Balance
                </CardTitle>
                <CardDescription>
                  Quản lý credit và lịch sử giao dịch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Credit hiện tại</p>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="text-2xl font-bold">{user?.credit || 0}</span>
                      <span className="text-sm text-muted-foreground">credits</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowCreditPurchase(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nạp Credit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <TransactionHistory />
          </div>
        </TabsContent>
        
        
      </Tabs>

      <CreditPurchaseDialog
        isOpen={showCreditPurchase}
        onClose={() => setShowCreditPurchase(false)}
        onSuccess={(newCreditBalance) => {
          toast.success(`Đã nạp thành công! Credit mới: ${newCreditBalance}`);
        }}
      />
    </div>
  );
};

export default Settings;

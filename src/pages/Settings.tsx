import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { workspaces } from "@/services/mockData";
import { useTheme } from "@/hooks/useTheme";
import toast, { Toaster } from "react-hot-toast";

const Settings = () => {
  const workspace = workspaces[0];
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const handleSaveAppearance = () => {
    setTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    toast.success("Đã lưu giao diện thành công!");
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
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workspace">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Information</CardTitle>
                <CardDescription>
                  Update your workspace details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input 
                    id="workspace-name" 
                    value={workspaceName} 
                    onChange={(e) => setWorkspaceName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace-description">Description</Label>
                  <Textarea 
                    id="workspace-description" 
                    placeholder="Describe what this workspace is used for..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace-website">Website</Label>
                  <Input 
                    id="workspace-website" 
                    placeholder="https://example.com"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="teampal-button">Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Workspace Appearance</CardTitle>
                <CardDescription>
                  Customize how your workspace looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Workspace Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded bg-teampal-500 flex items-center justify-center text-white text-xl font-bold">
                      TP
                    </div>
                    <Button variant="outline">Change Logo</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className={"justify-start border-2 " + (selectedTheme === 'teampal-pink' ? 'border-teampal-500' : 'border-transparent')}
                      onClick={() => setSelectedTheme('teampal-pink')}
                    >
                      <span className="mr-2 h-4 w-4 rounded-full bg-teampal-500" />
                      <span>Teampal Pink</span>
                    </Button>
                    <Button
                      variant="outline"
                      className={"justify-start border-2 " + (selectedTheme === 'blue' ? 'border-blue-500' : 'border-transparent')}
                      onClick={() => setSelectedTheme('blue')}
                    >
                      <span className="mr-2 h-4 w-4 rounded-full bg-blue-500" />
                      <span>Blue</span>
                    </Button>
                    <Button
                      variant="outline"
                      className={"justify-start border-2 " + (selectedTheme === 'purple' ? 'border-purple-500' : 'border-transparent')}
                      onClick={() => setSelectedTheme('purple')}
                    >
                      <span className="mr-2 h-4 w-4 rounded-full bg-purple-500" />
                      <span>Purple</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="teampal-button" onClick={handleSaveAppearance}>Save Appearance</Button>
              </CardFooter>
            </Card>
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
                <Input id="name" value="AI Automation" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value="admin@teampal.ai" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value="********" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="teampal-button">Update Account</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-tasks" className="flex-1">Task updates</Label>
                    <Switch id="email-tasks" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-agents" className="flex-1">Agent status changes</Label>
                    <Switch id="email-agents" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-workflow" className="flex-1">Workflow completions</Label>
                    <Switch id="email-workflow" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">In-app Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-tasks" className="flex-1">Task updates</Label>
                    <Switch id="app-tasks" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-agents" className="flex-1">Agent status changes</Label>
                    <Switch id="app-agents" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-workflow" className="flex-1">Workflow completions</Label>
                    <Switch id="app-workflow" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="teampal-button">Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">Professional Plan</h3>
                    <p className="text-sm text-muted-foreground">$49/month</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Next billing date: June 15, 2025
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">Change Plan</Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">Cancel Plan</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Payment Method</h3>
                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
              <div className="w-full">
                <Button variant="outline" className="w-full">View Billing History</Button>
              </div>
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">Need help with billing?</span>
                <a href="#" className="text-teampal-500 hover:underline">Contact Support</a>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAgentById, getTasksByAgentId, updateAgent, deleteAgent, UpdateAgentRequest, createTask, updateTask, deleteTask, UpdateTaskRequest, assignAgentToFolder } from '@/services/api';
import { Agent, ApiTaskType, ModelConfig } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ListPlus, Edit, Trash2, PlusCircle, X, FolderPlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { useFolders } from '@/contexts/FolderContext';
import EditAgentDialog from '@/components/EditAgentDialog';

const AgentProfilePage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [tasks, setTasks] = useState<ApiTaskType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { workspace } = useSelectedWorkspace();
  const { folders, fetchFolders, loadingFolders } = useFolders();

  const [isEditAgentDialogOpen, setIsEditAgentDialogOpen] = useState(false);
  const [editedAgentData, setEditedAgentData] = useState<Partial<Agent>>({});
  const [isSavingAgent, setIsSavingAgent] = useState(false);

  const [isDeleteAgentDialogOpen, setIsDeleteAgentDialogOpen] = useState(false);
  const [isDeletingAgent, setIsDeletingAgent] = useState(false);

  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState<Partial<ApiTaskType>>({});
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [currentTaskToEdit, setCurrentTaskToEdit] = useState<ApiTaskType | null>(null);
  const [editedTaskData, setEditedTaskData] = useState<Partial<ApiTaskType>>({});
  const [isSavingTask, setIsSavingTask] = useState(false);

  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ApiTaskType | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const [isDark, setIsDark] = useState(false);

  // New state for folder assignment
  const [isAssignToFolderDialogOpen, setIsAssignToFolderDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [isAssigningToFolder, setIsAssigningToFolder] = useState(false);

  const fetchAgentData = async () => {
    if (!agentId) {
      setError('Agent ID is missing.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch agent data
      const agentResponse = await getAgentById(agentId);
      if (!agentResponse.data) {
        throw new Error('Failed to fetch agent data');
      }
      setAgent(agentResponse.data);
      setEditedAgentData(agentResponse.data);

      // Fetch tasks data
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const tasksResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks/agent/${agentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const tasksData = await tasksResponse.json();
      // Ensure tasks is always an array
      const tasks = Array.isArray(tasksData.data) ? tasksData.data : [];
      setTasks(tasks);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load agent profile or tasks.');
      setTasks([]); // Reset tasks to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
    if(workspace?.id) {
      fetchFolders(workspace.id);
    }
  }, [agentId, workspace?.id, fetchFolders]);

  // Agent CRUD Handlers
  const handleEditAgentClick = () => {
    if (agent) {
      setEditedAgentData(agent);
      setIsEditAgentDialogOpen(true);
    }
  };

  const handleSaveAgent = async () => {
    if (!agentId || !editedAgentData.name) return;

    setIsSavingAgent(true);
    try {
      await updateAgent(agentId, editedAgentData as UpdateAgentRequest);
      toast.success('Agent updated successfully!');
      setIsEditAgentDialogOpen(false);
      fetchAgentData(); // Re-fetch agent data to update UI
    } catch (err) {
      console.error('Error updating agent:', err);
      toast.error('Failed to update agent.');
    } finally {
      setIsSavingAgent(false);
    }
  };

  const handleDeleteAgentClick = () => {
    setIsDeleteAgentDialogOpen(true);
  };

  const handleConfirmDeleteAgent = async () => {
    if (!agentId) return;

    setIsDeletingAgent(true);
    try {
      await deleteAgent(agentId);
      toast.success('Agent deleted successfully!');
      navigate('/dashboard/agents'); // Navigate back to agents list
    } catch (err) {
      console.error('Error deleting agent:', err);
      toast.error('Failed to delete agent.');
    } finally {
      setIsDeletingAgent(false);
    }
  };

  // Task CRUD Handlers
  const handleCreateTaskClick = () => {
    setNewTaskData({}); // Clear previous data
    setIsCreateTaskDialogOpen(true);
  };

  const handleSaveNewTask = async () => {
    if (!agentId || !newTaskData.name || !newTaskData.description || !newTaskData.task_type || !newTaskData.category) {
      toast.error('Please fill all required task fields.');
      return;
    }

    setIsCreatingTask(true);
    try {
      await createTask({
        ...newTaskData as ApiTaskType,
        agent_id: agentId, // Assign task to current agent
        execution_config: newTaskData.execution_config || {}, // Ensure execution_config is an object
        credit_cost: newTaskData.credit_cost || 0,
        is_system_task: newTaskData.is_system_task || false, // Default to false if not provided
      });
      toast.success('Task created successfully!');
      setIsCreateTaskDialogOpen(false);
      fetchAgentData(); // Re-fetch tasks to update UI
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleEditTaskClick = (task: ApiTaskType) => {
    setCurrentTaskToEdit(task);
    setEditedTaskData(task);
    setIsEditTaskDialogOpen(true);
  };

  const handleSaveEditedTask = async () => {
    if (!currentTaskToEdit?.id || !editedTaskData.name) return;

    setIsSavingTask(true);
    try {
      await updateTask(currentTaskToEdit.id, editedTaskData as UpdateTaskRequest);
      toast.success('Task updated successfully!');
      setIsEditTaskDialogOpen(false);
      fetchAgentData(); // Re-fetch tasks to update UI
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task.');
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleDeleteTaskClick = (task: ApiTaskType) => {
    setTaskToDelete(task);
    setIsDeleteTaskDialogOpen(true);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete?.id) return;

    setIsDeletingTask(true);
    try {
      await deleteTask(taskToDelete.id);
      toast.success('Task deleted successfully!');
      setIsDeleteTaskDialogOpen(false);
      fetchAgentData(); // Re-fetch tasks to update UI
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task.');
    } finally {
      setIsDeletingTask(false);
    }
  };

  // Add new handler for folder assignment
  const handleAssignToFolderClick = () => {
    setIsAssignToFolderDialogOpen(true);
  };

  const handleConfirmAssignToFolder = async () => {
    if (!agentId || !selectedFolderId) {
      toast.error('Please select a folder');
      return;
    }

    setIsAssigningToFolder(true);
    try {
      await assignAgentToFolder(agentId, selectedFolderId);
      toast.success('Agent successfully assigned to folder');
      setIsAssignToFolderDialogOpen(false);
      await fetchAgentData(); // Refresh agent data
    } catch (err) {
      console.error('Error assigning agent to folder:', err);
      toast.error('Failed to assign agent to folder');
    } finally {
      setIsAssigningToFolder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background p-6 md:p-10">
        <Card className="w-full max-w-4xl mx-auto bg-card text-card-foreground shadow-xl rounded-2xl p-0 md:p-0">
          <CardHeader className="flex items-center space-x-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Separator className="my-4" />
            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  if (!agent) {
    return <div className="text-center text-muted-foreground mt-8">Agent not found.</div>;
  }

  const agentTypeOptions = ['General', 'Sales', 'Customer Service', 'Design', 'Marketing', 'Developer', 'HR', 'Finance'];
  const agentCategoryOptions = ['Utility', 'Creative', 'Productivity', 'Communication', 'Data Analysis', 'Automation', 'Specialized'];
  const agentStatusOptions = ['active', 'inactive', 'system_public', 'private'];

  const taskTypeOptions = ['prompt_template', 'automation_script', 'webhook_action', 'api_call'];
  const taskCategoryOptions = ['utility', 'design', 'sales', 'customer_service', 'marketing', 'development'];
  const taskStatusOptions = ['todo', 'in-progress', 'completed'];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-6 md:p-10">
      <Card className="w-full max-w-4xl mx-auto bg-card text-card-foreground shadow-xl rounded-2xl p-0 md:p-0">
        <CardHeader className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-6 border-b border-border">
          <Avatar className="h-28 w-28">
            {agent.avatar ? (
              <AvatarImage src={agent.avatar} alt={agent.name || ''} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                {agent.name?.charAt(0) || 'AI'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="text-center sm:text-left flex-1">
            <div className="flex justify-center sm:justify-start items-center space-x-2 mb-1">
              <CardTitle className="text-4xl font-extrabold tracking-tight">
                {agent.name}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleEditAgentClick} className="hover:bg-accent hover:text-accent-foreground rounded-full p-2">
                <Edit className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleAssignToFolderClick} className="hover:bg-accent hover:text-accent-foreground rounded-full p-2">
                <FolderPlus className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDeleteAgentClick} className="hover:bg-destructive/10 hover:text-destructive rounded-full p-2">
                <Trash2 className="h-5 w-5 text-destructive hover:opacity-80" />
              </Button>
            </div>
            <CardDescription className="text-xl text-muted-foreground mb-2">
              {agent.role_description || agent.type}
            </CardDescription>
            {agent.instructions && (
              <p className="text-md text-muted-foreground mb-4">
                <span className="font-semibold text-foreground">Instructions:</span> {agent.instructions}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {agent.category && (
                <Badge variant="secondary" className="text-md px-3 py-1 rounded-full">
                  {agent.category}
                </Badge>
              )}
              {agent.status && (
                <Badge variant="outline" className="text-md px-3 py-1 rounded-full ml-2">
                  Status: {agent.status}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Agent Model Configuration */}
          {agent.model_config && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Model Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <p><span className="font-semibold text-foreground">Model:</span> {agent.model_config.model}</p>
                <p><span className="font-semibold text-foreground">Temperature:</span> {agent.model_config.temperature}</p>
                {agent.model_config.webhook_url && (
                  <p className="col-span-1 md:col-span-2"><span className="font-semibold text-foreground">Webhook URL:</span> {agent.model_config.webhook_url}</p>
                )}
                {agent.model_config.build_prompt_webhook_url && (
                  <p className="col-span-1 md:col-span-2"><span className="font-semibold text-foreground">Build Prompt Webhook URL:</span> {agent.model_config.build_prompt_webhook_url}</p>
                )}
              </div>
            </div>
          )}

          {/* Agent Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Agent Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
              {agent.language && (
                <p><span className="font-semibold text-foreground">Language:</span> {agent.language}</p>
              )}
              {agent.position && (
                <p><span className="font-semibold text-foreground">Position:</span> {agent.position}</p>
              )}
              {agent.job_brief && (
                <p className="col-span-1 md:col-span-2"><span className="font-semibold text-foreground">Job Brief:</span> {agent.job_brief}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Associated Tasks */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold flex items-center">
                <ListPlus className="mr-2 text-primary" /> Associated Tasks ({tasks?.length || 0})
              </h3>
              <Button variant="secondary" size="sm" onClick={handleCreateTaskClick} className={`flex items-center space-x-2 ${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white`}>
                <PlusCircle className="h-4 w-4" /> <span>Create New Task</span>
              </Button>
            </div>
            {tasks && tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="p-4 bg-background border border-border rounded-lg relative transition-all hover:shadow-md hover:border-primary/50">
                    <CardTitle className="text-lg font-bold mb-1 pr-10">{task.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {task.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200">{task.category}</Badge>
                      <Badge variant="outline" className="border-purple-200 text-purple-800 bg-purple-50 hover:bg-purple-100">Cost: {task.credit_cost} Credits</Badge>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Type: {task.task_type}</Badge>
                      {task.status && <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Status: {task.status}</Badge>}
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-accent hover:text-accent-foreground" onClick={() => handleEditTaskClick(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteTaskClick(task)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No tasks associated with this agent.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={`p-4 ${isDark ? 'bg-card-dark' : 'bg-card-light'} rounded-lg`}>
              <CardTitle className="text-lg mb-2">Agent Info</CardTitle>
              <div className="space-y-2">
                {agent.model_config && (
                  <p><span className="font-semibold">Model:</span> {agent.model_config.model}</p>
                )}
                {agent.job_brief && (
                  <p><span className="font-semibold">Job Brief:</span> {agent.job_brief}</p>
                )}
                {agent.language && (
                  <p><span className="font-semibold">Language:</span> {agent.language}</p>
                )}
                {agent.position && (
                  <p><span className="font-semibold">Position:</span> {agent.position}</p>
                )}
              </div>
              <div className="mt-4">
                <Button 
                  variant="default" 
                  className={`w-full ${isDark ? 'bg-primary hover:bg-primary/80' : 'bg-primary hover:bg-primary/80'}`}
                  onClick={() => navigate(`/dashboard/agents/${agent.id}?fromProfile=true`)}
                >
                  Chat with {agent.name}
                </Button>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Edit Agent Dialog */}
      <EditAgentDialog
        open={isEditAgentDialogOpen}
        onOpenChange={setIsEditAgentDialogOpen}
        agentToEdit={agent}
        editedAgentData={editedAgentData}
        setEditedAgentData={setEditedAgentData}
        isSaving={isSavingAgent}
        onSave={handleSaveAgent}
        onCancel={() => setIsEditAgentDialogOpen(false)}
        editedTemperature={agent.model_config?.temperature?.toString() || '0'}
        setEditedTemperature={(val) => setEditedAgentData({ ...editedAgentData, model_config: { ...editedAgentData.model_config, temperature: parseFloat(val) } })}
        agentTypeOptions={agentTypeOptions}
        agentCategoryOptions={agentCategoryOptions}
        agentStatusOptions={agentStatusOptions}
      />

      {/* Delete Agent Confirmation Dialog */}
      <Dialog open={isDeleteAgentDialogOpen} onOpenChange={setIsDeleteAgentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete agent "{agent?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAgentDialogOpen(false)} disabled={isDeletingAgent}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteAgent} disabled={isDeletingAgent}>
              {isDeletingAgent ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Task Dialog */}
      <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Fill in the details for the new task associated with this agent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newTaskName" className="text-right">Task Name</Label>
              <Input
                id="newTaskName"
                value={newTaskData.name || ''}
                onChange={(e) => setNewTaskData({ ...newTaskData, name: e.target.value })}
                className="col-span-3 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newTaskDescription" className="text-right">Description</Label>
              <Textarea
                id="newTaskDescription"
                value={newTaskData.description || ''}
                onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                className="col-span-3 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newTaskType" className="text-right">Task Type</Label>
              <Select
                value={newTaskData.task_type || ''}
                onValueChange={(value) => setNewTaskData({ ...newTaskData, task_type: value })}
                required
              >
                <SelectTrigger className="col-span-3 rounded-md">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  {taskTypeOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newTaskCategory" className="text-right">Category</Label>
              <Select
                value={newTaskData.category || ''}
                onValueChange={(value) => setNewTaskData({ ...newTaskData, category: value })}
                required
              >
                <SelectTrigger className="col-span-3 rounded-md">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {taskCategoryOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newTaskCreditCost" className="text-right">Credit Cost</Label>
              <Input
                id="newTaskCreditCost"
                type="number"
                value={newTaskData.credit_cost !== undefined ? newTaskData.credit_cost : ''}
                onChange={(e) => setNewTaskData({ ...newTaskData, credit_cost: parseFloat(e.target.value) })}
                className="col-span-3 rounded-md"
                required
              />
            </div>
            {/* Add more fields as needed for execution_config or other properties */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTaskDialogOpen(false)} disabled={isCreatingTask}>Cancel</Button>
            <Button onClick={handleSaveNewTask} disabled={isCreatingTask || !newTaskData.name || !newTaskData.description || !newTaskData.task_type || !newTaskData.category} className={`${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white`}>
              {isCreatingTask ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to the task details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTaskName" className="text-right">Task Name</Label>
              <Input
                id="editTaskName"
                value={editedTaskData.name || ''}
                onChange={(e) => setEditedTaskData({ ...editedTaskData, name: e.target.value })}
                className="col-span-3 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTaskDescription" className="text-right">Description</Label>
              <Textarea
                id="editTaskDescription"
                value={editedTaskData.description || ''}
                onChange={(e) => setEditedTaskData({ ...editedTaskData, description: e.target.value })}
                className="col-span-3 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTaskType" className="text-right">Task Type</Label>
              <Select
                value={editedTaskData.task_type || ''}
                onValueChange={(value) => setEditedTaskData({ ...editedTaskData, task_type: value })}
                required
              >
                <SelectTrigger className="col-span-3 rounded-md">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  {taskTypeOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTaskCategory" className="text-right">Category</Label>
              <Select
                value={editedTaskData.category || ''}
                onValueChange={(value) => setEditedTaskData({ ...editedTaskData, category: value })}
                required
              >
                <SelectTrigger className="col-span-3 rounded-md">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {taskCategoryOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTaskCreditCost" className="text-right">Credit Cost</Label>
              <Input
                id="editTaskCreditCost"
                type="number"
                value={editedTaskData.credit_cost !== undefined ? editedTaskData.credit_cost : ''}
                onChange={(e) => setEditedTaskData({ ...editedTaskData, credit_cost: parseFloat(e.target.value) })}
                className="col-span-3 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTaskStatus" className="text-right">Status</Label>
              <Select
                value={editedTaskData.status || ''}
                onValueChange={(value) => setEditedTaskData({ ...editedTaskData, status: value as "todo" | "in-progress" | "completed" })}
              >
                <SelectTrigger className="col-span-3 rounded-md">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {taskStatusOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Add more fields as needed for execution_config or other properties */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTaskDialogOpen(false)} disabled={isSavingTask}>Cancel</Button>
            <Button onClick={handleSaveEditedTask} disabled={isSavingTask || !editedTaskData.name || !editedTaskData.description || !editedTaskData.task_type || !editedTaskData.category} className={`${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white`}>
              {isSavingTask ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation Dialog */}
      <Dialog open={isDeleteTaskDialogOpen} onOpenChange={setIsDeleteTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete task "{taskToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTaskDialogOpen(false)} disabled={isDeletingTask}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteTask} disabled={isDeletingTask}>
              {isDeletingTask ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Folder Dialog */}
      <Dialog open={isAssignToFolderDialogOpen} onOpenChange={setIsAssignToFolderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign to Folder</DialogTitle>
            <DialogDescription>
              Select a folder to assign this agent to. This will allow the agent to appear in the selected folder.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <Label htmlFor="folder">Select Folder</Label>
              {loadingFolders ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={selectedFolderId}
                  onValueChange={setSelectedFolderId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignToFolderDialogOpen(false)} disabled={isAssigningToFolder}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAssignToFolder} 
              disabled={isAssigningToFolder || !selectedFolderId}
              className={isDark ? 'button-gradient-dark' : 'button-gradient-light'}
            >
              {isAssigningToFolder ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap the main component with ErrorBoundary
const AgentProfilePageWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <AgentProfilePage />
    </ErrorBoundary>
  );
};

export default AgentProfilePageWithErrorBoundary; 
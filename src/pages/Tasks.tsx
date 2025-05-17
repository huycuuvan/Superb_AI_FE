import { useState } from "react";
import { tasks, agents } from "@/services/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Task as TaskType } from "@/types";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { useLanguage } from "@/hooks/useLanguage";

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const { t } = useLanguage();
  
  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const getTasksByStatus = (status: TaskType['status']) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const handleCreateTaskClick = () => {
    setShowAddTaskDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('tasks')}</h1>
          <p className="text-muted-foreground">{t('taskManagement')}</p>
        </div>
        <Button className="teampal-button" onClick={handleCreateTaskClick}>
          {t('createTask')}
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-96">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <Input
            type="search"
            placeholder={t('search')}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="todo" className="w-full">
        <TabsList className="mb-4 w-full md:w-auto">
          <TabsTrigger value="todo" className="flex-1 md:flex-none">
            {t('toDo')} <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{getTasksByStatus('todo').length}</span>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex-1 md:flex-none">
            {t('inProgress')} <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{getTasksByStatus('in-progress').length}</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 md:flex-none">
            {t('completed')} <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{getTasksByStatus('completed').length}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="todo" className="mt-0">
          <TaskList tasks={getTasksByStatus('todo')} />
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-0">
          <TaskList tasks={getTasksByStatus('in-progress')} />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          <TaskList tasks={getTasksByStatus('completed')} />
        </TabsContent>
      </Tabs>

      {showAddTaskDialog && (
        <AddTaskDialog />
      )}
    </div>
  );
};

const TaskList = ({ tasks }: { tasks: TaskType[] }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No tasks found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

const TaskCard = ({ task }: { task: TaskType }) => {
  // Find the assigned agent if any
  const assignedAgent = task.assignedAgentId 
    ? agents.find(agent => agent.id === task.assignedAgentId) 
    : undefined;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  let statusColor = '';
  switch (task.status) {
    case 'todo':
      statusColor = 'bg-orange-100 text-orange-800';
      break;
    case 'in-progress':
      statusColor = 'bg-blue-100 text-blue-800';
      break;
    case 'completed':
      statusColor = 'bg-green-100 text-green-800';
      break;
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor}`}>
              {task.status.replace('-', ' ')}
            </span>
            <span className="text-xs text-muted-foreground">
              Created on {formatDate(task.createdAt)}
            </span>
          </div>
          
          <h3 className="font-medium">{task.title}</h3>
          
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-4 mt-4 md:mt-0">
          {assignedAgent ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage 
                  src={assignedAgent.avatar} 
                  alt={assignedAgent.name} 
                />
                <AvatarFallback className="bg-teampal-100 text-teampal-500 text-xs">
                  {assignedAgent.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{assignedAgent.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
              </svg>
              <span className="text-sm">Unassigned</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Assign</Button>
            <Button variant="outline" size="sm">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor"></path>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Tasks;

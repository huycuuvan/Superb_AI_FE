import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, MoreVertical, Bot, Activity, Settings, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Agent {
  id: number;
  name: string;
  type: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  tasks: number;
  lastActive: string;
  performance: string;
}

const Agents = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const response = await fetch('/api/admin/agents');
        const data = await response.json();
        // Ensure agents is always an array
        setAgents(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
      } catch (err) {
        setError('Failed to load agents data');
        toast({
          title: "Error",
          description: "Failed to load agents data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [toast]);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = async (agentId: number, newStatus: Agent['status']) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/admin/agents/${agentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      setAgents(agents.map(agent =>
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      ));

      toast({
        title: "Success",
        description: "Agent status updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agents Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Agents List</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search agents..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-muted-foreground" />
                      {agent.name}
                    </div>
                  </TableCell>
                  <TableCell>{agent.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        agent.status === 'Active'
                          ? 'default'
                          : agent.status === 'Maintenance'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                      {agent.tasks}
                    </div>
                  </TableCell>
                  <TableCell>{agent.lastActive}</TableCell>
                  <TableCell>{agent.performance}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(agent.id, 'Active')}
                          >
                            Set Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(agent.id, 'Inactive')}
                          >
                            Set Inactive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(agent.id, 'Maintenance')}
                          >
                            Set Maintenance
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agents; 
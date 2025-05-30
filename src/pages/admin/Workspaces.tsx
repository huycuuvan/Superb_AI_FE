import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, MoreVertical, Users, FolderOpen } from "lucide-react";

const Workspaces = () => {
  const workspaces = [
    { 
      id: 1, 
      name: 'Marketing Team', 
      owner: 'John Doe', 
      members: 12, 
      folders: 8,
      status: 'Active',
      createdAt: '2024-03-01'
    },
    { 
      id: 2, 
      name: 'Development Team', 
      owner: 'Jane Smith', 
      members: 15, 
      folders: 12,
      status: 'Active',
      createdAt: '2024-02-15'
    },
    { 
      id: 3, 
      name: 'Sales Team', 
      owner: 'Bob Johnson', 
      members: 8, 
      folders: 5,
      status: 'Inactive',
      createdAt: '2024-01-20'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workspaces Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workspace
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workspaces List</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search workspaces..." className="pl-8" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Folders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell className="font-medium">{workspace.name}</TableCell>
                  <TableCell>{workspace.owner}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      {workspace.members}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <FolderOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                      {workspace.folders}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      workspace.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {workspace.status}
                    </span>
                  </TableCell>
                  <TableCell>{workspace.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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

export default Workspaces; 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, MoreVertical, Folder, FileText, Users } from "lucide-react";

const Folders = () => {
  const folders = [
    { 
      id: 1, 
      name: 'Project Documents', 
      workspace: 'Development Team', 
      files: 24, 
      members: 8,
      size: '156 MB',
      lastModified: '2024-03-15'
    },
    { 
      id: 2, 
      name: 'Marketing Materials', 
      workspace: 'Marketing Team', 
      files: 18, 
      members: 5,
      size: '89 MB',
      lastModified: '2024-03-14'
    },
    { 
      id: 3, 
      name: 'Sales Reports', 
      workspace: 'Sales Team', 
      files: 12, 
      members: 3,
      size: '45 MB',
      lastModified: '2024-03-13'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Folders Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Folder
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Folders List</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search folders..." className="pl-8" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {folders.map((folder) => (
                <TableRow key={folder.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                      {folder.name}
                    </div>
                  </TableCell>
                  <TableCell>{folder.workspace}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      {folder.files}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      {folder.members}
                    </div>
                  </TableCell>
                  <TableCell>{folder.size}</TableCell>
                  <TableCell>{folder.lastModified}</TableCell>
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

export default Folders; 
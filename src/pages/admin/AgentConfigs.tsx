import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, MoreVertical, Settings, Bot, Clock } from "lucide-react";

const AgentConfigs = () => {
  const configs = [
    { 
      id: 1, 
      name: 'Research Assistant Config', 
      agent: 'Research Assistant', 
      model: 'GPT-4',
      temperature: 0.7,
      maxTokens: 2000,
      lastUpdated: '2024-03-15 14:30'
    },
    { 
      id: 2, 
      name: 'Data Analyzer Config', 
      agent: 'Data Analyzer', 
      model: 'GPT-4',
      temperature: 0.3,
      maxTokens: 4000,
      lastUpdated: '2024-03-15 15:45'
    },
    { 
      id: 3, 
      name: 'Content Writer Config', 
      agent: 'Content Writer', 
      model: 'GPT-3.5',
      temperature: 0.8,
      maxTokens: 1500,
      lastUpdated: '2024-03-14 09:15'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agent Configurations</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Configuration
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configurations List</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search configurations..." className="pl-8" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Max Tokens</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                      {config.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-muted-foreground" />
                      {config.agent}
                    </div>
                  </TableCell>
                  <TableCell>{config.model}</TableCell>
                  <TableCell>{config.temperature}</TableCell>
                  <TableCell>{config.maxTokens}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {config.lastUpdated}
                    </div>
                  </TableCell>
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

export default AgentConfigs; 
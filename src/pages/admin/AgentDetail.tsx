import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminAgentDetail = () => {
  const { agentId } = useParams<{ agentId: string }>();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Agent Details</h2>

      <Card>
        <CardHeader>
          <CardTitle>Agent ID: {agentId}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for agent details and related information */}
          <p>This page will show details for agent with ID: <strong>{agentId}</strong></p>
          <p>Here you can manage this agent's configurations, tasks, etc.</p>
        </CardContent>
      </Card>

      {/* Add more sections here for configurations, tasks, etc. */}
    </div>
  );
};

export default AdminAgentDetail; 
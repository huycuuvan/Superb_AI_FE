import { useState, useEffect } from "react";
import { agents } from "@/services/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Agent } from "@/types";
import { useNavigate } from "react-router-dom";
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';

const Agents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  
  // Group agents by category
  const categories = Array.from(new Set(agents.map(agent => agent.category || 'Other')));
  
  // Filter agents based on search query
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const getAgentsByCategory = (category: string) => {
    return filteredAgents.filter(agent => (agent.category || 'Other') === category);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground">Manage and interact with your AI agents</p>
        </div>
        <Button className="teampal-button">
          Create agent
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
            placeholder="Search agents..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="mb-4 w-full md:w-auto">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="flex-1 md:flex-none">
              {category} <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{getAgentsByCategory(category).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-0">
            {getAgentsByCategory(category).length === 0 && !loading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No agents found in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading
                  ? Array.from({ length: 3 }).map((_, idx) => (
                      <Skeleton
                        key={idx}
                        className={`h-40 rounded-xl ${theme === 'teampal-pink' ? 'bg-teampal-100' : theme === 'blue' ? 'bg-blue-100' : theme === 'purple' ? 'bg-purple-100' : 'bg-muted'}`}
                      />
                    ))
                  : getAgentsByCategory(category).map((agent) => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const AgentCard = ({ agent }: { agent: Agent }) => {
  const navigate = useNavigate();
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full overflow-hidden border">
              {agent.avatar ? (
                <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-teampal-100 flex items-center justify-center">
                  <span className="text-teampal-500 font-medium">
                    {agent.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{agent.type}</p>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3">
          {agent.description || "No description provided for this agent."}
        </CardDescription>
        <div className="mt-4 flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/agents/${agent.id}`)}>Chat</Button>
          <Button size="sm" className="teampal-button">View Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Agents;

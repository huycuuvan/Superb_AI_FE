import React from "react";
import { Agent } from "@/types";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { AgentCard } from "@/components/Agents/AgentCard";

interface AgentsForFolderProps {
  folderId: string;
  agents: Agent[];
  userRole?: string;
  searchQuery?: string;
  onCreateAgent?: (folderId: string) => void;
  onEditAgent?: (agent: Agent) => void;
  onDeleteAgent?: (agent: Agent) => void;
}

const CARD_WIDTH = "max-w-[320px] w-full";

const CreateAgentCard: React.FC<{ onClick: () => void; empty?: boolean }> = ({ onClick, empty }) => (
  <Card
    className={`
      flex flex-col items-center justify-center min-h-[250px] ${CARD_WIDTH}
      p-4 text-center border-dashed border-2 border-muted-foreground/50 cursor-pointer
      hover:border-primary transition group
    `}
    onClick={onClick}
  >
    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-muted group-hover:bg-indigo-100">
      <Plus className="h-5 w-5 text-primary" />
    </div>
    <p className="text-sm font-semibold">Create Agent</p>
    <p className="text-xs text-muted-foreground mt-1">{empty ? "No agents found" : ""}</p>
  </Card>
);

const AgentsForFolderCard: React.FC<AgentsForFolderProps> = ({
  folderId,
  agents,
  userRole = "user",
  searchQuery = "",
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
}) => {
  // Hiện card tạo agent nếu có quyền & không phải đang search
  const showCreate = userRole !== "user" && searchQuery === "";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onEdit={onEditAgent}
          onDelete={onDeleteAgent}
        />
      ))}
      {showCreate && (
        <CreateAgentCard onClick={() => onCreateAgent?.(folderId)} empty={agents.length === 0} />
      )}
    </div>
  );
};

export default AgentsForFolderCard;

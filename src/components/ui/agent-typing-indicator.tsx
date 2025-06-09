// src/components/ui/agent-typing-indicator.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AgentTypingIndicatorProps {
  agentName?: string;
  agentAvatar?: string;
}

export const AgentTypingIndicator = ({ agentName = 'A', agentAvatar }: AgentTypingIndicatorProps) => {
  return (
    <div className="flex items-end space-x-2 md:space-x-3">
      <Avatar className="h-8 w-8 md:h-9 md:w-9">
        <AvatarImage src={agentAvatar} alt={agentName} />
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          {agentName?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-card">
        <div className="flex items-center justify-center space-x-1 h-5">
          {/* Các dấu chấm động */}
          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
};
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from "react-router-dom";
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { Agent } from "@/types";

interface AgentCardProps {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  jobCount?: number;
  runningCount?: number;
  successfulRuns?: number;
  totalJobs?: number;
  isRunning?: boolean;
  isScheduled?: boolean;
}

export const AgentCard = ({ agent, onEdit, onDelete }: AgentCardProps) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-card rounded-2xl shadow-md border border-border flex flex-col
                 p-4 min-h-[250px] max-h-[250px] max-w-[320px] w-full mx-auto
                 hover:shadow-lg hover:-translate-y-1 group relative"
    >
      {/* Dropdown menu */}
      {(onEdit || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute top-3 right-3 p-1 rounded-full hover:bg-accent/50 focus:outline-none">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(agent)}>
                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={() => onDelete(agent)}>
                <Trash className="mr-2 h-4 w-4 text-destructive" /> Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Avatar + Name + Position */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden flex-shrink-0 bg-card flex items-center justify-center">
          <div
            dangerouslySetInnerHTML={{
              __html: agent.avatar
                ? agent.avatar
                : createAvatar(adventurer, { seed: agent.name || 'Agent' }).toString(),
            }}
            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div
            className="font-semibold text-base truncate max-w-[200px] text-foreground"
            title={agent.name}
          >
            {agent.name}
          </div>
          {agent.position && (
            <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={agent.position}>
              {agent.position}
            </div>
          )}
        </div>
      </div>

      {/* Job brief */}
      <div className="flex-1 mb-2 mt-1 flex items-start">
        <div className="text-xs text-muted-foreground line-clamp-5 min-h-[45px] w-full break-words">
          {agent.job_brief && agent.job_brief.trim() !== ''
            ? agent.job_brief
            : <span className="italic text-muted-foreground/60">Chưa có mô tả công việc</span>
          }
        </div>
      </div>

      {/* Job stats */}
      <div className="mb-2 space-y-0.5">
        <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400 block">
          Đã thực thi: {agent.successful_runs !== undefined ? agent.successful_runs : '-'} lần
        </span>
        <span className="text-xs font-medium text-muted-foreground block">
          Tổng số job: {agent.total_runs !== undefined ? agent.total_runs : '-'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button
          className="flex-1 bg-indigo-600 text-white rounded-xl py-1.5 text-xs font-bold 
                     hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          onClick={() => navigate(`/dashboard/agents/${agent.id}?fromProfile=true&newChat=1`)}
        >
          Chat
        </Button>
        <Button
          variant="outline"
          className="flex-1 border border-indigo-600 text-indigo-600 rounded-xl py-1.5 text-xs font-bold 
                     hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 
                     dark:hover:bg-indigo-950"
          onClick={() => navigate(`/dashboard/agents/${agent.id}/profile`)}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};

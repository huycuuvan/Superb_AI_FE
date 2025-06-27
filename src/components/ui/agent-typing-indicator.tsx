import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BrainCircuit } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { adventurer  } from '@dicebear/collection';
import { memo, useEffect, useRef } from 'react';

interface SubflowLog {
  type: "subflow_log";
  thread_id: string;
  content: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

interface AgentTypingIndicatorProps {
  agentName?: string | null;
  agentAvatar?: string | null;
  subflowLogs?: SubflowLog[]; // Thêm prop mới cho subflow logs
}

export const AgentTypingIndicator = memo(({ agentName, agentAvatar, subflowLogs = [] }: AgentTypingIndicatorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll khi có log mới
  useEffect(() => {
    if (containerRef.current && subflowLogs.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [subflowLogs]);

  // Hàm để chọn nội dung hiển thị dựa trên subflow logs hoặc stage
  const getIndicatorContent = () => {
    // Hiển thị subflow log nếu có
    if (subflowLogs.length > 0) {
      const latestLog = subflowLogs[subflowLogs.length - 1];
      
      // Format timestamp
      const formatTime = (timestamp: string) => {
        try {
          const date = new Date(timestamp);
          return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          });
        } catch {
          return '';
        }
      };

      return (
        <div className="space-y-1" ref={containerRef}>
          {/* Hiển thị log mới nhất với animation */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground animate-in fade-in-50 duration-300">
            <BrainCircuit className="h-4 w-4 animate-pulse" />
            <span>{latestLog.content}</span>
            <span className="text-xs text-muted-foreground/60">
              {formatTime(latestLog.timestamp)}
            </span>
            {subflowLogs.length > 1 && (
              <span className="text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full text-muted-foreground/70">
                {subflowLogs.length} bước
              </span>
            )}
          </div>
          
          {/* Hiển thị các log trước đó nếu có nhiều hơn 1 log */}
          {subflowLogs.length > 1 && (
            <div className="space-y-1">
              {subflowLogs.slice(-3, -1).map((log, index) => (
                <div key={`${log.timestamp}-${index}`} className="flex items-center space-x-2 text-xs text-muted-foreground/70">
                  <div className="h-2 w-2 bg-muted-foreground/50 rounded-full"></div>
                  <span>{log.content}</span>
                  <span className="text-xs text-muted-foreground/50">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Mặc định chỉ hiển thị icon "..." khi chưa có subflow logs
    return (
      <div className="flex items-center space-x-1" aria-label="Agent is typing">
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
      </div>
    );
  };

  return (
    <div className="flex items-end justify-start animate-in fade-in-50 duration-300 py-2">
      <div className="h-8 w-8 md:h-9 md:w-9 mx-2 flex-shrink-0 flex items-center justify-center">
        {agentAvatar ? (
          <div dangerouslySetInnerHTML={{ __html: agentAvatar }} style={{ width: 36, height: 36 }} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: createAvatar(adventurer, { seed: agentName || 'Agent' }).toString() }} style={{ width: 36, height: 36 }} />
        )}
      </div>
      <div className="max-w-[75%] p-3 rounded-2xl shadow-sm bg-muted rounded-bl-lg">
        {getIndicatorContent()}
      </div>
    </div>
  );
});

AgentTypingIndicator.displayName = 'AgentTypingIndicator';
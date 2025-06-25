import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, BrainCircuit, Hourglass } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { adventurer  } from '@dicebear/collection';

interface AgentTypingIndicatorProps {
  agentName?: string | null;
  agentAvatar?: string | null;
  stage: number; // Prop mới để nhận giai đoạn
}

export const AgentTypingIndicator = ({ agentName, agentAvatar, stage }: AgentTypingIndicatorProps) => {
  
  // Hàm để chọn nội dung hiển thị dựa trên stage
  const getIndicatorContent = () => {
    switch (stage) {
      // Giai đoạn 1: Sau 15s
      case 1:
        return (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground animate-pulse">
            <BrainCircuit className="h-4 w-4" />
            <span>Đang phân tích sâu hơn...</span>
          </div>
        );
      // Giai đoạn 2: Sau 30s
      case 2:
        return (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Hourglass className="h-4 w-4 animate-spin" />
            <span>Gần xong rồi, vui lòng chờ...</span>
          </div>
        );
      // Giai đoạn 3: Sau 60s
      case 3:
          return (
            <div className="flex items-center space-x-2 text-sm text-amber-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Tác vụ này cần thêm thời gian.</span>
            </div>
          );
      // Giai đoạn 0 (mặc định)
      case 0:
      default:
        return (
          <div className="flex items-center space-x-1" aria-label="Agent is typing">
            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
          </div>
        );
    }
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
};
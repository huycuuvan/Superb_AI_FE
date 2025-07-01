import { BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SubflowLog {
  type: string;
  thread_id: string;
  content: string;
  timestamp?: string;
  created_at?: string;
  updated_at?: string;
  log_message?: string; // fallback cho một số API trả về log_message
}

export default function LogAgentThinking({ logs }: { logs: SubflowLog[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  if (!logs || logs.length === 0) return null;
  const logsToShow = isExpanded ? logs : logs.slice(-2); // Hiển thị 2 log mới nhất khi thu gọn
  return (
    <div className="relative space-y-1 mt-1">
      <div className="flex items-center gap-1 text-xs text-blue-500 font-semibold mb-1">
        <BrainCircuit className="w-4 h-4" />
        {t( 'agent_chat.log_agent_thinking')}
      </div>
      {/* Nút toggle thu gọn/mở rộng */}
      <button
        type="button"
        onClick={() => setIsExpanded(v => !v)}
        className="absolute -top-3 -right-2 z-10 h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted-foreground/10 transition"
          aria-label={isExpanded ? t('agent_chat.collapse_log') : t('agent_chat.expand_log')}
      >
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 space-y-2">
        {logsToShow.map((log, idx) => (
          <div key={(log.timestamp || log.created_at || idx)} className="flex items-start gap-2 text-xs text-blue-900 dark:text-blue-200">
            <span>{log.content || log.log_message}</span>
          </div>
        ))}
        {!isExpanded && logs.length > 2 && (
          <div className="text-xs text-blue-500 cursor-pointer underline" onClick={() => setIsExpanded(true)}>
            {t('agent_chat.show_all_steps', { count: logs.length })}
          </div>
        )}
      </div>
    </div>
  );
}
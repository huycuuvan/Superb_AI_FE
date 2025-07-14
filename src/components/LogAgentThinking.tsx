/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SubflowLog {
  type: string;
  thread_id: string;
  content: string;
  timestamp?: string;
  created_at?: string;
  updated_at?: string;
  log_message?: string; // fallback cho một số API trả về log_message
  is_result?: boolean; // flag để phân biệt log kết quả
}

// Component cho từng log message với tính năng thu gọn
const LogMessage = ({ log, isCollapsed }: { log: SubflowLog, isCollapsed?: boolean }) => {
  console.log('LogMessage', log, 'is_result:', log.is_result);
  const isResult = !!log.is_result;
  const [isExpanded, setIsExpanded] = useState(false);
  const content = log.content || log.log_message || '';
  const isLongContent = content.length > 200 || content.split('\n').length > 5;
  // Nếu là log kết quả, luôn render markdown, căn phải, màu xanh lá nổi bật, border/shadow
  if (isResult) {
    const displayContent = isExpanded || !isLongContent ? content : content.substring(0, 200) + '...';
    return (
      <div className={
        `max-w-[85%] ml-auto rounded-lg relative border shadow-md mt-2 ` +
        (isCollapsed ? 'p-2 text-xs max-h-[60px] overflow-hidden leading-tight bg-green-50 dark:bg-green-900/40 border-green-300 dark:border-green-700' : 'p-3 text-sm bg-green-50 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100')
      } style={isCollapsed ? {minHeight: 'unset'} : {}}>
        <div className="whitespace-pre-line break-words" style={isCollapsed ? {WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden'} : {}}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
        </div>
        {isLongContent && !isCollapsed && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -top-2 -right-2 z-10 h-6 w-6 flex items-center justify-center rounded-full text-xs transition bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 text-green-700 dark:text-green-300"
            aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>
    );
  }
  // Log thực thi: màu xanh dương nhạt, căn trái rõ ràng
  if (!isLongContent) {
    return (
      <div className={
        `max-w-[85%] rounded-lg relative border shadow-sm mr-0 ml-0 ` +
        (isCollapsed ? 'p-2 text-xs max-h-[60px] overflow-hidden leading-tight bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600' : 'p-4 text-sm bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-100')
      } style={isCollapsed ? {minHeight: 'unset'} : {}}>
        <div className="whitespace-pre-line break-words" style={isCollapsed ? {WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden'} : {}}>
          {content}
        </div>
      </div>
    );
  }
  const displayContent = isExpanded ? content : content.substring(0, 200) + '...';
  return (
    <div className={
      `max-w-[85%] rounded-lg relative border shadow-sm mr-0 ml-0 ` +
      (isCollapsed ? 'p-2 text-xs max-h-[60px] overflow-hidden leading-tight bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600' : 'p-4 text-sm bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-100')
    } style={isCollapsed ? {minHeight: 'unset'} : {}}>
      <div className="whitespace-pre-line break-words" style={isCollapsed ? {WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden'} : {}}>
        {displayContent}
      </div>
      {!isCollapsed && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-2 -right-2 z-10 h-6 w-6 flex items-center justify-center rounded-full text-xs transition bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300"
          aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
        >
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
};

export { LogMessage };

export default function LogAgentThinking({ logs, isCollapsed: isCollapsedProp }: { logs: SubflowLog[] | any[] , isCollapsed?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  if (!logs || logs.length === 0) return null;
  // Sắp xếp logs theo thứ tự thời gian để tạo cuộc hội thoại
  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
    const timeB = new Date(b.timestamp || b.created_at || 0).getTime();
    return timeA - timeB;
  });
  // Số lượng log hiển thị khi thu gọn (có thể điều chỉnh)
  const LOGS_TO_SHOW_WHEN_COLLAPSED = 2;
  // Ưu tiên prop isCollapsed nếu có, nếu không thì dùng state nội bộ
  const isCollapsed = typeof isCollapsedProp === 'boolean' ? isCollapsedProp : !isExpanded;

  // Nếu đang thu gọn, chỉ hiển thị tiêu đề, click vào tiêu đề để mở rộng
  if (isCollapsed) {
    return (
      <div className="relative space-y-1 mt-1 no-scrollbar">
        <div className="flex items-center gap-1 text-xs text-blue-500 font-semibold mb-1 cursor-pointer select-none sticky top-0 z-10" onClick={() => setIsExpanded(true)}>
          <BrainCircuit className="w-4 h-4" />
          {t('agent_chat.log_agent_thinking')}
          <ChevronDown className="h-4 w-4 ml-1" />
        </div>
      </div>
    );
  }

  // Nếu đang mở rộng, hiển thị toàn bộ log và nút thu gọn
  return (
    <div className="relative space-y-1 mt-1 no-scrollbar">
      <div className="flex items-center gap-1 text-xs text-blue-500 font-semibold mb-1 cursor-pointer select-none sticky top-0 z-10" onClick={() => setIsExpanded(false)}>
        <BrainCircuit className="w-4 h-4" />
        {t('agent_chat.log_agent_thinking')}
        <ChevronUp className="h-4 w-4 ml-1" />
      </div>
      <div className="space-y-2">
        {sortedLogs.map((log, idx) => (
          <div key={idx} className={log.is_result ? 'flex justify-end' : 'flex justify-start'}>
            <LogMessage log={log} isCollapsed={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
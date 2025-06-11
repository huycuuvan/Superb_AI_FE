/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/chat/ChatMessageContent.tsx

import { useState, useMemo, memo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';

interface ChatMessageContentProps {
  content: string;
  isAgent: boolean;
}

const MAX_LINES_BEFORE_COLLAPSE = 5;
const MAX_CHARS_BEFORE_COLLAPSE = 500;

// Component Nút Copy tái sử dụng
const CopyButton = ({ elementRef }: { elementRef: React.RefObject<HTMLElement> }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = elementRef.current?.innerText;

    if (!textToCopy) {
      toast({
        title: "Lỗi!",
        description: "Không có nội dung để sao chép.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast({
        title: "Đã sao chép!",
        description: "Nội dung đã được sao chép vào clipboard.",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000); // Reset sau 2 giây
    }).catch(err => {
      console.error('Không thể sao chép', err);
      toast({
        title: "Lỗi sao chép!",
        description: "Không thể sao chép nội dung. Vui lòng thử lại.",
        variant: "destructive",
        duration: 2000,
      });
    });
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="absolute top-1 right-1 h-8 w-8 text-white/70 hover:bg-white/20 hover:text-white"
            aria-label="Sao chép"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Đã sao chép" : "Sao chép"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Component riêng cho code block để sử dụng useRef
const CodeBlockRenderer = ({ node, children, ...props }: any) => {
  const preRef = useRef<HTMLPreElement>(null);
  return (
    <div className="relative">
      <pre ref={preRef} className="bg-black/80 rounded-md p-3 my-2 overflow-x-auto text-white break-all whitespace-pre-wrap" {...props}>
        {children}
      </pre>
      <CopyButton elementRef={preRef} />
    </div>
  );
};

// Component riêng cho table để sử dụng useRef
const TableRenderer = ({ node, ...props }: any) => {
  const tableRef = useRef<HTMLTableElement>(null);
  return (
    <div className="relative">
      <table ref={tableRef} className="w-full my-2 border-collapse border border-slate-400" {...props} />
      <CopyButton elementRef={tableRef} />
    </div>
  );
};

export const ChatMessageContent = memo(({ content, isAgent }: ChatMessageContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // --- THAY ĐỔI CỐT LÕI NẰM Ở ĐÂY ---
  const isLongMessage = useMemo(() => {
    // Nếu tin nhắn là của Agent, KHÔNG BAO GIỜ thu gọn.
    if (isAgent) {
      return false;
    }

    // Logic thu gọn chỉ áp dụng cho tin nhắn của User.
    const lineCount = (content.match(/\n/g) || []).length + 1;
    return lineCount > MAX_LINES_BEFORE_COLLAPSE || content.length > MAX_CHARS_BEFORE_COLLAPSE;
  }, [content, isAgent]); // Thêm isAgent vào dependency array

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const commonMarkdownProps = {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeRaw],
    components: {
      p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
      pre: CodeBlockRenderer,
      code: ({ node, ...props }: any) => <code className="bg-black/20 text-red-400 rounded px-1 py-0.5 mx-0.5" {...props} />,
      a: ({node, ...props}: any) => <a className="text-blue-500 hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props} />,
      ul: ({ node, ...props }: any) => <ul className="list-disc list-outside pl-5 my-2 space-y-1" {...props} />,
      ol: ({ node, ...props }: any) => <ol className="list-decimal list-outside pl-5 my-2 space-y-1" {...props} />,
      li: ({ node, ...props }: any) => <li className="pl-1 [&>p:first-of-type]:inline" {...props} />,
      table: TableRenderer,
      thead: ({ node, ...props }: any) => <thead className="bg-slate-100 dark:bg-slate-800" {...props} />,
      th: ({ node, ...props }: any) => <th className="border border-slate-300 dark:border-slate-600 font-semibold p-2 text-left" {...props} />,
      td: ({ node, ...props }: any) => <td className="border border-slate-300 dark:border-slate-700 p-2" {...props} />,
    }
  };

  const renderContent = () => {
    if (isAgent) {
      return <ReactMarkdown {...commonMarkdownProps}>{content}</ReactMarkdown>;
    } else {
      // User message
      const displayedContent = (isLongMessage && !isExpanded)
        ? content.split('\n').slice(0, MAX_LINES_BEFORE_COLLAPSE).join('\n') + "\n..."
        : content;

      return <p className="whitespace-pre-wrap break-all">{displayedContent}</p>;
    }
  };
  
  const containerClassName = cn(
    'w-full',
    isAgent ? 'text-card-foreground' : 'text-primary-foreground',
    // Apply max-height and overflow-y only to non-agent long messages when not expanded
    isLongMessage && !isExpanded && !isAgent && 'max-h-[60vh] overflow-y-auto'
  );

  const ToggleButton = ({ isExpanded }: { isExpanded: boolean }) => (
    <div className="absolute -top-3 -right-3">
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleToggleExpand} className="h-7 w-7">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        <span className="sr-only">{isExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isExpanded ? 'Thu gọn văn bản' : 'Mở rộng văn bản'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );

  return (
    <div className="relative pt-2 pr-2">
        <div className={containerClassName}>
            {renderContent()}
        </div>
        
        {/* Nút bấm chỉ hiển thị nếu isLongMessage là true */}
        {isLongMessage && (
            <ToggleButton isExpanded={isExpanded} />
        )}
    </div>
  );
});
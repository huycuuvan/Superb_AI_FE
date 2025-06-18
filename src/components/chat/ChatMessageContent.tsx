/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/chat/ChatMessageContent.tsx

import { useState, useMemo, memo, useEffect, useRef } from 'react';
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
  stream: boolean;
}

const STREAMING_SPEED = 15;

// ... Các component CopyButton, CodeBlockRenderer, TableRenderer không thay đổi ...
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
      setTimeout(() => setCopied(false), 2000);
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
const TableRenderer = ({ node, ...props }: any) => {
  const tableRef = useRef<HTMLTableElement>(null);
  return (
    <div className="relative">
      <table ref={tableRef} className="w-full my-2 border-collapse border border-slate-400" {...props} />
      <CopyButton elementRef={tableRef} />
    </div>
  );
};

export const ChatMessageContent = memo(({ content, isAgent, stream }: ChatMessageContentProps) => {
  
  // ================================================================
  // ===== ĐÂY LÀ SỰ THAY ĐỔI QUAN TRỌNG NHẤT ========================
  // ================================================================
  // Khởi tạo state một cách thông minh:
  // - Nếu là tin nhắn cần stream, bắt đầu với chuỗi rỗng "".
  // - Nếu không, hiển thị toàn bộ nội dung ngay lập tức.
  const [displayedContent, setDisplayedContent] = useState(() => 
    (isAgent && stream) ? "" : content
  );

  useEffect(() => {
    // Nếu không cần stream, chỉ cần đảm bảo nội dung cuối cùng được hiển thị.
    if (!stream || !isAgent) {
      if (displayedContent !== content) {
        setDisplayedContent(content);
      }
      return;
    }
    
    // Nếu nội dung đã hiển thị đầy đủ, không cần làm gì thêm.
    if (displayedContent.length === content.length) {
      return;
    }

    // Logic animation dùng setTimeout, đảm bảo luôn tiếp tục từ vị trí hiện tại.
    const timerId = setTimeout(() => {
      // Nếu nội dung mới không phải là phần tiếp theo của nội dung cũ 
      // (ví dụ: một tin nhắn agent mới hoàn toàn chen vào), hãy reset.
      if (!content.startsWith(displayedContent)) {
        setDisplayedContent(content.substring(0, 1));
      } else {
        // Ngược lại, tiếp tục "gõ" ký tự tiếp theo.
        const nextCharIndex = displayedContent.length + 1;
        setDisplayedContent(content.substring(0, nextCharIndex));
      }
    }, STREAMING_SPEED);
    
    // Dọn dẹp timer
    return () => clearTimeout(timerId);

  }, [content, stream, isAgent, displayedContent]);


  // Logic thu gọn/mở rộng cho tin nhắn user (không đổi)
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongMessage = useMemo(() => {
      if (isAgent) return false;
      const lineCount = (content.match(/\n/g) || []).length + 1;
      return lineCount > 5 || content.length > 500;
  }, [content, isAgent]);
  
  // Các hàm và JSX render khác không thay đổi...
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
      return <ReactMarkdown {...commonMarkdownProps}>{displayedContent}</ReactMarkdown>;
    } else {
      const userContent = (isLongMessage && !isExpanded)
        ? content.split('\n').slice(0, 5).join('\n') + "\n..."
        : content;
      return <p className="whitespace-pre-wrap break-all">{userContent}</p>;
    }
  };
  const containerClassName = cn( 'w-full', isAgent ? 'text-card-foreground' : 'text-primary-foreground' );
  const ToggleButton = ({ isExpanded }: { isExpanded: boolean }) => (
    <div className="absolute -top-3 right-1">
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleToggleExpand} className="h-7 w-7">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        <span className="sr-only">{isExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>{isExpanded ? 'Thu gọn văn bản' : 'Mở rộng văn bản'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
  
  return (
    <div className="relative pt-2">
        <div className={containerClassName}>
            {renderContent()}
        </div>
        {isLongMessage && ( <ToggleButton isExpanded={isExpanded} /> )}
    </div>
  );
});
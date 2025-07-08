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
  timestamp?: string;
}

const STREAMING_SPEED = 15;

// --- CÁC COMPONENT PHỤ (KHÔNG THAY ĐỔI) ---
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
            className={
              `absolute top-1 right-1 h-8 w-8
              border transition-colors
              dark:text-white/70 dark:hover:bg-white/20 dark:border-transparent
              text-slate-700 hover:bg-slate-100 border-slate-200`
            }
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
    <div
      className={
        cn(
          "relative my-2 group border overflow-x-auto",
          "bg-gradient-to-br from-[#23272f] via-[#18181b] to-[#23272f] dark:from-[#18181b] dark:via-[#23272f] dark:to-[#18181b]",
          "border-violet-500/60 dark:border-blue-400/40",
          "rounded-xl shadow-lg"
        )
      }
    >
      <pre
        ref={preRef}
        className={
          cn(
            "p-4 text-sm font-mono text-white dark:text-blue-100 bg-transparent rounded-xl whitespace-pre-wrap break-all transition-colors duration-200",
            "scrollbar-thin scrollbar-thumb-violet-400/40 scrollbar-track-transparent"
          )
        }
        style={{ fontFamily: 'JetBrains Mono, Fira Mono, Menlo, monospace', minHeight: 48 }}
        {...props}
      >
        {children}
      </pre>
      <CopyButton elementRef={preRef} />
      <style>{`
        .group:hover pre {
          background: linear-gradient(90deg, #6d28d9 0%, #2563eb 100%, #23272f 100%);
          color: #fff;
        }
      `}</style>
    </div>
  );
};

const TableRenderer = ({ node, ...props }: any) => {
  const tableRef = useRef<HTMLTableElement>(null);
  return (
    <div className="relative pt-2 pr-10">
      <CopyButton elementRef={tableRef} />
      <table ref={tableRef} className="w-full my-2 border-collapse border border-slate-400" {...props} />
    </div>
  );
};

const isVideoUrl = (url: string) =>
  /^https?:\/\/.*\.(mp4|webm|ogg)(\?.*)?$/i.test(url.trim());

// Hàm đệ quy hiển thị JSON dạng bảng lồng bảng
function renderJsonAsTable(data: any): JSX.Element {
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="italic text-muted-foreground">[]</span>;
    return (
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="border border-violet-400/30 dark:border-blue-400/20 rounded-lg p-2 bg-background/60">
            <div className="text-xs text-muted-foreground mb-1">#{idx + 1}</div>
            {typeof item === 'object' && item !== null ? renderJsonAsTable(item) : <span>{String(item)}</span>}
          </div>
        ))}
      </div>
    );
  }
  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data);
    if (entries.length === 0) return <span className="italic text-muted-foreground">Không có dữ liệu để hiển thị</span>;
    return (
      <table className="min-w-[220px] w-full border border-slate-300 dark:border-blue-400/40 rounded-xl bg-white dark:bg-gradient-to-br dark:from-[#18181b] dark:via-[#23272f] dark:to-[#18181b] text-sm mb-2">
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className="border-b last:border-b-0 border-slate-200 dark:border-border hover:bg-violet-100/40 dark:hover:bg-blue-900/10 transition-colors align-top">
              <td className="font-semibold px-4 py-2 text-violet-700 dark:text-blue-400 whitespace-nowrap w-1/4 align-top">{key}</td>
              <td className="px-4 py-2 text-slate-800 dark:text-foreground align-top">
                {typeof value === 'object' && value !== null
                  ? renderJsonAsTable(value)
                  : <span className="whitespace-pre-wrap">{String(value)}</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  // primitive
  return <span>{String(data)}</span>;
}

// --- COMPONENT CHÍNH ĐÃ ĐƯỢC SỬA LỖI ---
export const ChatMessageContent = memo(({ content, isAgent, stream, timestamp }: ChatMessageContentProps) => {

  // FIX: State `animatedContent` chỉ dùng cho hiệu ứng animation.
  // Nếu không stream, nó sẽ bằng `content` ngay lập tức.
  const [animatedContent, setAnimatedContent] = useState(() =>
    stream && isAgent ? '' : content
  );

  // FIX: `useEffect` được viết lại hoàn toàn để ổn định hơn.
  // Nó chỉ chạy lại khi `content`, `stream`, hoặc `isAgent` thay đổi.
  // Nó không còn phụ thuộc vào state `animatedContent` của chính nó.
  useEffect(() => {
    // Nếu không phải tin nhắn agent cần stream, hiển thị toàn bộ nội dung và dừng.
    if (!isAgent || !stream) {
      setAnimatedContent(content);
      return;
    }

    // Nếu nội dung đã hiển thị xong, không cần làm gì thêm.
    if (animatedContent === content) {
      return;
    }
    
    setAnimatedContent(''); // Reset khi có content mới đến
    let currentLength = 0;
    const timer = setInterval(() => {
      currentLength++;
      setAnimatedContent(content.substring(0, currentLength));

      if (currentLength >= content.length) {
        clearInterval(timer); // Dừng animation khi đã hiển thị hết
      }
    }, STREAMING_SPEED);

    // Hàm dọn dẹp: Rất quan trọng để tránh memory leak.
    // Sẽ được gọi khi component unmount hoặc khi effect chạy lại.
    return () => clearInterval(timer);

  }, [content, isAgent, stream]); // Chỉ phụ thuộc vào props

  // --- Logic thu gọn/mở rộng cho tin nhắn user (không đổi) ---
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongMessage = useMemo(() => {
    if (isAgent) return false;
    const lineCount = (content.match(/\n/g) || []).length + 1;
    return lineCount > 5 || content.length > 500;
  }, [content, isAgent]);

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
      a: ({ node, ...props }: any) => <a className="text-blue-500 hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props} />,
      ul: ({ node, ...props }: any) => <ul className="list-disc list-outside pl-5 my-2 space-y-1" {...props} />,
      ol: ({ node, ...props }: any) => <ol className="list-decimal list-outside pl-5 my-2 space-y-1" {...props} />,
      li: ({ node, ...props }: any) => <li className="pl-1 [&>p:first-of-type]:inline" {...props} />,
      table: TableRenderer,
      thead: ({ node, ...props }: any) => <thead className="bg-slate-100 dark:bg-slate-800" {...props} />,
      th: ({ node, ...props }: any) => <th className="border border-slate-300 dark:border-slate-600 font-semibold p-2 text-left" {...props} />,
      td: ({ node, ...props }: any) => <td className="border border-slate-300 dark:border-slate-700 p-2" {...props} />,
    }
  };

  // --- FIX: Logic render nội dung được tối ưu ---
  const renderContent = () => {
    // FIX: Các điều kiện kiểm tra (isVideoUrl, JSON.parse) phải dùng `content` (chuỗi đầy đủ).
    // Nhưng component render ra thì dùng `animatedContent` để có hiệu ứng typing.

    // 1. Kiểm tra Video
    // Tách các dòng và kiểm tra xem có dòng nào là link video không
    const contentLines = content.trim().split('\n');
    const isPotentiallyVideo = contentLines.some(line => isVideoUrl(line));

    if (isAgent && isPotentiallyVideo) {
      const animatedLines = animatedContent.split('\n');
      return (
        <div className="space-y-2">
          {animatedLines.map((line, idx) =>
            // Chỉ render video nếu dòng đó (trong content đầy đủ) LÀ link video
            isVideoUrl(contentLines[idx] || '') ? (
              <video
                key={idx}
                src={line.trim()} // src dùng line đang được stream
                controls
                className="max-w-xs rounded shadow mx-auto my-2"
                style={{ maxHeight: 320 }}
              />
            ) : (
              // Ngược lại, render dưới dạng markdown
              <ReactMarkdown key={idx} {...commonMarkdownProps}>{line}</ReactMarkdown>
            )
          )}
        </div>
      );
    }
    
    // 2. Kiểm tra JSON
    let parsedJson = null;
    try {
        // Chỉ thử parse khi không còn stream để đảm bảo chuỗi JSON hoàn chỉnh
        if (!stream) {
           parsedJson = JSON.parse(content);
        }
    } catch (e) { /* Không phải JSON, bỏ qua */ }

    if (isAgent && parsedJson && typeof parsedJson === 'object' && parsedJson !== null) {
      // Nếu là JSON, hiển thị bảng lồng bảng cho mọi object/array
      if (stream) {
        return <p>...</p>;
      }
      return (
        <div className="overflow-x-auto my-2 whitespace-pre-wrap">
          {renderJsonAsTable(parsedJson)}
        </div>
      );
    }

    // 3. Mặc định render Markdown
    if (isAgent) {
      // Luôn dùng animatedContent để có hiệu ứng typing
      return <ReactMarkdown {...commonMarkdownProps}>{animatedContent}</ReactMarkdown>;
    }

    // 4. Tin nhắn của User (logic mặc định)
    const userContent = (isLongMessage && !isExpanded)
      ? content.split('\n').slice(0, 5).join('\n') + "\n..."
      : content;
    return <p className="whitespace-pre-wrap">{userContent}</p>;
  };

  const containerClassName = cn(
    'w-full',
    isAgent
      ? 'text-slate-800 dark:text-card-foreground'
      : 'text-white'
  );
  
  const ToggleButton = ({ isExpanded }: { isExpanded: boolean }) => (
    <div className="absolute -top-2 -right-2 z-10">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleExpand}
              className="h-8 w-8  bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
              aria-label={isExpanded ? 'Thu gọn văn bản' : 'Mở rộng văn bản'}
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" align="center">
            {isExpanded ? 'Thu gọn văn bản' : 'Mở rộng văn bản'}
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
      {/* Timestamp và Toggle Button không thay đổi */}
      {isLongMessage && ( <ToggleButton isExpanded={isExpanded} /> )}
    </div>
  );
});

// Loại bỏ timestamp khỏi đây, vì nó sẽ được render riêng bên ngoài
// để không bị ảnh hưởng bởi logic re-render của content
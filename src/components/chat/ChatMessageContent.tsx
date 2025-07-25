/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/chat/ChatMessageContent.tsx

import { useState, useMemo, memo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import {
  isImageUrl,
  getDirectImageUrl,
  sanitizeMarkdownImages,
} from "@/utils/imageUtils";

interface ChatMessageContentProps {
  content: string;
  isAgent: boolean;
  stream: boolean;
  timestamp?: string;
  images?: string[];
  onSavePlan?: () => void; // Thêm prop callback
}

const STREAMING_SPEED = 3; // Giảm xuống 3ms để mượt hơn

// --- CÁC COMPONENT PHỤ (KHÔNG THAY ĐỔI) ---
const CopyButton = ({
  elementRef,
}: {
  elementRef: React.RefObject<HTMLElement>;
}) => {
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

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        toast({
          title: "Đã sao chép!",
          description: "Nội dung đã được sao chép vào clipboard.",
          duration: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Không thể sao chép", err);
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
            className={`absolute top-1 right-1 h-8 w-8
              border transition-colors
              dark:text-white/70 dark:hover:bg-white/20 dark:border-transparent
              text-slate-700 hover:bg-slate-100 border-slate-200`}
            aria-label="Sao chép"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Đã sao chép" : "Sao chép"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CodeBlockRenderer = ({
  node,
  children,
  onSave,
  saved,
  showSave,
  ...props
}: any) => {
  const preRef = useRef<HTMLPreElement>(null);
  return (
    <div
      className={cn(
        "relative my-2 group border overflow-x-auto",
        "bg-gradient-to-br from-[#23272f] via-[#18181b] to-[#23272f] dark:from-[#18181b] dark:via-[#23272f] dark:to-[#18181b]",
        "border-violet-500/60 dark:border-blue-400/40",
        "rounded-xl shadow-lg"
      )}
    >
      <ActionButtons
        elementRef={preRef}
        onSave={onSave}
        saved={saved}
        showSave={showSave}
      />
      <pre
        ref={preRef}
        className={cn(
          "p-4 text-sm font-mono text-white dark:text-blue-100 bg-transparent rounded-xl whitespace-pre-wrap break-all transition-colors duration-200",
          "scrollbar-thin scrollbar-thumb-violet-400/40 scrollbar-track-transparent"
        )}
        style={{
          fontFamily: "JetBrains Mono, Fira Mono, Menlo, monospace",
          minHeight: 48,
        }}
        {...props}
      >
        {children}
      </pre>
      <style>{`
        .group:hover pre {
          background: linear-gradient(90deg, #6d28d9 0%, #2563eb 100%, #23272f 100%);
          color: #fff;
        }
      `}</style>
    </div>
  );
};

const ActionButtons = ({
  elementRef,
  onSave,
  saved,
  showSave = false,
}: {
  elementRef: React.RefObject<HTMLElement>;
  onSave?: () => void;
  saved?: boolean;
  showSave?: boolean;
}) => {
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

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        toast({
          title: "Đã sao chép!",
          description: "Nội dung đã được sao chép vào clipboard.",
          duration: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Không thể sao chép", err);
        toast({
          title: "Lỗi sao chép!",
          description: "Không thể sao chép nội dung. Vui lòng thử lại.",
          variant: "destructive",
          duration: 2000,
        });
      });
  };

  return (
    <div className="absolute top-2 right-2 flex items-center gap-1">
      {showSave && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                disabled={saved}
                className={cn(
                  "h-7 w-7 border transition-colors rounded-md",
                  "dark:text-white/70 dark:hover:bg-white/20 dark:border-transparent",
                  "text-slate-700 hover:bg-slate-100 border-slate-200"
                )}
              >
                {saved ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-base">+</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{saved ? "Đã lưu" : "Lưu nội dung"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className={cn(
                "h-7 w-7 border transition-colors rounded-md",
                "dark:text-white/70 dark:hover:bg-white/20 dark:border-transparent",
                "text-slate-700 hover:bg-slate-100 border-slate-200"
              )}
              aria-label="Sao chép"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? "Đã sao chép" : "Sao chép"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const TableRenderer = ({ node, onSave, saved, showSave, ...props }: any) => {
  const tableRef = useRef<HTMLTableElement>(null);
  return (
    <div className="relative my-4 group">
      <ActionButtons
        elementRef={tableRef}
        onSave={onSave}
        saved={saved}
        showSave={showSave}
      />
      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className="w-full border-collapse text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          {...props}
        />
      </div>
    </div>
  );
};

const isVideoUrl = (url: string) =>
  /^https?:\/\/.*\.(mp4|webm|ogg)(\?.*)?$/i.test(url.trim());

// Hàm đệ quy hiển thị JSON dạng bảng lồng bảng
function renderJsonAsTable(data: any): JSX.Element {
  if (Array.isArray(data)) {
    if (data.length === 0)
      return <span className="italic text-muted-foreground">[]</span>;
    return (
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="border border-violet-400/30 dark:border-blue-400/20 rounded-lg p-2 bg-background/60"
          >
            <div className="text-xs text-muted-foreground mb-1">#{idx + 1}</div>
            {typeof item === "object" && item !== null ? (
              renderJsonAsTable(item)
            ) : (
              <span>{String(item)}</span>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data);
    if (entries.length === 0)
      return (
        <span className="italic text-muted-foreground">
          Không có dữ liệu để hiển thị
        </span>
      );
    return (
      <table className="min-w-[220px] w-full border border-slate-300 dark:border-blue-400/40 rounded-xl bg-white dark:bg-gradient-to-br dark:from-[#18181b] dark:via-[#23272f] dark:to-[#18181b] text-sm mb-2">
        <tbody>
          {entries.map(([key, value]) => (
            <tr
              key={key}
              className="border-b last:border-b-0 border-slate-200 dark:border-border hover:bg-violet-100/40 dark:hover:bg-blue-900/10 transition-colors align-top"
            >
              <td className="font-semibold px-4 py-2 text-violet-700 dark:text-blue-400 whitespace-nowrap w-1/4 align-top">
                {key}
              </td>
              <td className="px-4 py-2 text-slate-800 dark:text-foreground align-top">
                {typeof value === "object" && value !== null ? (
                  renderJsonAsTable(value)
                ) : (
                  <span className="whitespace-pre-wrap">{String(value)}</span>
                )}
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
export const ChatMessageContent = memo(
  ({
    content,
    isAgent,
    stream,
    timestamp,
    images,
    onSavePlan,
  }: ChatMessageContentProps) => {
    // FIX: State `animatedContent` chỉ dùng cho hiệu ứng animation.
    // Nếu không stream, nó sẽ bằng `content` ngay lập tức.
    const [animatedContent, setAnimatedContent] = useState(() =>
      stream && isAgent ? "" : content
    );

    // Tối ưu hóa useEffect để tránh lag
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

      setAnimatedContent(""); // Reset khi có content mới đến
      let currentLength = 0;
      
      // Sử dụng requestAnimationFrame để mượt hơn
      const animate = () => {
        currentLength += 2; // Tăng 2 ký tự mỗi frame để nhanh hơn
        const newContent = content.substring(0, currentLength);
        setAnimatedContent(newContent);

        if (currentLength < content.length) {
          requestAnimationFrame(animate);
        }
      };

      // Bắt đầu animation với delay nhỏ
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 10);

      // Hàm dọn dẹp
      return () => {
        clearTimeout(timeoutId);
      };
    }, [content, isAgent, stream]); // Bỏ animatedContent dependency để tránh re-render

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
        p: ({ node, ...props }: any) => (
          <p className="mb-2 last:mb-0" {...props} />
        ),
        pre: CodeBlockRenderer,
        code: ({ node, ...props }: any) => (
          <code
            className="bg-black/20 text-red-400 rounded px-1 py-0.5 mx-0.5"
            {...props}
          />
        ),
        a: ({ node, ...props }: any) => (
          <a
            className="text-blue-500 hover:underline break-all"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        ul: ({ node, ...props }: any) => (
          <ul
            className="list-disc list-outside pl-5 my-2 space-y-1"
            {...props}
          />
        ),
        ol: ({ node, ...props }: any) => (
          <ol
            className="list-decimal list-outside pl-5 my-2 space-y-1"
            {...props}
          />
        ),
        li: ({ node, ...props }: any) => (
          <li className="pl-1 [&>p:first-of-type]:inline" {...props} />
        ),
        table: TableRenderer,
        thead: ({ node, ...props }: any) => (
          <thead className="bg-slate-100 dark:bg-slate-800" {...props} />
        ),
        th: ({ node, ...props }: any) => (
          <th
            className="border border-slate-300 dark:border-slate-600 font-semibold p-2 text-left whitespace-nowrap"
            {...props}
          />
        ),
        td: ({ node, ...props }: any) => (
          <td
            className="border border-slate-300 dark:border-slate-700 p-2 whitespace-nowrap"
            {...props}
          />
        ),
      },
    };

    // --- FIX: Logic render nội dung được tối ưu ---
    const renderContent = () => {
      // Nếu có images là mảng, render tất cả ảnh phía trên nội dung
      if (images && Array.isArray(images) && images.length > 0) {
        if (images.length === 1) {
          // 1 ảnh: giữ layout cũ
          return (
            <div className="space-y-2 mb-2">
              <img
                src={images[0]}
                alt="img-0"
                className="max-w-xs rounded shadow mx-auto my-2"
                style={{ maxHeight: 180 }}
              />
              {renderContentOrigin()}
            </div>
          );
        }
        // Nhiều ảnh: xếp hàng ngang, ảnh nhỏ lại
        return (
          <div className="space-y-2 mb-2">
            <div className="flex flex-row gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`img-${idx}`}
                  className="w-24 h-24 object-cover rounded shadow flex-shrink-0"
                />
              ))}
            </div>
            {renderContentOrigin()}
          </div>
        );
      }
      return renderContentOrigin();
    };
    // Hàm gốc để render nội dung chat như cũ
    const renderContentOrigin = () => {
      // 1. Kiểm tra Video và Ảnh
      const contentLines = content.trim().split("\n");
      const isPotentiallyVideo = contentLines.some((line) => isVideoUrl(line));
      const isPotentiallyImage = contentLines.some((line) => {
        // Kiểm tra cả link thuần và markdown link
        return (
          line
            .match(/https?:\/\/[^\s)]+/gi)
            ?.some((url) => isImageUrl(getDirectImageUrl(url))) || false
        );
      });

      // --- XỬ LÝ: Chuyển đổi mọi loại link ảnh thành markdown ảnh để hiển thị trực tiếp ---
      let processedContent = animatedContent;
      if (isAgent) {
        processedContent = sanitizeMarkdownImages(processedContent);
      }

      if (isAgent && (isPotentiallyVideo || isPotentiallyImage)) {
        const animatedLines = processedContent.split("\n");
        return (
          <div className="space-y-2">
            {animatedLines.map((line, idx) => {
              const originalLine = contentLines[idx] || "";
              // Kiểm tra video
              if (isVideoUrl(originalLine)) {
                return (
                  <video
                    key={idx}
                    src={line.trim()}
                    controls
                    className="max-w-xs rounded shadow mx-auto my-2"
                    style={{ maxHeight: 320 }}
                  />
                );
              }
              // Kiểm tra ảnh (cả link thuần và markdown)
              const urls = originalLine.match(/https?:\/\/[^\s)]+/gi) || [];
              const imageUrl = urls.find((url) =>
                isImageUrl(getDirectImageUrl(url))
              );
              if (imageUrl) {
                return (
                  <img
                    key={idx}
                    src={getDirectImageUrl(imageUrl)}
                    alt="Ảnh sản phẩm"
                    className="max-w-xs rounded shadow mx-auto my-2"
                    style={{ maxHeight: 320 }}
                    onError={(e) => {
                      console.warn("Không thể tải ảnh:", imageUrl);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                );
              }
              // Render markdown cho các dòng khác
              return (
                <ReactMarkdown key={idx} {...commonMarkdownProps}>
                  {line}
                </ReactMarkdown>
              );
            })}
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
      } catch (e) {
        /* Không phải JSON, bỏ qua */
      }

      if (
        isAgent &&
        parsedJson &&
        typeof parsedJson === "object" &&
        parsedJson !== null
      ) {
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
        return (
          <ReactMarkdown {...commonMarkdownProps}>
            {processedContent}
          </ReactMarkdown>
        );
      }

      // 4. Tin nhắn của User (logic mặc định)
      const userContent =
        isLongMessage && !isExpanded
          ? content.split("\n").slice(0, 5).join("\n") + "\n..."
          : content;
      return <p className="whitespace-pre-wrap">{userContent}</p>;
    };

    const containerClassName = cn(
      "w-full",
      isAgent ? "text-slate-800 dark:text-card-foreground" : "text-white"
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
                aria-label={isExpanded ? "Thu gọn văn bản" : "Mở rộng văn bản"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" align="center">
              {isExpanded ? "Thu gọn văn bản" : "Mở rộng văn bản"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );

    const [saved, setSaved] = useState(false);
    const [showSaveButton, setShowSaveButton] = useState(false);

    const handleSave = async () => {
      if (onSavePlan) {
        await onSavePlan();
        setSaved(true);
        // Ẩn nút sau khi lưu thành công
        setTimeout(() => {
          setShowSaveButton(false);
        }, 2000);
      }
    };

    // Kiểm tra xem nội dung có phải là đặc biệt không (cần lưu)
    const isSpecialContent = (content: string): boolean => {
      // Kiểm tra các ký tự đặc biệt của markdown
      const hasMarkdownSyntax =
        /(?:^|\n)(?:#{1,6} |---|\*\*|==|>|\d+\. |\* |- |\[ \]|\|[-|]|```)/.test(
          content
        );

      if (hasMarkdownSyntax) return true;

      // Kiểm tra có code block không
      if (content.includes("```")) return true;

      // Kiểm tra có bảng Markdown không
      if (content.includes("|") && content.includes("|-")) return true;

      // Kiểm tra có multiple newlines để phân đoạn không
      if (/\n\n/.test(content)) return true;

      return false;
    };

    // Hiện nút save khi hover vào message
    const handleMouseEnter = () => {
      if (isAgent && onSavePlan && !saved && isSpecialContent(content)) {
        setShowSaveButton(true);
      }
    };

    const handleMouseLeave = () => {
      // Chỉ ẩn nút nếu chưa lưu
      if (!saved) {
        setShowSaveButton(false);
      }
    };

    return (
      <div
        className="relative pt-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={cn(containerClassName, "pr-6 pb-2")}>
          {renderContent()}
          {/* Floating Action Button để lưu */}
          {isAgent && onSavePlan && isSpecialContent(content) && (
            <div
              className={cn(
                "absolute top-0 right-0 transition-all duration-200 ease-in-out transform",
                showSaveButton || saved
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
              )}
            >
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={saved ? "ghost" : "default"}
                      onClick={handleSave}
                      disabled={saved}
                      className={cn(
                        "h-8 w-8 rounded-full shadow-lg",
                        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
                        "dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700",
                        "transition-all duration-200",
                        saved && "bg-none bg-green-500 hover:bg-green-600"
                      )}
                    >
                      {saved ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-white text-lg">+</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="bg-slate-900 text-white"
                  >
                    <p>{saved ? "Đã lưu thành công" : "Lưu nội dung này"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        {/* Timestamp và Toggle Button không thay đổi */}
        {isLongMessage && <ToggleButton isExpanded={isExpanded} />}
      </div>
    );
  }
);

// Loại bỏ timestamp khỏi đây, vì nó sẽ được render riêng bên ngoài
// để không bị ảnh hưởng bởi logic re-render của content

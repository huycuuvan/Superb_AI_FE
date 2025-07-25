/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Code, FileVideo, Loader2, CheckCircle2, XCircle, Settings, RefreshCw, FileImage } from "lucide-react"
import { TaskRun, VideoOutputItem, TaskOutputData } from "@/types"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { API_BASE_URL } from "@/config/api"
import ReactMarkdown from 'react-markdown'

// Component hiển thị huy hiệu trạng thái (giữ nguyên)
const StatusBadge = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge variant="success" className="flex items-center gap-1.5"><CheckCircle2 size={14} /> COMPLETED</Badge>;
    case 'initiated':
    case 'processing':
      return <Badge variant="secondary" className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> PROCESSING</Badge>;
    case 'failed':
    case 'error':
      return <Badge variant="destructive" className="flex items-center gap-1.5"><XCircle size={14} /> FAILED</Badge>;
    default:
      return <Badge variant="outline">{status.toUpperCase()}</Badge>;
  }
};

// Component chính đã được cập nhật
export const TaskHistory = ({ runs, agentId, onRetry }: { runs: TaskRun[], agentId: string, onRetry: (run: TaskRun) => void }) => {
  const navigate = useNavigate();

  // Debug output_data và force render khi runs thay đổi
  useEffect(() => {
    if (runs && runs.length > 0) {
      console.log(`[TaskHistory] Nhận được ${runs.length} task runs, xử lý hiển thị...`);
      runs.forEach(run => {
        console.log(`Run ID ${run.id} output_data:`, JSON.stringify(run.output_data));
        console.log(`Run status: ${run.status}, updated_at: ${run.updated_at}`);
        
        // Kiểm tra MIME types và định dạng
        if (run.output_data && typeof run.output_data === 'object') {
          const checkMedia = (data: any) => {
            // Kiểm tra trường định dạng media
            const mediaPaths = [];
            
            // Xác định các trường có thể chứa đường dẫn media
            const checkForMediaPath = (obj: any, path: string = '') => {
              if (!obj || typeof obj !== 'object') return;
              
              Object.entries(obj).forEach(([key, value]) => {
                const currentPath = path ? `${path}.${key}` : key;
                
                // Kiểm tra nếu là đường dẫn file
                if (typeof value === 'string' && 
                    (key.includes('url') || key.includes('path') || key.includes('file')) && 
                    (value.startsWith('http') || value.startsWith('/') || value.startsWith('gs://'))) {
                  mediaPaths.push({ path: currentPath, value });
                }
                
                // Đệ quy kiểm tra các đối tượng con
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                  checkForMediaPath(value, currentPath);
                }
              });
            };
            
            checkForMediaPath(data);
            
            console.log('Detected media paths:', mediaPaths);
          };
          
          // Nếu là mảng
          if (Array.isArray(run.output_data)) {
            run.output_data.forEach(item => checkMedia(item));
          } else {
            // Nếu là đối tượng đơn
            checkMedia(run.output_data);
          }
        }
      });
    }
  }, [runs]);

  // Hàm kiểm tra nếu đường dẫn là Google Storage URL
  const isGoogleStorageUrl = (url: string): boolean => {
    return typeof url === 'string' && url.startsWith('gs://');
  };

  // Hàm tạo URL đầy đủ từ file_url
  const getFullUrl = (path: string): string => {
    // Ghi log để debug
    console.log('Building URL from path:', path);
    
    // Kiểm tra null hoặc undefined
    if (!path) {
      console.error('Path is null or undefined');
      return '';
    }
    
    // Nếu là URL đầy đủ, trả về nguyên gốc
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log('Path is already a full URL');
      return path;
    }

    // Xử lý đường dẫn từ Google Cloud Storage
    if (path.startsWith('gs://')) {
      console.log('Converting Google Storage path to HTTP URL');
      // Bạn cần thiết lập cấu hình URL GSC tương ứng
      const bucketPath = path.replace('gs://', '');
      return `https://storage.googleapis.com/${bucketPath}`;
    }
    
    // Nếu là đường dẫn tương đối, thêm base URL vào
    let fullUrl;
    if (path.startsWith('/')) {
      fullUrl = `${API_BASE_URL}${path}`;
    } else {
      fullUrl = `${API_BASE_URL}/${path}`;
    }

    console.log('Final URL:', fullUrl);
    return fullUrl;
  };

  // Hàm render output custom UI cho từng loại dữ liệu
  const renderOutput = (output: any) => {
    // Nếu là link gradio file
    if (typeof output === "string" && output.includes("/gradio_api/file=")) {
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(output);
      if (isImage) {
        return (
          <div className="flex flex-col items-center gap-2">
            <img
              src={output}
              alt="Ảnh kết quả"
              className="max-w-xs rounded shadow mx-auto"
            />
          </div>
        );
      } else {
        return (
          <a
            href={output}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold underline hover:text-blue-800"
          >
            <FileImage size={18} />
            Mở file kết quả
          </a>
        );
      }
    }

    // Nếu là object chỉ có 1 key là agent_res và là link ảnh gradio
    if (
      typeof output === "object" &&
      output !== null &&
      Object.keys(output).length === 1 &&
      output.agent_res &&
      typeof output.agent_res === "string" &&
      output.agent_res.includes("/gradio_api/file=") &&
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(output.agent_res)
    ) {
      return (
        <div className="flex flex-col items-center gap-2">
          <img
            src={output.agent_res}
            alt="Ảnh kết quả"
            className="max-w-xs rounded shadow mx-auto"
          />
        </div>
      );
    }

    // Nếu là link Google Drive
    if (typeof output === "string" && output.includes("drive.google.com")) {
      return (
        <a
          href={output}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-600 font-semibold underline hover:text-green-800"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.44 8L4 28.02L9.56 37.98H22.01L16.44 28.02H9.56L16.44 8Z" fill="#2196F3"/>
            <path d="M31.56 8L44 28.02L38.44 37.98H25.99L31.56 28.02H38.44L31.56 8Z" fill="#FFC107"/>
            <path d="M22.01 37.98H25.99L31.56 28.02H16.44L22.01 37.98Z" fill="#4CAF50"/>
          </svg>
          Mở file Google Drive
        </a>
      );
    }

    // Nếu là HTML
    if (typeof output === "string" && output.trim().startsWith("<") && output.trim().endsWith(">")) {
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: output }}
        />
      );
    }

    // Nếu là markdown
    if (typeof output === "string" && /[*_`#[\]]/.test(output)) {
      return (
        <div className="prose max-w-none prose-invert whitespace-normal">
          <ReactMarkdown>{output}</ReactMarkdown>
        </div>
      );
    }

    // Nếu là ảnh
    if (typeof output === "string" && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(output)) {
      return (
        <div className="flex flex-col items-center gap-2">
          <img src={output} alt="Ảnh kết quả" className="max-w-xs rounded shadow mx-auto" />
          <a href={output} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Mở ảnh trong tab mới</a>
        </div>
      );
    }

    // Nếu là video
    if (typeof output === "string" && /\.(mp4|webm|ogg)$/i.test(output)) {
      return (
        <div className="flex justify-center w-full">
          <video src={output} controls className="max-w-xs rounded shadow mx-auto" />
        </div>
      );
    }

    // Nếu là link
    if (typeof output === "string" && /^https?:\/\//.test(output)) {
      return (
        <a href={output} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          {output}
        </a>
      );
    }

    // Nếu là file (pdf, doc, ...)
    if (typeof output === "string" && /\.(pdf|docx?|xlsx?|pptx?)$/i.test(output)) {
      return (
        <a href={output} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 underline">
          <span role="img" aria-label="file">📄</span> Tải file
        </a>
      );
    }

    // Nếu là object có trường đặc biệt
    if (typeof output === "object" && output !== null) {
      // Nếu có trường "video_url" là video
      if (output.video_url && typeof output.video_url === "string" && /\.(mp4|webm|ogg)$/i.test(output.video_url)) {
        return (
          <div className="flex justify-center w-full">
            <video src={output.video_url} controls className="max-w-xs rounded shadow mt-2 mx-auto" />
          </div>
        );
      }
      // Nếu có trường "content" là HTML/text
      if (output.content) {
        return renderOutput(output.content);
      }
      // Nếu có trường "url" là ảnh/video/link
      if (output.url) {
        return renderOutput(output.url);
      }
      // Nếu là mảng
      if (Array.isArray(output)) {
        return (
          <div className="space-y-2">
            {output.map((item, idx) => (
              <div key={idx} className="border rounded p-2">
                {renderOutput(item)}
              </div>
            ))}
          </div>
        );
      }
      // Nếu là object thông thường: clean UI
      const entries = Object.entries(output);
      const allEmpty = entries.every(([_, value]) => !value || (typeof value === 'string' && value.trim() === ''));
      if (allEmpty) {
        return <div className="text-muted-foreground italic">Không có dữ liệu hiển thị.</div>;
      }
      // Nếu chỉ có 1 trường: hiển thị label nhỏ phía trên, value bọc box đẹp
      if (entries.length === 1) {
        const [key, value] = entries[0];
        return (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">{key}</div>
            <div className="bg-muted rounded p-3 text-sm whitespace-pre-line break-words max-w-full overflow-x-auto">
              {typeof value === 'string' && /[*_`#[\]]/.test(value)
                ? <ReactMarkdown>{value}</ReactMarkdown>
                : renderOutput(value)}
            </div>
          </div>
        );
      }
      // Nếu nhiều trường: bảng style nhẹ, key đậm nhỏ, value wrap tốt
      return (
        <table className="min-w-full text-xs border mt-2 border-border bg-muted/30 rounded">
          <tbody>
            {entries.map(([key, value]) => (
              <tr key={key}>
                <td className="font-semibold pr-2 text-muted-foreground align-top whitespace-nowrap py-1 px-2">{key}</td>
                <td className="py-1 px-2 break-words max-w-2xl">
                  {typeof value === 'string' && /[*_`#[\]]/.test(value)
                    ? <ReactMarkdown>{value}</ReactMarkdown>
                    : renderOutput(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // Nếu là text thông thường
    return <div className="text-foreground whitespace-normal">{String(output)}</div>;
  };

  if (!runs || runs.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Chưa có lịch sử thực thi nào.</p>
      </div>
    )
  }
 
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {runs.map((run) => (
          <AccordionItem key={`${run.id}-${run.updated_at}-${run.status}`} value={run.id}
            className="mb-4 border border-border rounded-xl shadow-sm bg-background/80 overflow-hidden">
            <AccordionTrigger className="hover:no-underline px-6 py-4 bg-muted/40 rounded-t-xl">
              <div className="flex justify-between items-center w-full gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <StatusBadge status={run.status} />
                  <span className="font-mono text-xs text-muted-foreground hidden md:inline truncate">Run ID: {run.id}</span>
                </div>
                <span className="text-xs text-muted-foreground font-normal flex-shrink-0">{new Date(run.start_time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 space-y-6 bg-background rounded-b-xl">
              {(run.status === 'error' || run.status === 'failed') && (
                <div className="my-4">
                  <div className="flex items-center gap-3 mb-2">
                    <XCircle size={32} className="text-destructive" />
                    <div>
                      <h4 className="font-bold text-lg text-destructive flex items-center gap-2">Đã xảy ra lỗi khi thực thi Task</h4>
                      <span className="text-xs text-muted-foreground">Mã lỗi: <span className="font-mono">{String((run.output_data && typeof run.output_data === 'object' && !Array.isArray(run.output_data) && (run.output_data.error_code || run.output_data.code)) || 'N/A')}</span></span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm font-mono whitespace-pre-wrap break-all select-all">
                    {run.error || run.error_message || (run.output_data && typeof run.output_data === 'object' && 'error_message' in run.output_data && String(run.output_data.error_message)) || (run.output_data && typeof run.output_data === 'object' && 'error' in run.output_data && (typeof run.output_data.error === 'string' ? run.output_data.error : JSON.stringify(run.output_data.error, null, 2))) || 'Đã xảy ra lỗi không xác định'}
                  </div>
                  {(run.error || run.error_message || '').toLowerCase().includes('workflow webhook error') && (
                    <div className="mt-3 p-3 rounded-md bg-yellow-50 border border-yellow-300 text-yellow-900 text-xs">
                      <b>Gợi ý:</b> Lỗi Workflow Webhook Error thường do webhook cấu hình sai hoặc server không phản hồi.<br />- Kiểm tra lại URL webhook, xác thực và trạng thái server.<br />- Nếu vẫn gặp lỗi, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật.
                    </div>
                  )}
                  {run.output_data && typeof run.output_data === 'object' && !Array.isArray(run.output_data) && 'raw_response' in run.output_data && run.output_data.raw_response && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Xem raw response</summary>
                      <pre className="bg-muted rounded p-2 select-all max-h-60 overflow-auto">{String(run.output_data.raw_response)}</pre>
                    </details>
                  )}
                  <Button variant="outline" className="w-full mt-4" onClick={() => onRetry(run)}>
                    <RefreshCw className="mr-2 h-4 w-4" />Thử lại Task này
                  </Button>
                </div>
              )}

              {/* Input */}
              <div className="rounded-lg bg-muted/60 p-4 mb-2 border border-border">
                <h4 className="font-bold mb-2 flex items-center gap-2 text-primary dark:text-blue-400 text-lg tracking-wide">
                  <Code size={18} className="text-primary dark:text-blue-400" />
                  Dữ liệu đầu vào (Input)
                </h4>
                <div className="space-y-2 font-mono text-sm">
                  {Object.entries(run.input_data).map(([key, value]) => {
                    const valueStr = String(value);
                    const isUrl = valueStr.startsWith('http://') || valueStr.startsWith('https://');
                    return (
                      <div key={`${run.id}-input-${key}`} className="grid grid-cols-[100px_1fr] gap-2 items-start">
                        <span className="text-muted-foreground truncate font-semibold">{key}:</span>
                        {isUrl ? (
                          <a href={valueStr} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{valueStr}</a>
                        ) : (
                          <span className="break-all text-white">{valueStr}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Output */}
              <div className="rounded-lg bg-muted/40 p-4 border border-border">
                <h4 className="font-bold mb-2 flex items-center gap-2 text-green-600 dark:text-green-400 text-lg tracking-wide">
                  <FileVideo size={18} className="text-green-600 dark:text-green-400" />
                  Kết quả (Output)
                </h4>
                {(run.status === 'error' || run.status === 'failed') ? null :
                  ((!run.output_data || Object.keys(run.output_data).length === 0) ? (
                    <div className="p-3 rounded-md bg-background text-sm text-muted-foreground">Không có dữ liệu đầu ra.</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-foreground mb-2">
                        <span className="font-semibold text-primary dark:text-blue-400">Output type:</span> <code className="text-foreground">{typeof run.output_data}</code>
                      </div>
                      {/* Dữ liệu gốc collapse */}
                      <details className="text-xs mb-2">
                        <summary className="cursor-pointer text-primary dark:text-blue-400 hover:text-foreground font-bold">Dữ liệu gốc (JSON)</summary>
                        <pre className="mt-2 p-2 bg-muted rounded-md overflow-auto max-h-80 text-xs">{JSON.stringify(run.output_data, null, 2)}</pre>
                      </details>
                      {/* Hiển thị output đẹp */}
                      {Array.isArray(run.output_data) ? (
                        <div className="space-y-4">
                          {run.output_data.map((item, index) => (
                            <div key={`${run.id}-output-array-${index}-${run.updated_at}`} className="border border-border rounded-md p-3">
                              <h5 className="text-base font-bold mb-2 text-green-600 dark:text-green-400">Kết quả #{index + 1}</h5>
                              {renderOutput(item)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div key={`${run.id}-output-object-${run.updated_at}`}>
                          {renderOutput(run.output_data)}
                        </div>
                      )}

                    </div>
                  ))
                }
              </div>

              {/* Nút thiết lập tự động */}
              {String(run.status) === 'completed' && (
                <div className="pt-4 border-t border-border">
                  <Button onClick={() => navigate(`/dashboard/agents/${agentId}/task/${run.task_id}/config`, { state: { inputData: run.input_data } })} className="w-full button-gradient-light dark:button-gradient-dark text-white">
                    <Settings className="mr-2 h-4 w-4" />Thiết lập tự động
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
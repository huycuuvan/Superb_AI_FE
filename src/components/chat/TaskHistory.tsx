/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Code, FileVideo, Loader2, CheckCircle2, XCircle, Settings, RefreshCw } from "lucide-react"
import { TaskRun, VideoOutputItem, TaskOutputData } from "@/types"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

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

  // Debug output_data
  useEffect(() => {
    if (runs && runs.length > 0) {
      runs.forEach(run => {
        console.log(`Run ID ${run.id} output_data:`, JSON.stringify(run.output_data));
      });
    }
  }, [runs]);

  // Hàm kiểm tra nếu đường dẫn là Google Storage URL
  const isGoogleStorageUrl = (url: string): boolean => {
    return typeof url === 'string' && url.startsWith('gs://');
  };

  const renderOutput = (output: any) => {
    console.log('Rendering output:', output);
    
    // Kiểm tra nếu output là string
    if (typeof output === 'string') {
      // Kiểm tra nếu là URL
      if (output.startsWith('http')) {
        return (
          <div className="mt-2">
            <a 
              href={output} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Xem kết quả
            </a>
          </div>
        );
      }
      // Nếu là text thông thường
      return <div className="mt-2 text-gray-700">{output}</div>;
    }

    // Kiểm tra nếu output là object
    if (typeof output === 'object' && output !== null) {
      // Kiểm tra các trường hợp đặc biệt
      if (output.error) {
        return <div className="mt-2 text-red-500">{output.error}</div>;
      }

      if (output.video_url) {
        return (
          <div className="mt-2 flex justify-center">
            <video 
              src={output.video_url} 
              controls 
              className="max-h-[50vh] w-auto aspect-[9/16] rounded-xl shadow-lg object-cover bg-black"
              style={{ maxWidth: '100%' }}
            />
          </div>
        );
      }

      if (output.image_url) {
        return (
          <div className="mt-2">
            <img 
              src={output.image_url} 
              alt="Generated" 
              className="max-w-full rounded-lg"
            />
          </div>
        );
      }

      // Nếu là object thông thường, hiển thị dạng JSON
      return (
        <div className="mt-2">
          <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      );
    }

    // Trường hợp mặc định
    return <div className="mt-2 text-gray-700">Không có kết quả</div>;
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
      {/* Phần tiêu đề và Accordion giữ nguyên */}
      <Accordion type="single" collapsible className="w-full">
        {runs.map((run) => (
          <AccordionItem key={run.id} value={run.id}>
            <AccordionTrigger className="hover:no-underline">
              {/* AccordionTrigger layout giữ nguyên */}
              <div className="flex justify-between items-center w-full pr-4 gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={run.status} />
                   
                  </div>
                  <span className="font-mono text-xs text-muted-foreground hidden md:inline truncate">
                    Run ID: {run.id}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground font-normal flex-shrink-0">
                  {new Date(run.start_time).toLocaleString('vi-VN', {
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                  })}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 space-y-4 bg-muted/30 max-h-[60vh] overflow-y-auto no-scrollbar">
              
            {(run.status === 'error' || run.status === 'failed') && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-500">
                  <XCircle size={16} /> Chi tiết lỗi
                </h4>
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs font-mono whitespace-pre-wrap break-all">
                  {run.error || 
                   run.error_message ||
                   (run.output_data && typeof run.output_data === 'object' && 'error_message' in run.output_data && String(run.output_data.error_message)) || 
                   (run.output_data && typeof run.output_data === 'object' && 'error' in run.output_data && 
                    (typeof run.output_data.error === 'string' ? run.output_data.error : 
                     JSON.stringify(run.output_data.error, null, 2))
                   ) || 
                   'Đã xảy ra lỗi không xác định'}
                </div>
                <Button 
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => onRetry(run)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Thử lại Task này
                </Button>
              </div>
            )}
            
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><Code size={16} /> Dữ liệu đầu vào (Input)</h4>
                <div className="p-3 rounded-md bg-background text-xs space-y-2 font-mono">
                  {Object.entries(run.input_data).map(([key, value]) => {
                    const valueStr = String(value);
                    const isUrl = valueStr.startsWith('http://') || valueStr.startsWith('https://');
                    return (
                      <div key={key} className="grid grid-cols-[120px_1fr] gap-2 items-start">
                        <span className="text-muted-foreground truncate font-semibold">{key}:</span>
                        {isUrl ? (
                           <a href={valueStr} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                             {valueStr}
                           </a>
                        ) : (
                           <span className="break-all text-white">{valueStr}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* --- CẬP NHẬT: Phần hiển thị kết quả đầu ra --- */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><FileVideo size={16} /> Kết quả (Output)</h4>
                {(!run.output_data || Object.keys(run.output_data).length === 0) ? (
                  <div className="p-3 rounded-md bg-background text-sm text-muted-foreground">Không có dữ liệu đầu ra.</div>
                ) : (
                  <div className="space-y-1/2">
                    {renderOutput(run.output_data)}
                  </div>
                )}
              </div>

              {/* Nút thiết lập tự động (giữ nguyên) */}
              {run.status === 'completed' && (
                <div className="pt-4 border-t border-border">
                  <Button 
                    onClick={() => navigate(`/dashboard/agents/${agentId}/task/${run.task_id}/config`)}
                    className="w-full button-gradient-light dark:button-gradient-dark text-white"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Thiết lập tự động
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
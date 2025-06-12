
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Code, FileVideo, Loader2, CheckCircle2, XCircle, Settings } from "lucide-react"
import { TaskRun } from "@/types"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

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
export const TaskHistory = ({ runs, agentId }: { runs: TaskRun[], agentId: string }) => {
  const navigate = useNavigate();

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
                    {(run.status === 'error' || run.status === 'failed') && run.error && (
                      <span className="text-xs text-red-500 mt-1 max-w-[350px] truncate" title={run.error}>
                        {run.error}
                      </span>
                    )}
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
              
              {/* --- CẢI TIẾN: Phần hiển thị dữ liệu đầu vào --- */}
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

              {/* --- SỬA LỖI: Phần hiển thị kết quả đầu ra --- */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><FileVideo size={16} /> Kết quả (Output)</h4>
                {(!run.output_data || !Array.isArray(run.output_data) || run.output_data.length === 0) ? (
                  <div className="p-3 rounded-md bg-background text-sm text-muted-foreground">Không có dữ liệu đầu ra.</div>
                ) : (
                  <div className="space-y-4">
                    {run.output_data.map((outputItem: any, index: number) => {
                      // Kiểm tra nếu output là video
                      if (outputItem && outputItem.url && typeof outputItem.url === 'string') {
                        return (
                          <div key={index} className="p-3 rounded-md bg-background">
                            <p className="font-semibold text-sm mb-2 break-all">{outputItem.filename || 'Kết quả Video'}</p>
                            <video
                              src={outputItem.url}
                              poster={outputItem.snapshot_url}
                              controls
                              className="w-full rounded-md"
                              preload="metadata"
                            >
                              Trình duyệt của bạn không hỗ trợ thẻ video.
                            </video>
                            <div className="text-xs mt-2 space-y-1 font-sans">
                              <p>
                                <span className="font-medium">Tải video:</span>{' '}
                                <a href={outputItem.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                                  {outputItem.filename || 'Download Link'}
                                </a>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      // Nếu không phải video, hiển thị dạng JSON
                      return (
                        <div key={index} className="p-3 rounded-md bg-background text-xs font-mono">
                           <pre className="whitespace-pre-wrap break-all">
                              {JSON.stringify(outputItem, null, 2)}
                           </pre>
                        </div>
                      );
                    })}
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
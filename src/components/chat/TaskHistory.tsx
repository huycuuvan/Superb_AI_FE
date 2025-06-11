// src/components/chat/TaskHistory.tsx

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Code, FileVideo, Loader2, CheckCircle2, XCircle, Settings } from "lucide-react" // Thêm các icon mới
import { TaskRun } from "@/types"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
// Component con hiển thị video (không đổi)
const VideoResultDisplay = ({ output }: { output: TaskRun['output_data'] }) => {
    if (!output?.url) return <p className="text-sm text-muted-foreground">Không có kết quả đầu ra.</p>;
    // ... code còn lại của VideoResultDisplay giữ nguyên
};

// --- COMPONENT MỚI ĐỂ HIỂN THỊ HUY HIỆU TRẠNG THÁI ĐỘNG ---
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


export const TaskHistory = ({ runs, agentId }: { runs: TaskRun[], agentId: string }) => {
  const navigate = useNavigate();
  if (!runs || runs.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Chưa có lịch sử thực thi nào.</p>
      </div>
    )
  }
 
  // Không cần sắp xếp ở đây nữa vì AgentChat sẽ xử lý
  // const sortedRuns = [...runs].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
 
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Lịch sử thực thi Task</h3>
      <Accordion type="single" collapsible className="w-full">
        {runs.map((run) => (
          <AccordionItem key={run.id} value={run.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between items-center w-full pr-4 gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <StatusBadge status={run.status} /> {/* <-- Dùng component Badge mới */}
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
              
              {/* Phần hiển thị dữ liệu đầu vào */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><Code size={16} /> Dữ liệu đầu vào (Input)</h4>
                <div className="p-3 rounded-md bg-background text-xs space-y-2 font-mono">
                    {Object.entries(run.input_data).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-[120px_1fr] gap-2 items-start">
                            <span className="text-muted-foreground truncate font-semibold">{key}:</span>
                            <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                                {value}
                            </a>
                        </div>
                    ))}
                </div>
              </div>
 
              {/* Phần hiển thị kết quả đầu ra */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><FileVideo size={16} /> Kết quả (Output)</h4>
                  <VideoResultDisplay output={run.output_data} />
              </div>
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
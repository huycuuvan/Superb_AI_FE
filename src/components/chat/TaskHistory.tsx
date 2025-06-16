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

  const renderOutput = (output: any) => {
    console.log('Rendering output:', output);
    
    // Debug hiển thị chi tiết cấu trúc output để phát hiện vấn đề
    console.log('Output type:', typeof output);
    console.log('Output keys:', output && typeof output === 'object' ? Object.keys(output) : 'not an object');
    
    // Kiểm tra nếu output là string
    if (typeof output === 'string') {
      // Kiểm tra nếu là URL ảnh
      if (output.startsWith('http') && (output.endsWith('.jpg') || output.endsWith('.jpeg') || output.endsWith('.png') || output.endsWith('.gif'))) {
        return (
          <div className="mt-2 flex flex-col items-center space-y-2">
            <img 
              src={output} 
              alt="Direct image URL" 
              className="max-w-full rounded-lg shadow-lg"
            />
            <a 
              href={output} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:text-blue-700 flex items-center gap-1.5"
            >
              <FileImage className="h-4 w-4" /> Mở ảnh trong tab mới
            </a>
          </div>
        );
      }
      // Kiểm tra nếu là URL thông thường
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

      // Kiểm tra nhiều trường hợp có chứa đường dẫn ảnh
      const imageUrl = output.file_url || output.image_url || output.url || 
                      (output.data?.file_url) || (output.data?.image_url) || 
                      (output.data?.url) || (output.result?.file_url) || 
                      (output.result?.image_url) || (output.result?.url) ||
                      (output.output?.url) || (output.output?.file_url) ||
                      (output.content?.url) || (output.content?.file_url);

      // Kiểm tra nếu có trường content_type hoặc mime_type
      const isImageType = output.content_type?.includes('image') || 
                         output.mime_type?.includes('image') ||
                         output.data_type === 'image' ||
                         output.type?.includes('image');
      
      // Kiểm tra định dạng file từ các trường khác nhau
      const imageFormat = output.format || output.extension || 
                          (imageUrl && typeof imageUrl === 'string' && 
                           imageUrl.split('.').pop()?.toLowerCase());
      
      const isImageFormat = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(imageFormat);
      
      console.log('Image check:', { 
        imageUrl, isImageType, imageFormat, isImageFormat,
        hasImageUrlPattern: typeof imageUrl === 'string' && (
          imageUrl.endsWith('.png') || imageUrl.endsWith('.jpg') || 
          imageUrl.endsWith('.jpeg') || imageUrl.endsWith('.gif') ||
          imageUrl.includes('/images/') || imageUrl.includes('image')
        )
      });

      if (imageUrl && (
          isImageType || isImageFormat ||
          (typeof imageUrl === 'string' && (
            imageUrl.endsWith('.png') || imageUrl.endsWith('.jpg') || 
            imageUrl.endsWith('.jpeg') || imageUrl.endsWith('.gif') ||
            imageUrl.includes('/images/') || imageUrl.includes('image')
          ))
      )) {
        const fullImageUrl = getFullUrl(imageUrl);
        return (
          <div className="mt-2 flex flex-col items-center space-y-2">
            <img 
              src={fullImageUrl} 
              alt={output.file_name || "Generated image"} 
              className="max-w-full rounded-lg shadow-lg"
              onError={(e) => {
                console.error('Image failed to load:', fullImageUrl);
                (e.target as HTMLImageElement).style.display = 'none';
                // Hiển thị URL đã thử tải nhưng lỗi
                const errorMsgElem = document.createElement('div');
                errorMsgElem.className = 'text-red-500 text-xs mt-2';
                errorMsgElem.textContent = `Không thể tải ảnh: ${fullImageUrl}`;
                e.currentTarget.parentNode?.appendChild(errorMsgElem);
              }}
            />
            <div className="text-xs text-muted-foreground">
              {output.file_name && <span className="block">Tên file: {output.file_name}</span>}
              {imageFormat && <span className="block">Định dạng: {imageFormat.toUpperCase()}</span>}
              {output.size_bytes && <span className="block">Kích thước: {(output.size_bytes / 1024 / 1024).toFixed(2)} MB</span>}
            </div>
            <a 
              href={fullImageUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:text-blue-700 flex items-center gap-1.5"
            >
              <FileImage className="h-4 w-4" /> Mở ảnh trong tab mới
            </a>
            
            {/* Hiển thị URL ảnh để debug */}
            <div className="w-full mt-1">
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Chi tiết URL</summary>
                <code className="block mt-1 p-1 bg-muted rounded text-xs break-all">{fullImageUrl}</code>
              </details>
            </div>
          </div>
        );
      }

      // Kiểm tra cấu trúc data phổ biến
      if (output.data && typeof output.data === 'object') {
        // Nếu data chứa video_url
        if (output.data.video_url || output.data.url) {
          const videoUrl = output.data.video_url || output.data.url;
          return (
            <div className="mt-2 flex justify-center">
              <video 
                src={videoUrl} 
                controls 
                className="max-h-[50vh] w-auto aspect-[9/16] rounded-xl shadow-lg object-cover bg-black"
                style={{ maxWidth: '100%' }}
              />
            </div>
          );
        }
      }

      // Kiểm tra video_url trực tiếp trong output
      if (output.video_url || output.url) {
        const videoUrl = output.video_url || output.url;
        return (
          <div className="mt-2 flex justify-center">
            <video 
              src={videoUrl} 
              controls 
              className="max-h-[50vh] w-auto aspect-[9/16] rounded-xl shadow-lg object-cover bg-black"
              style={{ maxWidth: '100%' }}
            />
          </div>
        );
      }

      // Kiểm tra snapshot_url
      if (output.snapshot_url) {
        return (
          <div className="mt-2">
            <img 
              src={output.snapshot_url} 
              alt="Thumbnail" 
              className="max-w-full rounded-lg"
            />
            {output.url && (
              <div className="mt-2">
                <a 
                  href={output.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  Xem video đầy đủ
                </a>
              </div>
            )}
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

      // Hiển thị các trường URL quan trọng
      const urlFields = Object.entries(output).filter(([key, value]) => 
        typeof value === 'string' && 
        (value.startsWith('http://') || value.startsWith('https://')) &&
        (key.includes('url') || key.includes('link'))
      );

      if (urlFields.length > 0) {
        return (
          <div className="mt-2 space-y-2">
            {urlFields.map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <span className="text-sm font-medium">{key}:</span>
                <a 
                  href={value as string} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline break-all"
                >
                  {value as string}
                </a>
              </div>
            ))}
          </div>
        );
      }

      // Nếu là object thông thường, hiển thị dạng JSON
      return (
        <div className="mt-2">
          <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap break-all">
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
                    {/* Debug hiển thị cấu trúc output_data để phát hiện vấn đề */}
                    <div className="text-xs text-muted-foreground mb-2">
                      <code>Output type: {typeof run.output_data}</code>
                    </div>
                    
                    {/* Debug hiển thị dữ liệu gốc */}
                    <details className="text-xs mb-4">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Dữ liệu gốc
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded-md overflow-auto max-h-80 text-xs">
                        {JSON.stringify(run.output_data, null, 2)}
                      </pre>
                    </details>
                    
                    {/* Xử lý trường hợp output_data là mảng */}
                    {Array.isArray(run.output_data) ? (
                      <div className="space-y-4">
                        {run.output_data.map((item, index) => (
                          <div key={index} className="border border-border rounded-md p-3">
                            <h5 className="text-sm font-semibold mb-2">Kết quả #{index + 1}</h5>
                            {renderOutput(item)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Xử lý trường hợp output_data là đối tượng đơn */
                      renderOutput(run.output_data)
                    )}
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
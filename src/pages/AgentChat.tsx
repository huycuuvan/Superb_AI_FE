import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, X, Plus, Paperclip, 
  ListPlus, Book, Clock,
  Rocket, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Agent, ChatTask, ChatMessage, ApiTaskType, Workspace, ApiMessage, TaskRun } from '@/types';
import { History } from 'lucide-react'
import { TaskHistory } from '@/components/chat/TaskHistory'; // Đảm bảo đường dẫn này đúng
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { getAgentById, createThread, getWorkspace, checkThreadExists, sendMessageToThread, getThreadMessages, getAgentTasks, executeTask, getThreads, getThreadById, getThreadByAgentId, getTaskRunsByThreadId } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { AgentTypingIndicator } from '@/components/ui/agent-typing-indicator';
import { ChatMessageContent } from '@/components/chat/ChatMessageContent';
import { Card, CardContent, CardTitle, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { TaskSelectionModal } from '@/components/chat/TaskSelectionModal';
import { PromptTemplatesModal } from '@/components/chat/PromptTemplatesModal';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

interface TaskInput {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  required?: boolean;
}

// Define a more specific type for execution_config
interface ExecutionConfig {
  [key: string]: string; // Cập nhật kiểu dữ liệu cho execution_config dựa trên response API
}

// Use ApiTaskType directly everywhere

interface Message {
  type: string;
  thread_id: string;
  content: string;
  timestamp: string;
  sender_type: "user" | "agent";
  sender_user_id: string;
}

// Định nghĩa một kiểu dữ liệu cho output video
type TaskOutputData = TaskRun['output_data'];

// Type guard cho TaskLog
function isTaskLogMessage(obj: unknown): obj is TaskLog {
  return typeof obj === 'object' && obj !== null && 'status' in obj && 'message' in obj;
}

// Type guard cho TaskOutputData (kết quả video)
function isTaskOutputData(obj: unknown): obj is TaskOutputData {
  return typeof obj === 'object' && obj !== null && 'url' in obj && 'snapshot_url' in obj;
}

// Interface cho log từ WebSocket task
interface TaskLog {
  message?: string;
  status?: 'completed' | 'processing' | 'error' | string; // Có thể có các trạng thái khác
  response?: unknown; // Sử dụng unknown thay cho any để yêu cầu kiểm tra kiểu rõ ràng
  task_id?: string;
}

const AgentChat = () => {
  const { agentId, threadId: threadFromUrl } = useParams<{ agentId: string; threadId?: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const { user } = useAuth();

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  // Agent and workspace info
  const [currentThread, setCurrentThread] = useState<string | null>(threadFromUrl || null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  // Mobile sidebar state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Ref to prevent duplicate thread creation
  const isInitializingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  
  // Chat display states
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // State mới để lưu tasks được fetch từ API
  const [tasks, setTasks] = useState<ApiTaskType[]>([]); // Khởi tạo rỗng, sẽ fetch data
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // State mới để theo dõi trạng thái thực thi của từng task: taskId -> 'idle' | 'loading' | 'success' | 'error'
  const [taskExecutionStatus, setTaskExecutionStatus] = useState<{[taskId: string]: 'idle' | 'loading' | 'success' | 'error'}>({});

  // Ref để theo dõi ID của tin nhắn agent đang được stream/chunk
  const lastAgentMessageIdRef = useRef<string | null>(null);

  const [timeoutStage, setTimeoutStage] = useState<number>(0);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [taskRunItems, setTaskRunItems] = useState<TaskRun[]>([]);

  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null); // Ref to store WebSocket instance
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const [aboveInputContent, setAboveInputContent] = useState<'none' | 'taskList' | 'taskInputs' | 'knowledge' >('none');

  const [selectedTaskInputs, setSelectedTaskInputs] = useState<{[key: string]: string}>({});

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Thêm hàm để lấy lịch sử task
  const { 
    data: historyData, 
    isLoading: isLoadingHistory 
  } = useQuery({
    queryKey: ['taskRuns', currentThread, currentAgent?.id],
    queryFn: () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("Không tìm thấy thông tin người dùng");
      const user = JSON.parse(userStr);
      return getTaskRunsByThreadId(user.id, currentAgent?.id || "");
    },
    enabled: !!currentThread && !!currentAgent?.id && showTaskHistory,
  });

  // Clean up interval on component unmount (now handled by WS cleanup)
  useEffect(() => {
    if (currentThread) {
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      if (!token) {
    
        return;
      }

      const wsUrl = `wss://aiemployee.site/ws?token=${token}&thread_id=${currentThread}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket Connected", { threadId: currentThread });
      };

      ws.current.onmessage = (event) => {
        try {
          const receivedData: Message = JSON.parse(event.data);
      
          // Kiểm tra type của tin nhắn
          if (receivedData.type === "chat") {
            // console.log("Received chat message:", receivedData);

            // Xử lý tin nhắn từ Agent (dạng chunk)
            if (receivedData.sender_type === "agent") {
              setIsAgentThinking(false); // Tắt trạng thái typing ngay khi nhận được tin nhắn chat từ agent
              setTimeoutStage(0);
              setMessages(prevMessages => {
                // Kiểm tra xem tin nhắn cuối có phải của agent không
                if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].sender === 'agent') {
                    
                    // LẤY RA TIN NHẮN CUỐI
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    
                    // TẠO RA MỘT OBJECT TIN NHẮN CUỐI HOÀN TOÀN MỚI VÀ ÉP KIỂU TƯỜNG MINH
                    const updatedLastMessage: ChatMessage = {
                        ...lastMessage, // Sao chép tất cả thuộc tính cũ
                        content: lastMessage.content + receivedData.content, // Nối chuỗi để tạo content mới
                        timestamp: receivedData.timestamp // Cập nhật timestamp mới
                    };
                    
                    // TRẢ VỀ MỘT ARRAY MỚI: bao gồm tất cả tin nhắn cũ (trừ tin cuối) VÀ object tin nhắn mới của chúng ta
                    return [...prevMessages.slice(0, -1), updatedLastMessage];

                } else {
                    // Nếu không có tin nhắn agent nào trước đó, tạo một tin nhắn mới và ÉP KIỂU TƯỜNG MINH
                    const newChatMessage: ChatMessage = {
                        id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                        content: receivedData.content,
                        sender: 'agent', // Thay receivedData.sender_type bằng literal 'agent'
                        timestamp: receivedData.timestamp,
                        agentId: receivedData.sender_user_id,
                    };
                    return [...prevMessages, newChatMessage];
                }
            })}
            else if (receivedData.sender_type === "user") {
              setMessages(prevMessages => {
                const isEcho = prevMessages.some(msg =>
                  msg.sender === 'user' &&
                  msg.content === receivedData.content &&
                  Math.abs(new Date(msg.timestamp).getTime() - new Date(receivedData.timestamp).getTime()) < 3000 // lệch dưới 3s
                );
                if (isEcho) {
                  // console.log("Skipping user message echo:", receivedData);
                  return prevMessages;
                } else {
                  // Đây có thể là tin nhắn từ user khác trong multi-user chat
                  const newChatMessage: ChatMessage = {
                    id: receivedData.thread_id + ":" + receivedData.timestamp + ":" + receivedData.sender_user_id + ":" + Math.random(),
                    content: receivedData.content,
                    sender: receivedData.sender_type, // Thay receivedData.sender_type bằng literal 'user'
                    timestamp: receivedData.timestamp,
                    agentId: receivedData.sender_user_id,
                  };
                  return [...prevMessages, newChatMessage];
                }
              });
            }

          } else if (receivedData.type === "typing") {
             if (receivedData.sender_type === "agent") {
                setIsAgentThinking(true);
             }
          } else if (receivedData.type === "done") {
            lastAgentMessageIdRef.current = null;
            setIsAgentThinking(false); // Dừng các chỉ báo chờ
            setTimeoutStage(0);      // Reset stage
           
          } else if (receivedData.type === "status") {
           
            try {
                const statusUpdate = JSON.parse(receivedData.content);
                const runIdToUpdate = statusUpdate.task_run_id;
        
                if (runIdToUpdate) {
                    setTaskRunItems(prevRuns => {
                        // Tạo bản sao cập nhật của task run
                        const updatedRuns = prevRuns.map(run => {
                            // Tìm đúng item trong danh sách bằng run_id
                            if (run.id === runIdToUpdate) {
                                console.log('Đang cập nhật task từ websocket:', statusUpdate);
                                // Force re-render bằng cách tạo một đối tượng mới hoàn toàn
                                return {
                                    ...run,
                                    status: statusUpdate.status,
                                    output_data: statusUpdate.response || run.output_data,
                                    updated_at: new Date().toISOString(),
                                    error: (statusUpdate.status === 'error' || statusUpdate.status === 'failed') ? (statusUpdate.message || statusUpdate.error_message || 'Đã xảy ra lỗi.') : undefined,
                                    // Thêm trường ngẫu nhiên để đảm bảo React nhận diện là object mới
                                    _lastUpdate: Date.now()
                                };
                            }
                            return run;
                        });

                        // Log để debug
                        console.log('TaskRun cập nhật từ websocket:', updatedRuns.find(run => run.id === runIdToUpdate));
                        
                        // Nếu trạng thái đã hoàn thành hoặc lỗi, hiển thị thông báo
                        if (statusUpdate.status === 'completed') {
                            toast({
                                title: "Task hoàn thành",
                                description: "Task đã thực thi xong.",
                                variant: "default",
                            });
                        } else if (statusUpdate.status === 'error' || statusUpdate.status === 'failed') {
                            toast({
                                title: "Task thất bại",
                                description: statusUpdate.message || statusUpdate.error_message || "Đã xảy ra lỗi.",
                                variant: "destructive",
                            });
                        }

                        // Đẩy task đã cập nhật lên đầu danh sách để dễ nhìn thấy
                        const taskToUpdate = updatedRuns.find(run => run.id === runIdToUpdate);
                        const otherTasks = updatedRuns.filter(run => run.id !== runIdToUpdate);
                        return taskToUpdate ? [taskToUpdate, ...otherTasks] : updatedRuns;
                    });
                    
                    // Luôn mở panel Task History khi nhận được cập nhật trạng thái task
                    if (!showTaskHistory && (statusUpdate.status === 'completed' || statusUpdate.status === 'error' || statusUpdate.status === 'failed')) {
                        setShowTaskHistory(true);
                    }

                    // Thực hiện thêm xử lý khi task hoàn thành hoặc lỗi
                    if (statusUpdate.status === 'completed' || statusUpdate.status === 'error' || statusUpdate.status === 'failed') {
                        // Ra lệnh cho useQuery tự động fetch lại dữ liệu mới nhất từ API
                        queryClient.invalidateQueries({ queryKey: ['taskRuns', currentThread] });
                        queryClient.invalidateQueries({ queryKey: ['taskRuns', currentThread, currentAgent?.id] });
                        
                        // Thêm một chút trễ trước khi hiển thị task để đảm bảo quá trình tải ảnh hoặc nội dung được hoàn tất
                        setTimeout(() => {
                            // Tạo biến cờ để theo dõi nếu đã cập nhật dữ liệu từ cache
                            let hasUpdatedFromCache = false;
                            
                            // Cập nhật cache của React Query
                            queryClient.setQueryData(['taskRuns', currentThread, currentAgent?.id], (oldData: { data?: TaskRun[] } | undefined) => {
                                if (!oldData || !oldData.data) return oldData;
                                
                                // Tìm và cập nhật task run trong cache 
                                const updatedData = {
                                    ...oldData,
                                    data: oldData.data.map((item: TaskRun) => {
                                        if (item.id === runIdToUpdate) {
                                            hasUpdatedFromCache = true;
                                            console.log('Cập nhật task trong cache React Query:', runIdToUpdate);
                                            return {
                                                ...item,
                                                status: statusUpdate.status,
                                                output_data: statusUpdate.response || item.output_data,
                                                updated_at: new Date().toISOString(),
                                                error: (statusUpdate.status === 'error' || statusUpdate.status === 'failed') 
                                                    ? (statusUpdate.message || statusUpdate.error_message || 'Đã xảy ra lỗi.') 
                                                    : undefined,
                                                // Force re-render khi data thay đổi
                                                _lastUpdate: Date.now()
                                            };
                                        }
                                        return item;
                                    })
                                };
                                
                                return updatedData;
                            });
                            
                            // Nếu không tìm thấy task trong cache, thêm vào
                            if (!hasUpdatedFromCache) {
                                // Lấy thông tin task hiện tại từ taskRunItems
                                const currentTask = taskRunItems.find(run => run.id === runIdToUpdate);
                                if (currentTask) {
                                    const updatedTask = {
                                        ...currentTask,
                                        status: statusUpdate.status,
                                        output_data: statusUpdate.response || currentTask.output_data,
                                        updated_at: new Date().toISOString(),
                                        error: (statusUpdate.status === 'error' || statusUpdate.status === 'failed') 
                                            ? (statusUpdate.message || statusUpdate.error_message || 'Đã xảy ra lỗi.') 
                                            : undefined,
                                        _lastUpdate: Date.now()
                                    };
                                    
                                    queryClient.setQueryData(['taskRuns', currentThread, currentAgent?.id], (oldData: { data?: TaskRun[] } | undefined) => {
                                        if (!oldData) return { data: [updatedTask] };
                                        return {
                                            ...oldData,
                                            data: oldData.data ? [updatedTask, ...oldData.data] : [updatedTask]
                                        };
                                    });
                                }
                            }
                        }, 200); // Đợi 200ms để đảm bảo xử lý hoàn tất
                    }
                }
            } catch (e) {
                console.error("Error parsing status update: ", e);
            }
        }
        } catch (error) {
          // console.error("Error processing WebSocket message:", error);
          // console.error("Raw WebSocket data that caused error:", event.data);
        }
      };
  
      ws.current.onclose = (event) => {
        console.log("WebSocket Disconnected. Code:", event.code, "Reason:", event.reason, "Was Clean:", event.wasClean);
   
      };
  
      ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setIsAgentThinking(false); // Stop typing indicator
  
      };
  
      return () => {
        ws.current?.close();
      };
    }
  }, [currentThread]); // Reconnect when currentThread changes
  useEffect(() => {
    // Nếu agent không suy nghĩ, không làm gì cả
    if (!isAgentThinking) {
      setTimeoutStage(0); // Reset stage khi có kết quả
      return;
    }

    // Mảng để lưu các ID của timer, giúp chúng ta dọn dẹp sau
    const timers: NodeJS.Timeout[] = [];

    // Định nghĩa các mốc thời gian và thông điệp
    const stages = [
      { delay: 15000, stage: 1 }, // 15 giây -> Giai đoạn 1
      { delay: 30000, stage: 2 }, // 30 giây -> Giai đoạn 2
      { delay: 60000, stage: 3 }, // 60 giây -> Giai đoạn 3 (thay cho báo lỗi)
    ];

    stages.forEach(({ delay, stage }) => {
      const timer = setTimeout(() => {
        console.log(`Timeout Stage ${stage} reached`);
        setTimeoutStage(stage);
        if (stage === 3) { // Tại giai đoạn cuối, có thể hiển thị một toast thân thiện
             toast({
                title: "Agent đang xử lý tác vụ phức tạp",
                description: "Vui lòng chờ thêm một chút. Tác vụ này mất nhiều thời gian hơn dự kiến.",
             });
        }
      }, delay);
      timers.push(timer);
    });

    // Hàm dọn dẹp: Sẽ được gọi khi isAgentThinking chuyển thành false
    return () => {
      console.log("Cleaning up timeouts...");
      timers.forEach(clearTimeout);
    };
  }, [isAgentThinking]);
  useEffect(() => {
    if (agentId && !hasInitializedRef.current && !isInitializingRef.current) {
      const initializeChat = async () => {
        // Prevent duplicate initializations
        if (isInitializingRef.current) return;
        isInitializingRef.current = true;
        
        try {
          setIsLoading(true);
          
          // Add a delay before fetching data and creating thread
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

          // Get workspace information
          const workspaceResponse = await getWorkspace();
          let currentWorkspaceId: string | null = null;
          if (workspaceResponse.data && workspaceResponse.data.length > 0) {
            setWorkspace(workspaceResponse.data[0]);
            currentWorkspaceId = workspaceResponse.data[0].id;
            console.log('Workspace loaded:', workspaceResponse.data[0]);
          }

          // Get agent information
          const agentData = await getAgentById(agentId);
          setCurrentAgent(agentData.data);
          console.log('Agent loaded:', agentData.data);

          // TODO: Fetch tasks for the agent
          if (agentId) {
            try {
              const agentTasksResponse = await getAgentTasks(agentId);
              if (agentTasksResponse.data) {
                setTasks(agentTasksResponse.data);
                console.log("Fetched tasks:", agentTasksResponse.data);
              }
            } catch (taskError) {
              console.error('Error fetching agent tasks:', taskError);
            }
          }

          let threadId: string | null = currentThread;
          let initialMessages: ChatMessage[] = [];

          // Check if we already have a thread ID from URL or state
          if (!threadId) {
            let threadCheck = null;
            if (currentWorkspaceId) {
              threadCheck = await checkThreadExists(agentId, currentWorkspaceId);
            }

            if (threadCheck && threadCheck.exists && threadCheck.thread_id) {
              threadId = threadCheck.thread_id;
              try {
                const messagesResponse = await getThreadMessages(threadId);
                initialMessages = (messagesResponse.data && Array.isArray(messagesResponse.data) ? messagesResponse.data : []).map(msg => ({
                    id: msg.id,
                    content: msg.message_content,
                    sender: msg.sender_type,
                    timestamp: msg.created_at,
                    agentId: msg.sender_agent_id
                })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                if (initialMessages.length === 0 && agentData.data.greeting_message) {
                  const welcomeMessage: ChatMessage = {
                    id: Date.now().toString(),
                    content: agentData.data.greeting_message || 'Hello! How can I help you?',
                    sender: 'agent',
                    timestamp: new Date().toISOString(),
                    agentId: agentData.data.id
                  };
                  initialMessages.push(welcomeMessage);
                }

                console.log("Fetched messages for thread:", threadId, messagesResponse.data);
                console.log("Formatted messages state:", initialMessages);

              } catch (fetchError) {
                console.error('Error fetching initial messages:', fetchError);
              }
            } else {
              // Tạo thread mới khi không tồn tại thread nào, bất kể fromProfile là gì
              console.log("No existing thread found, creating a new one");
                
              // Tạo thread mới
              const threadData = {
                agent_id: agentId,
                workspace_id: currentWorkspaceId,
                title: ""
              };
              const threadResponse = await createThread(threadData);
              threadId = threadResponse.data.id;

              const welcomeMessage: ChatMessage = {
                id: Date.now().toString(),
                content: agentData.data.greeting_message || 'Hello! How can I help you?',
                sender: 'agent',
                timestamp: new Date().toISOString(),
                agentId: agentData.data.id
              };
              initialMessages = [welcomeMessage];
            }
          } else {
            // If threadId was already available, fetch its messages
            try {
              const messagesResponse = await getThreadMessages(threadId);
              initialMessages = (messagesResponse.data && Array.isArray(messagesResponse.data) ? messagesResponse.data : []).map(msg => ({
                  id: msg.id,
                  content: msg.message_content,
                  sender: msg.sender_type,
                  timestamp: msg.created_at,
                  agentId: msg.sender_agent_id
              })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

              if (initialMessages.length === 0 && agentData.data.greeting_message) {
                const welcomeMessage: ChatMessage = {
                  id: Date.now().toString(),
                  content: agentData.data.greeting_message || 'Hello! How can I help you?',
                  sender: 'agent',
                  timestamp: new Date().toISOString(),
                  agentId: agentData.data.id
                };
                initialMessages.push(welcomeMessage);
              }

            } catch (fetchError) {
              console.error('Error fetching initial messages:', fetchError);
            }
          }

          // Only update state if component is still mounted
          setCurrentThread(threadId);
          setMessages(initialMessages);
          console.log("Thread ID set to:", threadId);
          
          // Mark as initialized to prevent duplicate initialization
          hasInitializedRef.current = true;

        } catch (error) {
          console.error('Error initializing chat:', error);
        } finally {
          setIsLoading(false);
          isInitializingRef.current = false;
        }
      };

      initializeChat();
    }
  }, [agentId, currentThread]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => { // Made async
    if (message.trim() && currentThread) { // Check if threadId exists
      setIsSending(true); // Start loading
      setIsAgentThinking(true); // Khóa input, chờ agent trả lời
      setTimeoutStage(0);

      // Set a timeout for the agent's response (e.g., 30 seconds)

      const userMessage: ChatMessage = {
        id: Date.now().toString(), // Temporary ID
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        // agentId is not applicable for user message sent from frontend
      };
      
      // Thêm tin nhắn của người dùng vào state ngay lập tức để cập nhật UI
      setMessage('');
      
      try {
        // ** Thay thế gọi API REST bằng gửi qua WebSocket **
        const messageToSend = {
          type: "chat", // Loại tin nhắn
          thread_id: currentThread, // ID của thread
          content: userMessage.content, // Nội dung tin nhắn
          sender_type: userMessage.sender, // Loại người gửi (user)
          sender_user_id: user?.id, // Placeholder cho UserID
        };

        ws.current?.send(JSON.stringify(messageToSend)); // Gửi tin nhắn qua WebSocket
        setIsSending(false); 
      } catch (error) {
        console.error('Error sending message via WebSocket:', error);
        setIsSending(false);
        setIsAgentThinking(false); // Stop typing indicator

        toast({
          title: "Lỗi!",
          description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
          variant: "destructive",
        });
        // Xử lý lỗi: có thể hiển thị thông báo cho người dùng
      }

    } else if (aboveInputContent === 'knowledge') {
       console.log("Sending message with knowledge context:", selectedTaskInputs);
       // Logic xử lý knowledge context (nếu có)
       setMessage('');
       setAboveInputContent('none'); 
    }
  };
  

  
  const handleTaskSelect = (task: ApiTaskType) => {
    setSelectedTaskId(task.id);
    setAboveInputContent('taskInputs');
    // Khởi tạo selectedTaskInputs với giá trị mặc định từ execution_config
    const initialInputs: {[key: string]: string} = {};
    if (task.execution_config) {
      Object.keys(task.execution_config).forEach(key => {
         initialInputs[key] = String(task.execution_config[key] ?? '');
      });
    }
    setSelectedTaskInputs(initialInputs);
    // Reset trạng thái thực thi khi chọn task mới
    setTaskExecutionStatus(prev => ({ ...prev, [task.id]: 'idle' }));
  };

  const handleInputChange = (inputId: string, value: string) => {
    setSelectedTaskInputs(prev => ({
      ...prev,
      [inputId]: value
    }));
  };
 // Fetch threads for the current workspace
 const { data: threadsData, isLoading: isLoadingThreads, error: threadsError } = useQuery({
  queryKey: ['threads', agentId],
  queryFn: () => getThreadByAgentId(agentId),
  enabled: !!agentId,
});
 // Handle New Chat action
 const handleNewChat = async (agentId: string | undefined) => {
  if (!agentId) {
    toast({
      title: "Lỗi!",
      description: "Không tìm thấy Agent ID.",
      variant: "destructive",
    });
    return;
  }

  if (!workspace?.id) {
    toast({
      title: "Lỗi!",
      description: "Không tìm thấy Workspace ID.",
      variant: "destructive",
    });
    return;
  }

  setIsCreatingThread(true); // Start loading

  // Close mobile sidebar on thread click (already there, keep it)
  setShowMobileSidebar(false);

  try {
    const newThread = await createThread({ agent_id: agentId, workspace_id: workspace.id, title: "" });
    if (newThread?.data?.id) {
      // Cập nhật state trước khi navigate
      setCurrentThread(newThread.data.id);

      // ** Lấy messages từ response backend và format lại **
      const initialMessages: ChatMessage[] = (newThread.data.messages || []).map(msg => ({
          id: msg.id,
          content: msg.message_content,
          sender: msg.sender_type,
          timestamp: msg.created_at,
          agentId: msg.sender_agent_id // Giả định agentId có trong ApiMessage
      })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      setMessages(initialMessages); // Sử dụng messages từ backend
      
      // Thêm tin nhắn chào mừng nếu không có tin nhắn ban đầu
      if (initialMessages.length === 0 && currentAgent?.greeting_message) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          content: currentAgent.greeting_message || 'Hello! How can I help you?',
          sender: 'agent',
          timestamp: new Date().toISOString(),
          agentId: currentAgent.id
        };
        setMessages([welcomeMessage]);
      }

      // Không cần navigateToAgentChat vì đã ở đúng trang
      // navigateToAgentChat(agentId);
      
      // Cập nhật URL không reload trang
      window.history.replaceState(null, '', `/dashboard/agents/${agentId}`);
      
      // Cập nhật danh sách threads trong sidebar
      queryClient.invalidateQueries({ queryKey: ['threads', agentId] });
      
      setIsCreatingThread(false); // End loading on success

      // Hiển thị thông báo thành công
      toast({
        title: "Thành công!",
        description: "Đã tạo cuộc hội thoại mới.",
      });
    }
  } catch (error) {
    console.error('Lỗi khi tạo thread mới:', error);
    toast({
      title: "Lỗi!",
      description: `Không thể tạo cuộc hội thoại mới: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive",
    });
    setIsCreatingThread(false); // End loading on error
  }
};
const handleRetryTask = async (runToRetry: TaskRun) => {
  if (!currentThread) {
      toast({ title: "Lỗi", description: "Không tìm thấy Thread ID hiện tại.", variant: "destructive" });
      return;
  }

  console.log(`Retrying task: ${runToRetry.task_id} with input:`, runToRetry.input_data);

  // Hiển thị toast cho người dùng biết
  toast({
      title: "Đang thử lại Task...",
      description: `Đang gửi lại yêu cầu cho task ID: ${runToRetry.task_id}`,
  });

  try {
      // Gọi lại API executeTask với dữ liệu của lần chạy lỗi
      const response = await executeTask(runToRetry.task_id, runToRetry.input_data, currentThread);
      const newRunId = response.task_run_id;

      if (newRunId) {
          // Tạo một TaskRun mới cho lần thử lại này
          const newTaskRun: TaskRun = {
              id: newRunId,
              task_id: runToRetry.task_id,
              status: 'initiated', // Bắt đầu với trạng thái initiated
              start_time: new Date().toISOString(),
              input_data: runToRetry.input_data, // Dùng lại input cũ
              output_data: {},
              started_at: new Date().toISOString(),
              thread_id: currentThread,
              user_id: '', // Lấy từ context hoặc localStorage nếu cần
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
          };

          // Thêm task mới vào đầu danh sách để người dùng thấy ngay
          setTaskRunItems(prevRuns => [newTaskRun, ...prevRuns]);

          // Đảm bảo bảng lịch sử vẫn đang mở để xem kết quả
          setShowTaskHistory(true); 
      } else {
          toast({ title: "Lỗi Phản Hồi", description: "Phản hồi từ server không chứa run ID.", variant: "destructive" });
      }
  } catch (error) {
      toast({ title: "Lỗi Thực Thi", description: "Không thể bắt đầu lại task.", variant: "destructive" });
  }
};
const handleSubmitTaskInputs = async () => {
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  if (selectedTask && currentThread) {
    try {
      const response = await executeTask(selectedTask.id, selectedTaskInputs, currentThread);
      const runId = response.task_run_id;

      if (runId) {
        const newTaskRun: TaskRun = {
          id: runId,
          task_id: selectedTask.id,
          status: 'initiated',
          start_time: new Date().toISOString(),
          input_data: selectedTaskInputs,
          output_data: {},
          started_at: new Date().toISOString(),
          thread_id: currentThread,
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Thêm task mới vào ĐẦU danh sách và tự động mở bảng lịch sử
        setTaskRunItems(prevRuns => [newTaskRun, ...prevRuns]);
        setShowTaskHistory(true);
      } else {
        toast({ title: "Lỗi Phản Hồi", description: "Phản hồi từ server không chứa run ID.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Lỗi Thực Thi", description: "Không thể bắt đầu task.", variant: "destructive" });
    }
    setAboveInputContent('none');
  }
};
  const handleThreadClick = async (threadId: string) => {
    if (!agentId) {
      // Xử lý trường hợp agentId chưa được load hoặc không tồn tại
      console.error("Agent ID is not available.");
      toast({
        title: "Lỗi!",
        description: "Không tìm thấy Agent ID.",
        variant: "destructive",
      });
      return;
    }
    // Close mobile sidebar on thread click
    setShowMobileSidebar(false); // Thêm dòng này để đóng sidebar mobile

    try {
      // Fetch messages for the clicked thread
      const messagesResponse = await getThreadMessages(threadId);
      // Map API response (ApiMessage[]) to ChatMessage type and sort
      const formattedMessages: ChatMessage[] = (messagesResponse.data && Array.isArray(messagesResponse.data) ? messagesResponse.data : []).map(msg => ({
          id: msg.id,
          content: msg.message_content,
          sender: msg.sender_type,
          timestamp: msg.created_at,
          agentId: msg.sender_agent_id // Giả định agentId có trong ApiMessage
      })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Update the state with messages from the clicked thread
      if (formattedMessages.length === 0 && currentAgent?.greeting_message) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          content: currentAgent.greeting_message || 'Hello! How can I help you?',
          sender: 'agent',
          timestamp: new Date().toISOString(),
          agentId: currentAgent.id
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(formattedMessages);
      }
      // Update the currentThread state
      setCurrentThread(threadId);

      

      // Navigate to the thread-specific URL
      // This will also trigger the main useEffect if the URL changes
      // navigate(`/dashboard/agents/${agentId}/${threadId}`); // Xóa hoặc comment dòng này

    } catch (error) {
      console.error('Lỗi khi tải tin nhắn cho thread:', threadId, error);
      toast({
        title: "Lỗi!",
        description: `Không thể tải cuộc hội thoại: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      // Optionally, clear messages or show an empty state if loading fails
      setMessages([]);
      setCurrentThread(threadId); // Set threadId anyway so WS might connect, but messages are empty
      // navigate(`/dashboard/agents/${agentId}/${threadId}`); // Xóa hoặc comment dòng này
    }
  };


  // Initialize useNavigate
  const navigate = useNavigate();

  // Helper function for navigation
  const navigateToAgentChat = (agentId: string) => {
    if (agentId) {
      navigate(`/dashboard/agents/${agentId}?fromProfile=true`);
    }
  };

  const { t } = useLanguage();

  useEffect(() => {
    const runsFromApi = historyData?.data;

    // Chỉ cập nhật từ API nếu có dữ liệu mới và state đang rỗng hoặc khi có cập nhật từ API
    if (runsFromApi && Array.isArray(runsFromApi)) {
        console.log(`[AgentChat] Nhận được ${runsFromApi.length} task runs từ API`);
        // Ánh xạ lại dữ liệu để chuẩn hóa thuộc tính lỗi
        const mappedRuns = runsFromApi.map(run => ({
            ...run,
            // Logic này sẽ tìm tuần tự để đảm bảo luôn lấy được lỗi
            // Ưu tiên `run.error` -> rồi đến error trong output_data nếu có
            error: run.error || 
                  (run.output_data && typeof run.output_data === 'object' && 
                   'error_message' in run.output_data ? String(run.output_data.error_message) : undefined),
            // Thêm trường để force re-render
            _lastUpdate: Date.now()
        }));

        // Sắp xếp dữ liệu đã được chuẩn hóa
        const sortedRuns = [...mappedRuns].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
        
        // Hợp nhất dữ liệu mới và dữ liệu hiện tại dựa vào ID
        // Ưu tiên dữ liệu từ taskRunItems vì có thể được cập nhật từ websocket
        const mergedRuns = sortedRuns.map(apiRun => {
            const localRun = taskRunItems.find(item => item.id === apiRun.id);
            if (localRun) {
                // Nếu dữ liệu local mới hơn, thì ưu tiên sử dụng local
                if (new Date(localRun.updated_at).getTime() > new Date(apiRun.updated_at).getTime()) {
                    console.log(`Sử dụng dữ liệu local cho Task ID ${apiRun.id} vì mới hơn`);
                    return localRun;
                }
            }
            return apiRun;
        });
        
        // Kiểm tra xem có run mới trong taskRunItems nhưng chưa có trong API
        const additionalRuns = taskRunItems.filter(
            localRun => !sortedRuns.some(apiRun => apiRun.id === localRun.id)
        );
        
        // Kết hợp và sắp xếp lại tất cả 
        const combinedRuns = [...additionalRuns, ...mergedRuns].sort(
            (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
        
        console.log(`[AgentChat] Cập nhật taskRunItems với ${combinedRuns.length} task runs sau khi merge`);
        setTaskRunItems(combinedRuns);
    }
}, [historyData]);

  const [showPromptTemplatesModal, setShowPromptTemplatesModal] = useState(false);

  // Handle selecting a prompt template
  const handleSelectPrompt = (renderedPrompt: string) => {
    setMessage(renderedPrompt);
  };

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
      

      {/* Sidebar overlay cho mobile */}
      {showMobileSidebar && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-64 z-50 primary-gradient border-r flex flex-col md:hidden">
            <button
              className="absolute top-4 right-4 z-50 p-2 bg-gray-100 dark:bg-slate-800 rounded-full border"
              onClick={() => setShowMobileSidebar(false)}
              aria-label="Đóng"
            >
              ×
            </button>
            {/* Nội dung sidebar cũ */}
            {isLoading ? (
              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentAgent?.avatar} alt={currentAgent?.name || 'Agent'} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {currentAgent?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{currentAgent?.name || 'Agent'}</h2>
                    <p className="text-xs text-muted-foreground">{currentAgent?.type || 'AI Assistant'}</p>
                  </div>
                </div>
                <div className="p-4 border-b hover:primary-gradient ">
                  <Button variant='primary' className="w-full flex items-center justify-center space-x-2 " onClick={() => handleNewChat(currentAgent?.id)} >
                    <Plus className="h-4 w-4" />
                    <span>New chat</span>
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 text-white">
                  {Array.isArray(threadsData?.data) ? threadsData.data.map((thread, index, arr) => (
                    <div key={thread.id}>
                      <div className="p-3 rounded-lg hover:bg-muted cursor-pointer">
                        <Button variant='primary' className="text-sm font-medium" onClick={() => handleThreadClick(thread.id)}>
                          {thread.title ? thread.title : 'New chat'}
                        </Button>
                      </div>
                      {index < arr.length - 1 && (
                        <div className="border-b border-muted-foreground/20 my-2"></div>
                      )}
                    </div>
                  )) : <div className="text-center p-2">Không có cuộc hội thoại nào</div>}
                </div>
              </>
            )}
          </aside>
        </>
      )}

      {/* Sidebar luôn hiện ở PC */}
      <aside className="w-64 flex-shrink-0 border-r primary-gradient  flex flex-col hidden md:flex">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentAgent?.avatar} alt={currentAgent?.name || 'Agent'} />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {currentAgent?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{currentAgent?.name || 'Agent'}</h2>
                <p className="text-xs text-muted-foreground">{currentAgent?.type || 'AI Assistant'}</p>
              </div>
            </div>
            <div className="p-4 border-b">
              <Button variant="primary"  className="w-full flex items-center justify-center space-x-2" onClick={() => handleNewChat(currentAgent?.id)}
                disabled={isCreatingThread || isLoading} // Disable when creating or initial loading
              >
                {isCreatingThread ? (
                  <span className="loading-spinner animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></span> // Spinner
                ) : (
                  <Plus className="h-4 w-4 " />
                )}
                <span className={cn(isCreatingThread ? ' text-primary-text' : ' text-primary-text')}>{isCreatingThread ? 'Creating...' : 'New chat'}</span> {/* Change text and color */}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {Array.isArray(threadsData?.data) ? threadsData.data.map((thread, index, arr) => (
                <div key={thread.id}>
                  <div className="p-3 rounded-lg hover:bg-muted cursor-pointer">
                    <button className="text-sm font-medium " onClick={() => handleThreadClick(thread.id)}>
                      {thread.title ? thread.title : 'New chat'}
                    </button>
                  </div>
                  {index < arr.length - 1 && (
                    <div className="border-b border-muted-foreground/20 my-2"></div>
                  )}
                </div>
              )) : <div className="text-center text-muted-foreground p-2">Không có cuộc hội thoại nào</div>}
            </div>
          </>
        )}
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {isLoading ? (
          <div className="flex-1 p-4 space-y-4">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <div className="flex items-start justify-end space-x-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ) : (
          <>
            {/* Chat area */}
         {/* Chat area -- BẮT ĐẦU VÙNG THAY THẾ */}
         
         <div
            ref={chatContainerRef}
            className={cn(
              "flex-1 min-h-0 p-3 md:p-4 overflow-y-auto space-y-4 md:space-y-5 bg-background  no-scrollbar ",
              aboveInputContent !== 'none' ? 'pb-[200px]' : 'pb-[120px]'
            )}
          >
            {/* 1. Vòng lặp hiển thị tin nhắn (giữ nguyên) */}
            {messages.slice(-50).map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2",
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.sender === 'agent' && (
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 ">
                    <AvatarImage src={currentAgent?.avatar} alt={currentAgent?.name || 'Agent'} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {currentAgent?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                                "max-w-[75%] p-3 rounded-2xl shadow-sm break-words relative overflow-hidden mr-2",
                                msg.sender === 'user'
                                    ? 'button-gradient-light dark:button-gradient-dark text-white rounded-br-lg'
                                    : 'bg-muted text-foreground rounded-bl-lg'
                            )}>
                  <ChatMessageContent
                    content={msg.content}
                    isAgent={msg.sender === 'agent'}
                   
                  />
                </div>
                {msg.sender === 'user' && (
                                <Avatar className="h-9 w-9 flex-shrink-0">
                                    <AvatarFallback className="font-bold button-gradient-light dark:button-gradient-dark text-white">U</AvatarFallback>
                                </Avatar>
                            )}
              </div>
            ))}

          


          </div>
         
          

          {showTaskHistory && (
    // Lớp phủ màu đen mờ phía sau
    <div 
        className="absolute inset-0 z-30 bg-background/80 backdrop-blur-sm flex items-center justify-center"
        onClick={() => setShowTaskHistory(false)} // Nhấn ra ngoài để đóng
    >
        {/* Panel Lịch sử */}
        <div
            className="relative flex flex-col h-[90%] max-h-[800px] w-[95%] max-w-4xl bg-card border rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Ngăn việc nhấn vào panel làm đóng modal
        >
            {/* 1. Header của Panel */}
            <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                <h2 className="text-xl font-bold">Lịch sử thực thi Task</h2>
                {/* NÚT ĐÓNG MỚI */}
                <Button variant="ghost" size="icon" onClick={() => setShowTaskHistory(false)} aria-label="Đóng">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* 2. Khu vực nội dung có thể cuộn */}
            <div className="flex-1 p-1 md:p-4 overflow-y-auto">
                {isLoadingHistory && taskRunItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Đang tải lịch sử...</p>
                ) : (
                    <TaskHistory runs={taskRunItems} agentId={agentId} onRetry={handleRetryTask}/>
                )}
            </div>
        </div>
    </div>
)}
            {/* Area above the main input for Tasks/Knowledge */}
            <div className="p-3 md:p-4 bg-background">
               {/* Task List or Task Inputs */}


               {aboveInputContent === 'taskInputs' && selectedTask && (
    <Card className="mb-3 animate-in fade-in-50 duration-300">
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>
                    Điền thông tin cho Task: <span className="text-primary">{selectedTask.name}</span>
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAboveInputContent('none')}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Đóng</span>
                </Button>
            </div>
            <CardDescription>
                Vui lòng cung cấp các thông tin cần thiết để thực thi task này.
            </CardDescription>  
        </CardHeader>
        <CardContent className="space-y-4 max-h-60 overflow-y-auto pr-3">
            {Object.entries(selectedTask.execution_config ?? {}).map(([key, defaultValue]) => (
                <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize font-semibold">
                        {key.replace(/_/g, ' ')}
                    </Label>
                    <Textarea
                        id={key}
                        value={selectedTaskInputs[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        placeholder={`Nhập ${key.replace(/_/g, ' ')}...`}
                        className="font-mono text-sm bg-muted/50"
                        rows={key.toLowerCase().includes('script') ? 4 : 2} // Nếu là script thì cho ô nhập liệu cao hơn
                    />
                </div>
            ))}
        </CardContent>
        <CardFooter>
            <Button className="w-full" onClick={handleSubmitTaskInputs}>
                <Rocket className="mr-2 h-4 w-4" />
                Bắt đầu thực thi
            </Button>
        </CardFooter>
    </Card>
)}

               {/* Knowledge File Selection (Placeholder) */}
                {aboveInputContent === 'knowledge' && (
                  <div className="mb-3 p-4 border border-border rounded-lg bg-card text-card-foreground max-h-60 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Knowledge Files</h3>
                    <p className="text-sm text-muted-foreground">Select knowledge files to provide context to the agent.</p>
                    {/* Add file selection UI here */}
                     <div className="mt-4 space-y-2">
                       <div className="flex items-center space-x-2">
                          <input type="checkbox" id="file1" />
                          <label htmlFor="file1" className="text-sm text-foreground">Document_A.pdf</label>
                       </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="file2" />
                          <label htmlFor="file2" className="text-sm text-foreground">KnowledgeBase.txt</label>
                        </div>
                        {/* Add more files as needed */}
                     </div>
                    <Button variant="outline" className="w-full border-border mt-4" onClick={() => setAboveInputContent('none')}>Close Knowledge</Button>
                  </div>
                )}

{isAgentThinking && (
                  <AgentTypingIndicator
                    agentName={currentAgent?.name}
                    agentAvatar={currentAgent?.avatar}
                    stage={timeoutStage} 
                  />
                )}

              <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border">
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="relative">
                            <Textarea
                                placeholder={t('common.askAI')}
                                className="w-full rounded-xl border-border bg-card p-4 pr-14 resize-none text-base shadow-sm"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                rows={1}
                                disabled={isSending || isAgentThinking || !currentThread}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full button-gradient-light dark:button-gradient-dark text-white"
                                onClick={handleSendMessage}
                                disabled={!message.trim() || isSending || isAgentThinking || !currentThread}
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" title="Đính kèm tệp"><Paperclip className="h-5 w-5 text-muted-foreground"/></Button>
                                <Button variant="ghost" size="icon" title="Chọn Task" onClick={() => setIsTaskModalOpen(true)}><ListPlus className="h-5 w-5 text-muted-foreground"/></Button>
                                <Button variant="ghost" size="icon" title="Sử dụng Knowledge"><Book className="h-5 w-5 text-muted-foreground"/></Button>
                                <Button variant="ghost" size="icon" title="Lịch sử thực thi" onClick={() => setShowTaskHistory(true)}><History className="h-5 w-5 text-muted-foreground"/></Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Gợi ý prompt" 
                                  onClick={() => setShowPromptTemplatesModal(true)}
                                  className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                                >
                                  <Lightbulb className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileSidebar(true)}><Clock className="h-5 w-5 text-muted-foreground"/></Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Superb AI có thể mắc lỗi. Hãy kiểm tra các thông tin quan trọng.</p>
                        </div>
                    </div>
                </div>
            </div>

           
          </>
        )}
      </div>
      <TaskSelectionModal
            isOpen={isTaskModalOpen}
            onOpenChange={setIsTaskModalOpen}
            tasks={tasks}
            onTaskSelect={handleTaskSelect} // Dùng lại hàm cũ để mở ô nhập liệu
        />
      <PromptTemplatesModal
        open={showPromptTemplatesModal}
        onOpenChange={setShowPromptTemplatesModal}
        agent={currentAgent}
        onSelectPrompt={handleSelectPrompt}
      />
    </div>
  );
};

export default AgentChat;

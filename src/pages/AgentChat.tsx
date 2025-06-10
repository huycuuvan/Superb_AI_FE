import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, X, Plus, Paperclip, 
  ListPlus, Book, Clock,
  Rocket
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
import { Label } from '@/components/ui/label';
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
  const { agentId, threadId: paramThreadId } = useParams<{ agentId: string, threadId?: string }>();
  const [message, setMessage] = useState('');
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // New state for sending message loading
  const [currentThread, setCurrentThread] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAgentThinking, setIsAgentThinking] = useState(false); // New state for agent thinking indicator
  const [isCreatingThread, setIsCreatingThread] = useState(false); // State for new thread creation loading

  // State mới để lưu tasks được fetch từ API
  const [tasks, setTasks] = useState<ApiTaskType[]>([]); // Khởi tạo rỗng, sẽ fetch data
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    // Initial message, will be added after agent data is fetched
  ]);

  // State mới để lưu trữ các log trạng thái từ WebSocket
  const [taskLogs, setTaskLogs] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null); // Ref to store WebSocket instance
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const [aboveInputContent, setAboveInputContent] = useState<'none' | 'taskList' | 'taskInputs' | 'knowledge' >('none');

  const [selectedTaskInputs, setSelectedTaskInputs] = useState<{[key: string]: string}>({});

  // State mới để theo dõi trạng thái thực thi của từng task: taskId -> 'idle' | 'loading' | 'success' | 'error'
  const [taskExecutionStatus, setTaskExecutionStatus] = useState<{[taskId: string]: 'idle' | 'loading' | 'success' | 'error'}>({});

  // Ref để theo dõi ID của tin nhắn agent đang được stream/chunk
  const lastAgentMessageIdRef = useRef<string | null>(null);

  const [showMobileSidebar, setShowMobileSidebar] = useState(false); // Thêm state
  const [isTimeoutOccurred, setIsTimeoutOccurred] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [taskRunItems, setTaskRunItems] = useState<TaskRun[]>([]);
  // Clean up interval on component unmount (now handled by WS cleanup)
  useEffect(() => {
    if (currentThread) {
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      if (!token) {
        console.error("Authentication token not found.");
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
          console.log("Parsed WebSocket Data:", receivedData);
          console.log("Message Type:", receivedData.type);
      
          // Kiểm tra type của tin nhắn
          if (receivedData.type === "chat") {
            // console.log("Received chat message:", receivedData);

            // Xử lý tin nhắn từ Agent (dạng chunk)
            if (receivedData.sender_type === "agent") {
              setIsAgentThinking(false); // Agent đã trả lời, mở lại input
              setIsTimeoutOccurred(false); // Clear timeout status
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              setMessages(prevMessages => {
                // Nếu message cuối cùng là agent, append chunk
                if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].sender === 'agent') {
                  const updatedMessages = [...prevMessages];
                  updatedMessages[updatedMessages.length - 1].content += receivedData.content;
                  updatedMessages[updatedMessages.length - 1].timestamp = receivedData.timestamp;
                  return updatedMessages;
                } else {
                  // Nếu không, push message agent mới
                  const newChatMessage: ChatMessage = {
                    id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                    content: receivedData.content,
                    sender: receivedData.sender_type,
                    timestamp: receivedData.timestamp,
                    agentId: receivedData.sender_user_id,
                  };
                  return [...prevMessages, newChatMessage];
                }
              });
            }
            // Xử lý tin nhắn từ User (đã được thêm vào state ngay khi gửi)
            // Nếu backend echo lại tin nhắn user, chúng ta bỏ qua vì đã thêm vào UI ngay khi gửi
            // Có thể thêm logic kiểm tra ID hoặc content để chắc chắn là echo và không phải tin nhắn từ user khác (nếu hỗ trợ multi-user)
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
                    sender: receivedData.sender_type,
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
             lastAgentMessageIdRef.current = null; // Kết thúc chuỗi chunking
             setIsAgentThinking(false); // Tắt trạng thái typing khi nhận done (nếu backend gửi sau typing)
             setIsTimeoutOccurred(false); // Clear timeout status
             if (timeoutRef.current) {
               clearTimeout(timeoutRef.current);
               timeoutRef.current = null;
             }
          } else if (receivedData.type === "status") {
            console.log("%c[STATUS RECEIVED]", "color: orange; font-weight: bold;", receivedData.content);
            try {
                const statusUpdate = JSON.parse(receivedData.content);
                const runIdToUpdate = statusUpdate.task_run_id;
        
                if (runIdToUpdate) {
                    setTaskRunItems(prevRuns =>
                        prevRuns.map(run => {
                            // Tìm đúng item trong danh sách bằng run_id
                            if (run.id === runIdToUpdate) {
                                // Cập nhật lại trạng thái và kết quả của nó
                                return { 
                                    ...run, 
                                    status: statusUpdate.status,
                                    output_data: statusUpdate.response || run.output_data,
                                    updated_at: new Date().toISOString(),
                                };
                            }
                            return run;
                        })
                    );
                    if (statusUpdate.status === 'completed' || statusUpdate.status === 'error') {
                      // Ra lệnh cho useQuery tự động fetch lại dữ liệu mới nhất từ API
                      queryClient.invalidateQueries({ queryKey: ['taskRuns', currentThread] });
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
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
  
      ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setIsAgentThinking(false); // Stop typing indicator
        setIsTimeoutOccurred(true); // Indicate timeout/error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
  
      return () => {
        ws.current?.close();
      };
    }
  }, [currentThread]); // Reconnect when currentThread changes

  useEffect(() => {
    if (agentId) {
      const initializeChat = async () => {
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
          console.log('Agent loaded:', agentData.data.greeting_message
          );

          // TODO: Fetch tasks for the agent
          if (agentId) {
            try {
              const agentTasksResponse = await getAgentTasks(agentId); // Gọi API mới
              if (agentTasksResponse.data) {
                // Mapping dữ liệu từ API nếu cần, đảm bảo khớp với TaskWithInputs[]
                // Hiện tại giả định cấu trúc trả về từ API khớp
                setTasks(agentTasksResponse.data);
                console.log("Fetched tasks:", agentTasksResponse.data);
              }
            } catch (taskError) {
              console.error('Error fetching agent tasks:', taskError);
              // Xử lý lỗi fetch tasks
            }
          }

          let threadId: string | null = null;
          let initialMessages: ChatMessage[] = [];

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

          setCurrentThread(threadId);
          setMessages(initialMessages);
          console.log("Thread ID set to:", threadId);

        } catch (error) {
          console.error('Error initializing chat:', error);
        } finally {
          setIsLoading(false);
        }
      };

      initializeChat();
    }
  }, [agentId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => { // Made async
    if (message.trim() && currentThread) { // Check if threadId exists
      setIsSending(true); // Start loading
      setIsAgentThinking(true); // Khóa input, chờ agent trả lời
      setIsTimeoutOccurred(false); // Reset timeout status for new message

      // Set a timeout for the agent's response (e.g., 30 seconds)
      timeoutRef.current = setTimeout(() => {
        setIsAgentThinking(false); // Stop typing indicator
        setIsTimeoutOccurred(true); // Set timeout status
        toast({
          title: "Lỗi!",
          description: "Agent không phản hồi. Vui lòng thử lại.",
          variant: "destructive",
        });
      }, 30000); // 30 seconds

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
          sender_user_id: "current_user_placeholder_id", // Placeholder cho UserID
        };

        ws.current?.send(JSON.stringify(messageToSend)); // Gửi tin nhắn qua WebSocket
        setIsSending(false); 
      } catch (error) {
        console.error('Error sending message via WebSocket:', error);
        setIsSending(false);
        setIsAgentThinking(false); // Stop typing indicator
        setIsTimeoutOccurred(true); // Indicate error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
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
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

      navigateToAgentChat(agentId); // Giữ lại navigate helper
      setIsCreatingThread(false); // End loading on success

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

      console.log('Thread clicked:', threadId, 'Messages loaded:', formattedMessages.length);

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

  const getMessageStyle = (sender: string) => {
    if (sender === 'user') {
      return 'bg-primary color-black';
    } else {
      return 'bg-card text-card-foreground';
    }
  };


  // Initialize useNavigate
  const navigate = useNavigate();

  // Helper function for navigation
  const navigateToAgentChat = (agentId: string) => {
    if (agentId) {
      navigate(`/dashboard/agents/${agentId}`);
    }
  };

  const { t } = useLanguage();

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
  useEffect(() => {
    const runsFromApi = historyData?.data;
    // Chỉ cập nhật từ API nếu state hiện tại đang rỗng (tức là người dùng mới mở bảng)
    if (runsFromApi && taskRunItems.length === 0) {
        const sortedRuns = [...runsFromApi].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
        setTaskRunItems(sortedRuns);
    }
}, [historyData, taskRunItems.length]); // Thêm taskRunItems.length vào dependency

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      

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
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {threadsData?.data?.map((thread, index, arr) => (
                    <div key={thread.id}>
                      <div className="p-3 rounded-lg hover:bg-muted cursor-pointer">
                        <button className="text-sm font-medium text-black" onClick={() => handleThreadClick(thread.id)}>
                          {thread.title ? thread.title : 'New chat'}
                        </button>
                      </div>
                      {index < arr.length - 1 && (
                        <div className="border-b border-muted-foreground/20 my-2"></div>
                      )}
                    </div>
                  ))}
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
                  <Plus className="h-4 w-4 text-black" />
                )}
                <span className={cn(isCreatingThread ? ' text-primary-text' : ' text-primary-text')}>{isCreatingThread ? 'Creating...' : 'New chat'}</span> {/* Change text and color */}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {threadsData?.data?.map((thread, index, arr) => (
                <div key={thread.id}>
                  <div className="p-3 rounded-lg hover:bg-muted cursor-pointer">
                    <button className="text-sm font-medium text-black" onClick={() => handleThreadClick(thread.id)}>
                      {thread.title ? thread.title : 'New chat'}
                    </button>
                  </div>
                  {index < arr.length - 1 && (
                    <div className="border-b border-muted-foreground/20 my-2"></div>
                  )}
                </div>
              ))}
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
              "flex-1 min-h-0 p-3 md:p-4 overflow-y-auto space-y-4 md:space-y-5 bg-background",
              aboveInputContent !== 'none' ? 'pb-[200px]' : 'pb-[120px]'
            )}
          >
            {/* 1. Vòng lặp hiển thị tin nhắn (giữ nguyên) */}
            {messages.slice(-50).map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start",
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.sender === 'agent' && (
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 mr-2">
                    <AvatarImage src={currentAgent?.avatar} alt={currentAgent?.name || 'Agent'} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {currentAgent?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-[70%] min-w-0 p-3 rounded-lg shadow-md break-words", // Đảm bảo có min-w-0 và grid
                  getMessageStyle(msg.sender)
                )}>
                  <ChatMessageContent
                    content={msg.content}
                    isAgent={msg.sender === 'agent'}
                   
                  />
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 ml-2">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      U
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* 2. Hiển thị chỉ báo Agent đang suy nghĩ (giữ nguyên) */}
            {isAgentThinking && (
              <AgentTypingIndicator
                agentName={currentAgent?.name}
                agentAvatar={currentAgent?.avatar}
              />
            )}
            
            {/* --- 3. KHỐI HIỂN THỊ TASK LOGS MỚI ĐƯỢC THÊM VÀO ĐÂY --- */}
            {taskLogs.length > 0 && (
                <div className="space-y-2">
                {taskLogs.map((log, index) => {
                    let parsedLog: unknown;
                    try {
                        parsedLog = JSON.parse(log);
                    } catch {
                        return <p key={index} className="text-muted-foreground text-xs">{log}</p>;
                    }
            
                    if (isTaskLogMessage(parsedLog)) {
                        return (
                            <div key={index} className="p-2 rounded bg-muted/50 text-xs font-mono">
                                <div className="flex items-center">
                                    <span className={cn(
                                        'mr-2 font-bold',
                                        parsedLog.status === 'success' && 'text-green-500',
                                        parsedLog.status === 'completed' && 'text-green-500',
                                        parsedLog.status === 'processing' && 'text-yellow-500',
                                        parsedLog.status === 'error' && 'text-red-500'
                                    )}>
                                        [{parsedLog.status.toUpperCase()}]
                                    </span>
                                    <span className="text-foreground">{parsedLog.message}</span>
                                </div>
                            </div>
                        );
                    } else if (isTaskOutputData(parsedLog)) {
                        return (
                            <div key={index} className="p-2 rounded bg-muted/50 text-xs font-mono">
                                <div className="mt-2 border border-border rounded-lg p-2 bg-background">
                                    <p className="text-xs font-semibold mb-2 font-sans text-foreground">Kết quả Video:</p>
                                    <video
                                        src={parsedLog.url}
                                        poster={parsedLog.snapshot_url}
                                        controls
                                        className="w-full rounded-md"
                                        preload="metadata"
                                    >
                                        Trình duyệt của bạn không hỗ trợ thẻ video.
                                    </video>
                                    <div className="text-xs mt-2 space-y-1 font-sans">
                                        <p>
                                            <span className="font-medium text-foreground">Tải video:</span>{' '}
                                            <a href={parsedLog.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                                                {parsedLog.id}.mp4
                                            </a>
                                        </p>
                                        <p>
                                            <span className="font-medium text-foreground">Xem ảnh thumbnail:</span>{' '}
                                            <a href={parsedLog.snapshot_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                                                snapshot.jpg
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    } else if (typeof parsedLog === 'object' && parsedLog !== null) {
                        // C. Nếu là một đối tượng JSON khác không xác định được, hiển thị dạng thô
                        return (
                            <div key={index} className="p-2 rounded bg-muted/50 text-xs font-mono">
                                <pre className="mt-1 text-muted-foreground whitespace-pre-wrap break-all bg-black/70 p-2 rounded-md">
                                    {JSON.stringify(parsedLog, null, 2)}
                                </pre>
                            </div>
                        );
                    }
                    return null; // Fallback for unexpected types
                })}
            </div>
            )}
            {/* --- KẾT THÚC KHỐI TASK LOGS --- */}

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
                    <TaskHistory runs={taskRunItems} />
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

               {isTimeoutOccurred && (
                 <div className="p-3 text-red-500 bg-red-100 border border-red-200 rounded-lg mb-3">
                   <p>Agent không phản hồi trong thời gian quy định. Vui lòng thử lại hoặc kiểm tra kết nối.</p>
                 </div>
               )}

               <div className="flex flex-col space-y-2 p-4 border border-border rounded-lg bg-card text-card-foreground md:max-w-[800px] mx-auto">
                 
                 <div className="flex items-center space-x-2 md:space-x-3 flex-grow">
                    <Textarea
                      placeholder={t('askAI')}
                      className="flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-black focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex-1 resize-none min-h-[48px] pr-10 bg-transparent text-foreground border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      style={{ overflowY: 'hidden', height: 'auto' }}
                      disabled={isAgentThinking || isCreatingThread || isLoading} // Disable when agent thinking, creating thread, or initial loading
                    />
                 </div>

                 <div className="flex items-center space-x-4 pt-2 justify-between">
                    <div className="flex items-center space-x-2">
                       {/* Knowledge Button with Description */}
                       <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full border-border text-black hover:bg-muted h-10 w-10"
                          onClick={() => setShowTaskHistory(prev => !prev)}
                          title="Xem lịch sử thực thi"
                      >
                          <History className="h-5 w-5" />
                      </Button>
                       <Button
                          variant="outline"
                           size="icon"
                          className="rounded-full border-border text-black hover:bg-muted h-10 w-10 "
                          onClick={() => setAboveInputContent(aboveInputContent === 'knowledge' ? 'none' : 'knowledge')}
                          disabled={isAgentThinking || isCreatingThread || isLoading}
                          title="Chọn tệp kiến thức"
                       >
                          <Book className="h-5 w-5" />
                       </Button>

                       {/* Task Button with Description */}
                       <Button
                          variant="outline"
                           size="icon"
                          className="rounded-full border-border text-black hover:bg-muted h-10 w-10 "
                          onClick={() => setIsTaskModalOpen(true)}
                          disabled={isAgentThinking || isCreatingThread || isLoading}
                          title="Kiến thức đã được đào tạo"
                       >
                          <ListPlus className="h-5 w-5" />
                       </Button>

                       {/* Nút clock lịch sử, chỉ hiện ở mobile */}
                       <Button
                          variant="primary"
                           size="icon"
                          className="rounded-full border border-border h-10 w-10  hover:bg-muted text-black md:hidden"
                          onClick={() => setShowMobileSidebar(true)}
                          aria-label="Lịch sử chat"
                          type="button"
                          disabled={isCreatingThread || isLoading}
                       >
                          <Clock className="h-5 w-5" />
                       </Button>

                       {/* Attach File Button with Description */}
                       <Button
                          variant="outline"
                           size="icon"
                          className="rounded-full border-border text-black hover:bg-muted h-10 w-10 "
                          disabled={isAgentThinking || isCreatingThread || isLoading}
                       >
                          <Paperclip className="h-5 w-5" />
                       </Button>
                    </div>

                  
                    {/* Send Button (Moved to the second row) */}
                    <Button
                      type="submit"
                      size="icon"
                      className="flex-shrink-0  text-black hover:bg-black"
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending || !currentThread || isAgentThinking || isCreatingThread || isLoading} // Disable if message is empty, sending, no thread, agent thinking, creating thread, or initial loading
                    >
                      {(isSending || isAgentThinking || isCreatingThread || isLoading) ? (
                        <span className="loading-spinner animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span> // Show spinner when sending, agent thinking, creating thread, or initial loading
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
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
    </div>
  );
};

export default AgentChat;

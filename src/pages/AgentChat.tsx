/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, X, Plus, Paperclip, 
  ListPlus, Book, Clock,
  Rocket, Lightbulb,
      ChevronsDown, BrainCircuit,
  ChevronUp, ChevronDown
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
import { getAgentById, createThread, getWorkspace, checkThreadExists, sendMessageToThread, getThreadMessages, getAgentTasks, executeTask, getThreads, getThreadById, getThreadByAgentId, getTaskRunsByThreadId, uploadMessageWithFile, getCredentials, getSubflowLogs, deleteThread } from '@/services/api';
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
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { createAvatar } from '@dicebear/core';
import { adventurer  } from '@dicebear/collection';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import LogAgentThinking from '@/components/LogAgentThinking';
import { useInView } from 'react-intersection-observer';
import React from 'react';
import { WS_URL } from '@/config/api';
console.log("WS_URL", WS_URL);
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
  chat_message?: ApiMessage;
  parent_message_id?: string;
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

// Interface cho subflow log từ WebSocket
interface SubflowLog {
  type: "subflow_log";
  thread_id: string;
  content: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

// Định nghĩa interface Credential (giống CredentialsPage)
interface Credential {
  id: string;
  provider: string;
  credential: object;
  created_at?: string;
}

// Thêm component con cho message agent:
const AgentMessageWithLog = ({ msg, userMsgId, messageLogs, loadingLog, handleShowLog, children }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  React.useEffect(() => {
    console.log('AgentMessageWithLog', {
      inView,
      userMsgId,
      msgId: msg.id,
      hasLog: !!messageLogs[msg.id],
      loading: !!loadingLog[msg.id]
    });
    if (inView && userMsgId && !messageLogs[msg.id] && !loadingLog[msg.id]) {
      handleShowLog(msg.id, userMsgId);
    }
  }, [inView, userMsgId, msg.id, messageLogs, loadingLog]);
  return (
    <div ref={ref} key={msg.id} className="flex flex-col">
      {children}
    </div>
  );
};

const AgentChat = () => {
  const { agentId, threadId: threadFromUrl } = useParams<{ agentId: string; threadId?: string }>();
  const { workspace, isLoading: isWorkspaceLoading } = useSelectedWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  
  const [subflowLogs, setSubflowLogs] = useState<SubflowLog[]>([]);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const { user, updateUser } = useAuth();
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  // Agent and workspace info
  const [currentThread, setCurrentThread] = useState<string | null>(threadFromUrl || null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);

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
  const agentDoneTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  const handleScroll = () => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const isScrolledUp = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight > 300; // 300px là ngưỡng, có thể tùy chỉnh
      setShowScrollToBottom(isScrolledUp);
    }
  };

  // ADDED: Hàm để cuộn xuống tin nhắn mới nhất
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: behavior,
      });
    }
  };

  // State cho credential
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string>('');
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  // Clean up interval on component unmount (now handled by WS cleanup)
  useEffect(() => {
    if (currentThread) {
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      if (!token) {
    
        return;
      }

      const wsUrl = `${WS_URL}?token=${token}&thread_id=${currentThread}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket Connected", { threadId: currentThread });
      };

      ws.current.onmessage = (event) => {
        try {
          const receivedData: any = JSON.parse(event.data);
          // Xử lý cập nhật credit realtime
          if (receivedData.type === 'credit_update' && typeof receivedData.credit === 'number') {
            updateUser({ ...user, credit: receivedData.credit });
            return;
          }
          // Xử lý lỗi hết credit
          if (receivedData.type === 'error' && receivedData.content && receivedData.content.includes('hết credit')) {
            setIsCreditError(true);
            setIsAgentThinking(false);
            return;
          }
          const msgData = receivedData.chat_message ? receivedData.chat_message : receivedData;
      
        
          const optimisticId = receivedData.optimistic_id || msgData.optimistic_id;
      
     
          if (optimisticId) {
            setMessages(prevMessages => {
              const confirmedMessage: ChatMessage = {
                id: msgData.id,
                content: msgData.message_content || msgData.content,
                sender: msgData.sender_type,
                timestamp: msgData.created_at,
                agentId: msgData.sender_agent_id,
                image_url: msgData.image_url,
                file_url: msgData.file_url,
                isStreaming: false
              };
      
              const indexToReplace = prevMessages.findIndex(m => m.id === optimisticId);
      
              if (indexToReplace !== -1) {
                const newMessages = [...prevMessages];
                newMessages[indexToReplace] = confirmedMessage;
                return newMessages;
                } else {
                if (!prevMessages.some(m => m.id === confirmedMessage.id)) {
                  return [...prevMessages, confirmedMessage];
                }
                  return prevMessages;
              }
            });
            // CHỈ tắt trạng thái đang nghĩ nếu message này là của agent
            if (msgData.sender_type === "agent") {
              setIsAgentThinking(false);
            }
            return; // Kết thúc
          }
          
       
          if (receivedData.type === "chat" && msgData.sender_type === "agent") {
            setSubflowLogs([]); // Reset subflow logs khi agent bắt đầu trả lời
            setMessages(prevMessages => {
              const lastMessageIndex = prevMessages.length - 1;
              if (prevMessages.length > 0 && prevMessages[lastMessageIndex].sender === 'agent' && prevMessages[lastMessageIndex].isStreaming) {
                const lastMessage = prevMessages[lastMessageIndex];
                const updatedContent = msgData.message_content || msgData.content;
                const updatedLastMessage: ChatMessage = {
                  ...lastMessage,
                  content: updatedContent,
                  timestamp: msgData.created_at || receivedData.timestamp,
                };
                const updatedMessages = [...prevMessages];
                updatedMessages[lastMessageIndex] = updatedLastMessage;
                return updatedMessages;
              } else {
                const newChatMessage: ChatMessage = {
                  id: msgData.id || `ws-${Date.now()}`,
                  content: msgData.message_content || msgData.content,
                  sender: msgData.sender_type,
                  timestamp: msgData.created_at || receivedData.timestamp,
                  agentId: msgData.sender_user_id,
                  image_url: msgData.image_url,
                  file_url: msgData.file_url,
                  isStreaming: true,
                  parent_message_id: msgData.parent_message_id, // Đảm bảo có parent_message_id
                };
                if (prevMessages.some(m => m.id === newChatMessage.id)) return prevMessages;
                // GỌI LUÔN handleShowLog nếu có parent_message_id
                if (newChatMessage.parent_message_id) {
                  handleShowLog(newChatMessage.id, newChatMessage.parent_message_id);
                }
                return [...prevMessages, newChatMessage];
              }
            });
            return;
          }
      

          if (receivedData.type === "done") {
            lastAgentMessageIdRef.current = null;
            setIsAgentThinking(false);
            setSubflowLogs([]); // Reset subflow logs khi agent hoàn thành
            setMessages(prevMessages => {
              if (prevMessages.length === 0) return prevMessages;
              const lastMessageIndex = prevMessages.length - 1;
              const lastMessage = prevMessages[lastMessageIndex];
              if (lastMessage.sender === 'agent' && lastMessage.isStreaming) {
                const finalizedMessage = { ...lastMessage, isStreaming: false };
                const updatedMessages = [...prevMessages];
                updatedMessages[lastMessageIndex] = finalizedMessage;
                return updatedMessages;
              }
              return prevMessages;
            });
            return;
          }
          if (receivedData.type === "status") {
           
            try {
                const statusUpdate = JSON.parse(receivedData.content);
                const runIdToUpdate = statusUpdate.task_run_id;
        
                if (runIdToUpdate) {
                    setTaskRunItems(prevRuns =>
                        prevRuns.map(run => {
                            // Tìm đúng item trong danh sách bằng run_id
                            if (run.id === runIdToUpdate) {
                                // Cập nhật lại trạng thái, kết quả và thông báo lỗi (nếu có)
                                return {
                                    ...run,
                                    status: statusUpdate.status,
                                    output_data: statusUpdate.result ?? statusUpdate.response ?? run.output_data,
                                    updated_at: new Date().toISOString(),
                                    error: (statusUpdate.status === 'error' || statusUpdate.status === 'failed') ? (statusUpdate.message || statusUpdate.error_message || 'Đã xảy ra lỗi.') : undefined,
                                };
                            }
                            return run;
                        })
                    );
                                        if (statusUpdate.status === 'completed' || statusUpdate.status === 'error' || statusUpdate.status === 'failed') {
                      // Ra lệnh cho useQuery tự động fetch lại dữ liệu mới nhất từ API
                      queryClient.invalidateQueries({ queryKey: ['taskRuns', currentThread] });
                  }
                }
            } catch (e) {
                console.error("Error parsing status update: ", e);
            }
          }

          // Xử lý subflow_log từ backend
          if (receivedData.type === "subflow_log") {
            console.log("Nhận subflow log:", receivedData);
            setSubflowLogs(prevLogs => {
              // Thêm log mới vào cuối danh sách
              const newLog: SubflowLog = {
                type: "subflow_log",
                thread_id: receivedData.thread_id,
                content: receivedData.content,
                timestamp: receivedData.timestamp,
                created_at: receivedData.created_at,
                updated_at: receivedData.updated_at
              };
              return [...prevLogs, newLog];
            });
            return;
          }
      
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
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
    // Reset toàn bộ state liên quan đến chat khi đổi agent
    setCurrentAgent(null);
    setMessages([]);
    setCurrentThread(null);
    setTasks([]);
    setIsLoading(true);
    setIsSending(false);
    setIsCreatingThread(false);
    setShowScrollToBottom(false);
    setShowMobileSidebar(false);
    setIsAgentThinking(false);
    setAboveInputContent('none');
    setSelectedTaskId(null);
    setSelectedTaskInputs({});
    setTaskExecutionStatus({});
    setTaskRunItems([]);
    setCredentials([]);
    setSelectedCredentialId('');
    setLoadingCredentials(false);
    setUploadedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (textareaRef.current) textareaRef.current.style.height = '40px';
    hasInitializedRef.current = false;
    isInitializingRef.current = false;

    // Luôn gọi lại initializeChat khi agentId đổi
    if (agentId && workspace?.id) {
      const initializeChat = async () => {
        if (isInitializingRef.current) return;
        isInitializingRef.current = true;
        try {
          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, 500));

          const currentWorkspaceId = workspace.id;
          const agentData = await getAgentById(agentId);
          setCurrentAgent(agentData.data);

          // Fetch tasks for the agent
          if (agentId) {
            try {
              const agentTasksResponse = await getAgentTasks(agentId);
              if (agentTasksResponse.data) {
                setTasks(agentTasksResponse.data);
              }
            } catch (taskError) {
              console.error('Error fetching agent tasks:', taskError);
            }
          }

          let threadId: string | null = null;
          let initialMessages: ChatMessage[] = [];

          // Kiểm tra thread tồn tại
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
                  agentId: msg.sender_agent_id,
                  image_url: msg.image_url,
                  file_url: msg.file_url,
                  parent_message_id: msg.parent_message_id, // BỔ SUNG DÒNG NÀY
              })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

              if (initialMessages.length === 0 && agentData.data.greeting_message) {
                const welcomeMessage: ChatMessage = {
                  id: Date.now().toString(),
                  content: agentData.data.greeting_message || 'Hello! How can I help you?',
                  sender: 'agent',
                  timestamp: new Date().toISOString(),
                  agentId: agentData.data.id,
                  image_url: agentData.data.image_url,
                  file_url: agentData.data.file_url,
                };
                initialMessages.push(welcomeMessage);
              }
            } catch (fetchError) {
              console.error('Error fetching initial messages:', fetchError);
            }
          } else {
            // Tạo thread mới khi không tồn tại thread nào
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
              agentId: agentData.data.id,
              image_url: agentData.data.image_url,
              file_url: agentData.data.file_url,
            };
            initialMessages = [welcomeMessage];
          }

          // Nếu threadId đã có, fetch messages
          if (threadId) {
            try {
              const messagesResponse = await getThreadMessages(threadId);
              initialMessages = (messagesResponse.data && Array.isArray(messagesResponse.data) ? messagesResponse.data : []).map(msg => ({
                  id: msg.id,
                  content: msg.message_content,
                  sender: msg.sender_type,
                  timestamp: msg.created_at,
                  agentId: msg.sender_agent_id,
                  image_url: msg.image_url,
                  file_url: msg.file_url,
                  parent_message_id: msg.parent_message_id, // BỔ SUNG DÒNG NÀY
              })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

              if (initialMessages.length === 0 && agentData.data.greeting_message) {
                const welcomeMessage: ChatMessage = {
                  id: Date.now().toString(),
                  content: agentData.data.greeting_message || 'Hello! How can I help you?',
                  sender: 'agent',
                  timestamp: new Date().toISOString(),
                  agentId: agentData.data.id,
                  image_url: agentData.data.image_url,
                  file_url: agentData.data.file_url,
                };
                initialMessages.push(welcomeMessage);
              }
            } catch (fetchError) {
              console.error('Error fetching initial messages:', fetchError);
            }
          }

          setCurrentThread(threadId);
          setMessages(initialMessages);
        } catch (error) {
          console.error('Error initializing chat:', error);
        } finally {
          setIsLoading(false);
          isInitializingRef.current = false;
        }
      };
      initializeChat();
    }
  }, [agentId, workspace?.id]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 150;
      
      if (isAtBottom || !isAgentThinking) {
        // Sử dụng requestAnimationFrame để đợi DOM update xong rồi mới cuộn
        requestAnimationFrame(() => {
          scrollToBottom('auto'); // Cuộn ngay lập tức khi có tin nhắn mới
        });
      }
    }
  }, [messages, isAgentThinking]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        scrollToBottom('auto');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    // Gắn listener sau khi loading xong
    if (chatContainer && !isLoading) {
      chatContainer.addEventListener('scroll', handleScroll);
    }
    
    // Dọn dẹp listener khi component unmount
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isLoading]); // Chạy lại khi trạng thái loading thay đổi
  const handleSendMessage = () => {
    if (isCreditError) return;
    // Cho phép gửi nếu có text hoặc có file
    if ((message.trim() || uploadedFile) && currentThread) {
      setIsSending(true);
  
      // Tạo ID tạm thời duy nhất
      const optimisticId = `optimistic-${Date.now()}`;
      
      // Tạo tin nhắn tạm thời để hiển thị ngay
      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        file_url: filePreview?.url || undefined,
        image_url: filePreview?.url || undefined,
      };
  
      // Cập nhật UI ngay lập tức
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
  
      // Lưu lại dữ liệu để gửi đi
      const messageToSend = message;
      const fileToSend = uploadedFile;
      const threadIdToSend = currentThread;
  
      // Xóa input
      setMessage('');
      setUploadedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Reset chiều cao textarea về mặc định (ví dụ 40px)
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
        textareaRef.current.focus();
      }
      
      // Gửi dữ liệu trong nền
      if (fileToSend) { // Trường hợp có file
        setIsAgentThinking(true);
        uploadMessageWithFile(threadIdToSend, messageToSend, fileToSend, optimisticId)
          .catch(error => {
            console.error('Error sending message with file:', error);
            toast({ variant: "destructive", title: "Lỗi", description: "Gửi file thất bại." });
            setMessages(prev => prev.filter(m => m.id !== optimisticId));
          })
          .finally(() => {
            setIsSending(false);
          });
      } else { // Trường hợp chỉ có text
        
        // ===== ĐIỂM SỬA QUAN TRỌNG CHO CLIENT =====
        const messageToSendObj = {
          type: "chat",
          thread_id: threadIdToSend,
          content: messageToSend,
          sender_type: "user",
          sender_user_id: user?.id,
          message_id: optimisticId, // <-- THÊM DÒNG NÀY ĐỂ GỬI ID TẠM THỜI
        };
        // ===========================================
  
        ws.current?.send(JSON.stringify(messageToSendObj));
        setIsSending(false); 
        setIsAgentThinking(true);
        setSubflowLogs([]); // Reset subflow logs khi bắt đầu chat mới
      }
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
          agentId: msg.sender_agent_id,
          image_url: msg.image_url,
          file_url: msg.file_url,
          parent_message_id: msg.parent_message_id, // BỔ SUNG DÒNG NÀY
      })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      setMessages(initialMessages); // Sử dụng messages từ backend
      
      // Thêm tin nhắn chào mừng nếu không có tin nhắn ban đầu
      if (initialMessages.length === 0 && currentAgent?.greeting_message) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          content: currentAgent.greeting_message || 'Hello! How can I help you?',
          sender: 'agent',
          timestamp: new Date().toISOString(),
          agentId: currentAgent.id,
          image_url: currentAgent.image_url,
          file_url: currentAgent.file_url,
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
      const extra: any = {};
      if (selectedCredentialId) {
        const cred = credentials.find(c => String(c.id) === selectedCredentialId);
        if (cred) {
          extra.provider = cred.provider;
          extra.credential = cred.credential;
        }
      }
      const response = await executeTask(selectedTask.id, selectedTaskInputs, currentThread, extra);
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
    setSelectedCredentialId('');
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
          agentId: msg.sender_agent_id,
          image_url: msg.image_url,
          file_url: msg.file_url,
          parent_message_id: msg.parent_message_id, // BỔ SUNG DÒNG NÀY
      })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Update the state with messages from the clicked thread
      if (formattedMessages.length === 0 && currentAgent?.greeting_message) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          content: currentAgent.greeting_message || 'Hello! How can I help you?',
          sender: 'agent',
          timestamp: new Date().toISOString(),
          agentId: currentAgent.id,
          image_url: currentAgent.image_url,
          file_url: currentAgent.file_url,
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



  // Helper: kiểm tra thread hiện tại đã có tin nhắn user chưa
  const hasUserMessage = messages.some(msg => msg.sender === 'user');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputAutoGrow = (e?: React.ChangeEvent<HTMLTextAreaElement> | React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  const [filePreview, setFilePreview] = useState<{url: string; type: string; name: string; size: string} | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          variant: "destructive",
          title: "File quá lớn",
          description: "Vui lòng chọn file có dung lượng nhỏ hơn 10MB.",
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setUploadedFile(file);
      const fileSize = file.size < 1024 * 1024 
        ? `${(file.size / 1024).toFixed(1)} KB` 
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      
      setFilePreview({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        size: fileSize
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          setUploadedFile(file);
          const fileSize = file.size < 1024 * 1024 
            ? `${(file.size / 1024).toFixed(1)} KB` 
            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
          
          setFilePreview({
            url: URL.createObjectURL(file),
            type: file.type,
            name: file.name,
            size: fileSize
          });
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    // Fetch credentials khi mở form thực thi task
    if (aboveInputContent === 'taskInputs') {
      setLoadingCredentials(true);
      getCredentials()
        .then(res => {
          setCredentials(Array.isArray(res) ? res : (res.data || []));
        })
        .catch(() => setCredentials([]))
        .finally(() => setLoadingCredentials(false));
    }
  }, [aboveInputContent]);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const [messageLogs, setMessageLogs] = useState<Record<string, SubflowLog[]>>({});
  const [loadingLog, setLoadingLog] = useState<Record<string, boolean>>({});

  // Thêm hàm fetch log khi click:
  const handleShowLog = async (agentMsgId: string, userMsgId: string) => {
    if (messageLogs[agentMsgId] || loadingLog[agentMsgId]) return;
    setLoadingLog(prev => ({ ...prev, [agentMsgId]: true }));
    try {
      const res = await getSubflowLogs(userMsgId);
      // Luôn set, kể cả khi log rỗng
      setMessageLogs(prev => ({ ...prev, [agentMsgId]: Array.isArray(res?.data) ? res.data : [] }));
    } finally {
      setLoadingLog(prev => ({ ...prev, [agentMsgId]: false }));
    }
  };

  // Tự động focus lại input chat khi agent trả lời xong
  useEffect(() => {
    if (!isAgentThinking && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAgentThinking]);

  const [isCreditError, setIsCreditError] = useState(false);

  const [showDeleteThreadModal, setShowDeleteThreadModal] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  // Helper: Lấy tên file từ URL
  function getFileName(url?: string) {
    if (!url) return '';
    const lastSlash = url.lastIndexOf('/');
    let name = url.substring(lastSlash + 1);
    // Nếu có dấu _ thì lấy phần sau cùng (tên gốc)
    const lastUnderscore = name.lastIndexOf('_');
    if (lastUnderscore !== -1) {
      name = name.substring(lastUnderscore + 1);
    }
    return decodeURIComponent(name);
  }

  // Helper: Xác định loại file từ tên file
  function getFileTypeLabel(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (["pdf"].includes(ext)) return "PDF";
    if (["doc", "docx"].includes(ext)) return "Document";
    if (["xls", "xlsx"].includes(ext)) return "Spreadsheet";
    if (["ppt", "pptx"].includes(ext)) return "Presentation";
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "Image";
    if (["txt", "md", "csv"].includes(ext)) return "Text file";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "Archive";
    return "File";
  }

  // Helper: Xác định màu và label icon theo loại file
  function getFileIconProps(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (["pdf"].includes(ext)) return { color: "bg-red-500", label: "PDF" };
    if (["doc", "docx"].includes(ext)) return { color: "bg-blue-500", label: "DOC" };
    if (["xls", "xlsx"].includes(ext)) return { color: "bg-green-500", label: "XLS" };
    if (["ppt", "pptx"].includes(ext)) return { color: "bg-orange-500", label: "PPT" };
    if (["txt", "md", "csv"].includes(ext)) return { color: "bg-gray-500", label: "TXT" };
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return { color: "bg-yellow-500", label: "ZIP" };
    if (["json"].includes(ext)) return { color: "bg-pink-500", label: "JSON" };
    return { color: "bg-pink-500", label: "FILE" };
  }

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
                  <div className="h-10 w-10 flex items-center justify-center">
                    {currentAgent?.avatar ? (
                      <div dangerouslySetInnerHTML={{ __html: currentAgent.avatar }} style={{ width: 40, height: 40 }} />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: createAvatar(adventurer , { seed: currentAgent?.name || 'Agent' }).toString() }} style={{ width: 40, height: 40 }} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{currentAgent?.name || 'Agent'}</h2>
                    <p className="text-xs text-muted-foreground">{currentAgent?.role_description || 'AI Assistant'}</p>
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
      <aside className="w-64 flex-shrink-0 border-r dark:bg-primary-white  flex flex-col hidden md:flex">
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
              <div className="h-10 w-10 flex items-center justify-center">
                {currentAgent?.avatar ? (
                  <div dangerouslySetInnerHTML={{ __html: currentAgent.avatar }} style={{ width: 40, height: 40 }} />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: createAvatar(adventurer , { seed: currentAgent?.name || 'Agent' }).toString() }} style={{ width: 40, height: 40 }} />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{currentAgent?.name || 'Agent'}</h2>
                <p className="text-xs text-muted-foreground">{currentAgent?.role_description}</p>
              </div>
            </div>
            <div className="p-4 border-b flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`
                        flex-1 h-10 rounded-xl border border-primary flex items-center justify-center space-x-2 px-6
                        bg-transparent
                        dark:bg-transparent dark:text-primary-foreground dark:shadow-2xl dark:border-primary
                      `}
                      onClick={() => handleNewChat(currentAgent?.id)}
                      disabled={isCreatingThread || isLoading || (!!currentThread && !hasUserMessage)}
                    >
                      {isCreatingThread ? (
                        <span className="loading-spinner animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></span>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span className={cn(isCreatingThread ? ' text-primary-text' : ' text-primary-text')}>{isCreatingThread ? 'Creating...' : 'New chat'}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Tạo cuộc trò chuyện mới
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                    
        {Array.isArray(threadsData?.data) ? threadsData.data.map((thread) => {
          const isActive = currentThread === thread.id;
          return (
            
            <a
              key={thread.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleThreadClick(thread.id);
              }}
              className={cn(
                "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "dark:bg-zinc-800 text-zinc-50 bg-primary "
                  : "dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <span className="truncate">
                {thread.title || 'New chat'}
              </span>
              {user?.id === thread.user_id && (
                <div className="opacity-0 transition-opacity group-hover:opacity-100 ">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-zinc-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setThreadToDelete(thread.id);
                      setShowDeleteThreadModal(true);
                    }}
                    aria-label="Xóa cuộc trò chuyện"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                    </svg>
                  </Button>
                </div>
              )}
            </a>
            
          );
        }) : <div className="text-center p-2 text-zinc-500">Không có cuộc hội thoại nào</div>}
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
            {messages.slice(-50).map((msg, idx) => {
              if (msg.sender === 'agent') {
                // Chỉ fetch log nếu có parent_message_id, nhưng luôn render message agent
                const userMsgId = msg.parent_message_id;
                // Không còn fallback slice/index, chỉ lấy đúng parent_message_id
                return (
                  <AgentMessageWithLog
                    key={msg.id}
                    msg={msg}
                    userMsgId={userMsgId}
                    messageLogs={messageLogs}
                    loadingLog={loadingLog}
                    handleShowLog={handleShowLog}
                  >
                    <div className="flex items-end gap-2 justify-start">
                      {/* Avatar agent bên trái */}
                      <div className="h-9 w-9 flex-shrink-0 self-start mt-1">
                        {currentAgent?.avatar ? (
                          <div dangerouslySetInnerHTML={{ __html: currentAgent.avatar }} style={{ width: 36, height: 36 }} />
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: createAvatar(adventurer , { seed: currentAgent?.name || 'Agent' }).toString() }} style={{ width: 36, height: 36 }} />
                        )}
                      </div>
                      {/* Bubble agent */}
                      <div
                        className={cn(
                          "max-w-[85%] md:max-w-[75%] p-3 rounded-2xl shadow-sm relative",
                          'dark:bg-[#23272f] light:bg-gradient-light text-foreground rounded-bl-lg',
                          'whitespace-normal'
                        )}
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {/* Log subflow nếu có */}
                        {msg.sender === 'agent' && !msg.isStreaming && Array.isArray(messageLogs[msg.id]) && messageLogs[msg.id].length > 0 && (
                          <LogAgentThinking logs={messageLogs[msg.id]} />
                        )}
                        <ChatMessageContent
                          content={msg.content}
                          isAgent={true}
                          stream={msg.isStreaming ?? false}
                        />
                        {(msg.image_url || msg.file_url) && (
                          <div className="mt-2">
                            {msg.image_url ? (
                              // Hiển thị ảnh
                              <img
                                src={msg.image_url}
                                alt="uploaded image"
                                className="max-w-xs rounded-lg"
                              />
                            ) : msg.file_url ? (
                              (() => {
                                const fileName = getFileName(msg.file_url);
                                const fileType = getFileTypeLabel(fileName);
                                return (
                                  <a
                                    href={msg.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block max-w-xs"
                                    style={{ textDecoration: 'none' }}
                                  >
                                    <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg border border-border shadow-sm hover:border-primary transition">
                                      <div className="flex-shrink-0">
                                        {/* Icon document màu hồng */}
                                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                                          </svg>
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold truncate">{fileName}</div>
                                        <div className="text-xs text-muted-foreground">{fileType}</div>
                                      </div>
                                    </div>
                                  </a>
                                );
                              })()
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Timestamp agent */}
                    <div className="px-12 text-xs text-muted-foreground select-none mt-1 text-left">
                      <span>
                        {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                  </AgentMessageWithLog>
                );
              }
              // Message user
              return (
                <div key={msg.id} className="flex flex-col">
                  <div className="flex items-end gap-2 justify-end">
                    {/* Bubble user */}
                    <div
                      className={cn(
                        "max-w-[85%] md:max-w-[75%] p-3 rounded-2xl shadow-sm relative",
                        'bg-gradient-light dark:bg-gradient-dark text-white rounded-br-lg',
                        'whitespace-normal'
                      )}
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      <ChatMessageContent
                        content={msg.content}
                        isAgent={false}
                        stream={msg.isStreaming ?? false}
                      />
                      {(msg.image_url || msg.file_url) && (
                        <div className="mt-2">
                          {msg.image_url ? (
                            // Hiển thị ảnh
                            <img
                              src={msg.image_url}
                              alt="uploaded image"
                              className="max-w-xs rounded-lg"
                            />
                          ) : msg.file_url ? (
                            (() => {
                              const fileName = getFileName(msg.file_url);
                              const fileType = getFileTypeLabel(fileName);
                              return (
                                <a
                                  href={msg.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block max-w-xs"
                                  style={{ textDecoration: 'none' }}
                                >
                                  <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg border border-border shadow-sm hover:border-primary transition">
                                    <div className="flex-shrink-0">
                                      {/* Icon document màu hồng */}
                                      <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-semibold truncate">{fileName}</div>
                                      <div className="text-xs text-muted-foreground">{fileType}</div>
                                    </div>
                                  </div>
                                </a>
                              );
                            })()
                          ) : null}
                        </div>
                      )}
                    </div>
                    {/* Avatar user bên phải */}
                    <Avatar className="h-9 w-9 flex-shrink-0 self-start mt-1">
                      <AvatarFallback className="font-bold button-gradient-light dark:button-gradient-dark text-white">U</AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Timestamp user */}
                  <div className="px-12 text-xs text-muted-foreground select-none mt-1 text-right">
                    <span>
                      {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                </div>
              );
            })}

          


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
            {/* Select credential */}
            <div className="space-y-2">
              <Label htmlFor="credential-select" className="font-semibold">Chọn Credential (nếu cần)</Label>
              <select
                id="credential-select"
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none transition"
                value={selectedCredentialId}
                onChange={e => setSelectedCredentialId(e.target.value)}
                disabled={loadingCredentials || credentials.length === 0}
              >
                <option value="">Không gửi credential</option>
                {credentials.map(cred => (
                  <option key={cred.id} value={cred.id}>
                    {cred.provider} - {String(cred.id).slice(0, 6)}...{String(cred.id).slice(-4)}
                  </option>
                ))}
              </select>
            </div>
            {/* Các input khác */}
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
                  rows={key.toLowerCase().includes('script') ? 4 : 2}
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

{(() => {
  // Lấy ra tin nhắn cuối cùng trong danh sách
  const lastMessage = messages[messages.length - 1];
  // Kiểm tra xem có phải agent đang trong quá trình streaming hay không
  const isAgentCurrentlyStreaming = lastMessage?.sender === 'agent' && lastMessage.isStreaming;

  // Chỉ hiển thị chỉ báo "..." KHI agent đang nghĩ VÀ CHƯA bắt đầu streaming
  if (isAgentThinking && !isAgentCurrentlyStreaming) {
    return (
      <AgentTypingIndicator
        agentName={currentAgent?.name}
        agentAvatar={currentAgent?.avatar}
        subflowLogs={subflowLogs}
      />
    );
  }
  
  // Trả về null trong các trường hợp khác
  return null;
})()}
{showScrollToBottom && (
              <div className="absolute bottom-28 md:bottom-32 right-6 z-40">
                <Button
                  size="icon"
                  className="rounded-full h-8 w-8 bg-background/70 backdrop-blur-sm border-2 border-border shadow-lg hover:scale-110 hover:bg-muted/90 transition-all duration-200 animate-in fade-in-50"
                  onClick={() => scrollToBottom('smooth')}
                  aria-label="Cuộn xuống cuối"
                >
                  <ChevronsDown className="h-2 w-2 text-muted-foreground" />
                </Button>
              </div>
            )}

              <div className="p-4 bg-background border-t border-border">
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="relative">
                            {/* Preview file phía trên input chat */}
                            {filePreview && (
                              <div className="mb-2 relative max-w-xs">
                                {filePreview.type.startsWith('image/') ? (
                                  <div className="relative w-24 h-24">
                                    <img src={filePreview.url} alt="preview" className="rounded-lg object-cover w-full h-full" />
                                    <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full" onClick={handleRemoveFile}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  (() => {
                                    const { color, label } = getFileIconProps(filePreview.name);
                                    return (
                                      <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg border border-border shadow-sm">
                                        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                                          <span className="text-white text-xs font-bold">{label}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-semibold truncate">{filePreview.name}</div>
                                          <div className="text-xs text-muted-foreground">{filePreview.size}</div>
                                        </div>
                                        <Button size="icon" variant="destructive" className="h-6 w-6 p-0 rounded-full flex-shrink-0" onClick={handleRemoveFile}>
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    );
                                  })()
                                )}
                              </div>
                            )}
                            <div className="flex items-end relative">
                            <Textarea
                                ref={textareaRef}
                                placeholder={t('common.askAI')}
                                className="w-full no-scrollbar rounded-xl border-border bg-background p-4 pr-14 resize-none text-base shadow-sm"
                                value={message}
                                onChange={(e) => { setMessage(e.target.value); handleInputAutoGrow(e); }}
                                onInput={handleInputAutoGrow}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                rows={1}
                                disabled={isSending || isAgentThinking || !currentThread}
                                style={{ overflow: 'auto', maxHeight: '300px' }}
                                onPaste={handlePaste}
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
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            {/* Mobile: icon menu và text cảnh báo căn giữa, dọc */}
                            <div className="block md:hidden mt-2 w-full">
                              <div className="flex justify-center items-center gap-2">
                                <Button variant="ghost" size="icon" title="Đính kèm tệp" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-5 w-5 text-muted-foreground"/></Button>
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
                                
                              </div>
                              <p className="text-xs text-muted-foreground text-center mt-2">Superb AI có thể mắc lỗi. Hãy kiểm tra các thông tin quan trọng.</p>
                            </div>
                            {/* Desktop: giữ nguyên layout cũ */}
                            <div className="hidden md:flex items-center justify-between mt-2 w-full">
  {/* Actions trái */}
  <div className="flex items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium"
      title="Đính kèm tệp"
      onClick={() => fileInputRef.current?.click()}
    >
      <Paperclip className="h-5 w-5 text-muted-foreground" />
      <span className="hidden lg:inline text-sm text-muted-foreground">Đính kèm</span>
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium"
      title="Chọn Task"
      onClick={() => setIsTaskModalOpen(true)}
    >
      <ListPlus className="h-5 w-5 text-muted-foreground" />
      <span className="hidden lg:inline text-sm text-muted-foreground">Task</span>
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium"
      title="Knowledge"
    >
      <Book className="h-5 w-5 text-muted-foreground" />
      <span className="hidden lg:inline text-sm text-muted-foreground">Knowledge</span>
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium"
      title="Lịch sử thực thi"
      onClick={() => setShowTaskHistory(true)}
    >
      <History className="h-5 w-5 text-muted-foreground" />
      <span className="hidden lg:inline text-sm text-muted-foreground">Lịch sử</span>
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
      title="Gợi ý prompt"
      onClick={() => setShowPromptTemplatesModal(true)}
    >
      <Lightbulb className="h-5 w-5" />
      <span className="hidden lg:inline text-sm">Gợi ý</span>
    </Button>
  </div>
  {/* Cảnh báo phải */}
  <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">
    Superb AI có thể mắc lỗi. Hãy kiểm tra các thông tin quan trọng.
  </p>
</div>

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
      <input
        type="file"
        accept="*/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        />
      <AlertDialog open={isCreditError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn đã hết credit</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đã hết credit, vui lòng nạp thêm để tiếp tục sử dụng dịch vụ. Chat sẽ tạm dừng cho đến khi bạn nạp thêm credit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsCreditError(false)} autoFocus>Đóng</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog xác nhận xóa thread */}
      <AlertDialog open={showDeleteThreadModal} onOpenChange={setShowDeleteThreadModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn chắc chắn muốn xóa cuộc trò chuyện này?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xóa vĩnh viễn toàn bộ tin nhắn trong cuộc trò chuyện này và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              onClick={async () => {
                if (!threadToDelete) return;
                try {
                  await deleteThread(threadToDelete);
                  toast({ title: 'Đã xóa cuộc trò chuyện', variant: 'default' });
                  queryClient.invalidateQueries({ queryKey: ['threads', agentId] });
                  if (currentThread === threadToDelete) {
                    setCurrentThread(null);
                    setMessages([]);
                  }
                } catch (err) {
                  toast({ title: 'Xóa cuộc trò chuyện thất bại', description: String(err), variant: 'destructive' });
                } finally {
                  setShowDeleteThreadModal(false);
                  setThreadToDelete(null);
                }
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgentChat;


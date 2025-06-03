import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, X, Plus, Paperclip, 
  ListPlus, Book
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Agent, ChatTask, ChatMessage, Task as ApiTaskType, Workspace, ApiMessage } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { getAgentById, createThread, getWorkspace, checkThreadExists, sendMessageToThread, getThreadMessages, getAgentTasks, executeTask } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatInput from '@/components/ChatInput';

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

interface TaskWithInputs extends ApiTaskType {
  // inputs?: TaskInput[]; // Không dùng inputs theo cấu trúc mock data nữa
  title?: string; // Giữ lại vì UI dùng title
  name: string;
  task_type: string;
  execution_config: ExecutionConfig; // Sử dụng kiểu mới
  credit_cost: number;
  category: string;
  is_system_task: boolean;
  // Thêm các trường khác từ API response nếu cần (creator_id, created_at, updated_at, webhook_url)
  creator_id?: string;
  created_at?: string;
  updated_at?: string;
  webhook_url?: string;
}

interface Message {
  type: string;
  thread_id: string;
  content: string;
  timestamp: string;
  sender_type: "user" | "agent";
  sender_user_id: string;
}

const AgentChat = () => {
  const { theme } = useTheme();
  const { agentId } = useParams<{ agentId: string }>();
  const [message, setMessage] = useState('');
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // New state for sending message loading
  const [currentThread, setCurrentThread] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  
  const [isAgentThinking, setIsAgentThinking] = useState(false); // New state for agent thinking indicator

  // State mới để lưu tasks được fetch từ API
  const [tasks, setTasks] = useState<TaskWithInputs[]>([]); // Khởi tạo rỗng, sẽ fetch data

  const [messages, setMessages] = useState<ChatMessage[]>([
    // Initial message, will be added after agent data is fetched
  ]);

  // State mới để lưu trữ các log trạng thái từ WebSocket
  const [taskLogs, setTaskLogs] = useState<string[]>([]);
  // State để đóng/mở vùng log
  const [showTaskLogs, setShowTaskLogs] = useState(true);
  // State để xác định đã submit task thành công gần nhất chưa
  const [taskJustSubmitted, setTaskJustSubmitted] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null); // Ref to store WebSocket instance
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const [inputAreaMode, setInputAreaMode] = useState<'chat' | 'promptList'>('chat');
  const [aboveInputContent, setAboveInputContent] = useState<'none' | 'taskList' | 'taskInputs' | 'knowledge' >('none');

  const [selectedTaskInputs, setSelectedTaskInputs] = useState<{[key: string]: string}>({});

  // State mới để theo dõi trạng thái thực thi của từng task: taskId -> 'idle' | 'loading' | 'success' | 'error'
  const [taskExecutionStatus, setTaskExecutionStatus] = useState<{[taskId: string]: 'idle' | 'loading' | 'success' | 'error'}>({});

  // Ref để theo dõi trạng thái thực thi của từng task: taskId -> 'idle' | 'loading' | 'success' | 'error'
  const taskExecutionStatusRef = useRef<{[taskId: string]: 'idle' | 'loading' | 'success' | 'error'}>({});

  // Ref để theo dõi ID của tin nhắn agent đang được stream/chunk
  const lastAgentMessageIdRef = useRef<string | null>(null);

  // Clean up interval on component unmount (now handled by WS cleanup)
  useEffect(() => {
    // This useEffect will now be for WebSocket connection
    if (currentThread) {
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      if (!token) {
        console.error("Authentication token not found.");
        return;
      }

      const wsUrl = `ws://localhost:3000/ws?token=${token}&thread_id=${currentThread}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket Connected", { threadId: currentThread });
      };

      ws.current.onmessage = (event) => {
        console.warn("Received WebSocket data (WARN).");
        console.log("RAW WebSocket Data Received:", event.data);
        try {
          const receivedData: Message = JSON.parse(event.data);
          console.log("Parsed WebSocket Data:", receivedData);
          console.log("Message Type:", receivedData.type);
      
          // Kiểm tra type của tin nhắn
          if (receivedData.type === "chat") {
            console.log("Received chat message:", receivedData);

            // Xử lý tin nhắn từ Agent (dạng chunk)
            if (receivedData.sender_type === "agent") {
              setMessages(prevMessages => {
                const lastAgentMessageId = lastAgentMessageIdRef.current;
                const lastAgentMessageIndex = prevMessages.findIndex(msg => msg.id === lastAgentMessageId);

                // Nếu đang nhận chunk cho tin nhắn cũ (ID khớp) HOẶC tin nhắn cuối cùng trong state là từ agent và chưa có ID ref (trường hợp mới bắt đầu hoặc lỗi ref)
                const isAppending = lastAgentMessageId !== null && lastAgentMessageIndex !== -1;
                const isPotentialStart = lastAgentMessageIndex === -1 && prevMessages.length > 0 && prevMessages[prevMessages.length - 1].sender === 'agent';

                if (isAppending || isPotentialStart) {
                   // Nối nội dung vào tin nhắn cuối cùng của agent
                   const updatedMessages = [...prevMessages];
                   const targetIndex = isAppending ? lastAgentMessageIndex : prevMessages.length - 1; // Append vào tin nhắn có ID ref HOẶC tin nhắn cuối nếu chưa có ID ref
                   updatedMessages[targetIndex].content += receivedData.content;
                   // Cập nhật timestamp có thể giúp sắp xếp nếu cần
                   updatedMessages[targetIndex].timestamp = receivedData.timestamp;

                   // Cập nhật ID ref nếu là lần đầu nối hoặc ID ref bị mất
                   if (lastAgentMessageId === null) {
                      lastAgentMessageIdRef.current = updatedMessages[targetIndex].id;
                   }

                   console.log("Appending to agent message:", updatedMessages[targetIndex].id);
                   return updatedMessages;
                } else {
                  // Bắt đầu tin nhắn agent mới
                  const newChatMessage: ChatMessage = {
                    id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`, // Tạo ID mới cho tin nhắn bắt đầu
                    content: receivedData.content,
                    sender: receivedData.sender_type,
                    timestamp: receivedData.timestamp,
                    agentId: receivedData.sender_user_id,
                  };
                  lastAgentMessageIdRef.current = newChatMessage.id; // Lưu ID của tin nhắn agent mới
                  console.log("Starting new agent message:", newChatMessage.id);
                  return [...prevMessages, newChatMessage];
                }
              });
              // Dừng hiển thị "Agent is typing..." chỉ khi nhận được chunk cuối hoặc tín hiệu done
              // setIsAgentThinking(false);

            // Xử lý tin nhắn từ User (đã được thêm vào state ngay khi gửi)
            } else if (receivedData.sender_type === "user") {
              // Nếu backend echo lại tin nhắn user, chúng ta bỏ qua vì đã thêm vào UI ngay khi gửi
              // Có thể thêm logic kiểm tra ID hoặc content để chắc chắn là echo và không phải tin nhắn từ user khác (nếu hỗ trợ multi-user)
               console.log("Received user message (potential echo), checking...");
                setMessages(prevMessages => {
                  const isEcho = prevMessages.some(msg =>
                     msg.sender === 'user' &&
                     msg.content === receivedData.content &&
                     // Kiểm tra timestamp hoặc một ID duy nhất nếu backend gửi để phân biệt echo
                     // Hiện tại chỉ so sánh content và sender
                     new Date(msg.timestamp).getTime() >= new Date(receivedData.timestamp).getTime() - 1000 // Giả định timestamp frontend ~ server
                  );

                  if (isEcho) {
                     console.log("Skipping user message echo:", receivedData);
                     return prevMessages; // Bỏ qua echo
                  } else {
                     // Đây có thể là tin nhắn từ user khác trong multi-user chat (cần thêm logic kiểm tra user ID)
                     console.log("Received user message (likely from another user or non-echo):", receivedData);
                      const newChatMessage: ChatMessage = {
                          id: receivedData.thread_id + ":" + receivedData.timestamp + ":" + receivedData.sender_user_id + ":" + Math.random(), // Tạo ID dựa trên thông tin nhận được
                          content: receivedData.content,
                          sender: receivedData.sender_type,
                          timestamp: receivedData.timestamp,
                          agentId: receivedData.sender_user_id, // agentId sẽ là sender_user_id cho tin nhắn user từ backend
                      };
                      return [...prevMessages, newChatMessage]; // Thêm tin nhắn từ user khác
                  }
                });

            }

          } else if (receivedData.type === "typing") {
             console.log("Received typing indicator:", receivedData);
             if (receivedData.sender_type === "agent") {
                console.log("Setting isAgentThinking to true");
                setIsAgentThinking(true);
             } else {
               // TODO: Handle user typing indicator if needed and backend sends user ID
             }

          } else if (receivedData.type === "done") {
             console.log("Received done indicator for agent message.", receivedData);
             lastAgentMessageIdRef.current = null; // Kết thúc chuỗi chunking
             setIsAgentThinking(false); // Tắt trạng thái typing khi nhận done (nếu backend gửi sau typing)

          // Xử lý tin nhắn type "status"
          } else if (receivedData.type === "status") {
             console.log("Received status message:", receivedData); // Log khi nhận được tin nhắn status
             console.log("Appending status log to UI:", receivedData.content); // Log xác nhận thêm vào state
             setTaskLogs(logs => [...logs, receivedData.content]); // Thêm nội dung vào state taskLogs

          } else {
            console.log("Received unhandled message type:", receivedData.type, receivedData);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
          console.error("Raw WebSocket data that caused error:", event.data);
        }
      };
  
      ws.current.onclose = (event) => {
        console.log("WebSocket Disconnected. Code:", event.code, "Reason:", event.reason, "Was Clean:", event.wasClean);
      };
  
      ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        // console.error("WebSocket Error Event:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
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
          }

          // Get agent information
          const agentData = await getAgentById(agentId);
          setCurrentAgent(agentData.data);

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
          let threadCheck: { exists: boolean, thread_id?: string } | null = null;
          
          if (currentWorkspaceId && agentData.data) { // Ensure we have workspace and agent data
            threadCheck = await checkThreadExists(agentId, currentWorkspaceId);
            
            if (threadCheck.exists && threadCheck.thread_id) { // Also check if thread_id is provided
              threadId = threadCheck.thread_id; // Use existing thread ID
              // Fetch existing messages for the thread
              try {
                const messagesResponse = await getThreadMessages(threadId);
                // Map API response (ApiMessage[]) to ChatMessage type and sort
                const formattedMessages: ChatMessage[] = messagesResponse.data.map(msg => ({
                    id: msg.id,
                    content: msg.message_content,
                    sender: msg.sender_type,
                    timestamp: msg.created_at,
                    agentId: msg.sender_agent_id
                })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                setMessages(formattedMessages);

              } catch (fetchError) {
                console.error('Error fetching initial messages:', fetchError);
                // Decide how to handle fetch error - maybe proceed without history or show error message
              }
            } else {
              // Create new thread (only if check returns exists: false or thread_id is missing)
              const threadData = {
                agent_id: agentId,
                workspace_id: currentWorkspaceId,
                title: ""
              };
              const threadResponse = await createThread(threadData);
              threadId = threadResponse.data.id;

              // Add initial welcome message for a new thread
              // This message is created on the frontend, so timestamp format should be fine
              const welcomeMessage: ChatMessage = {
                id: Date.now().toString(),
                content: 'Hello! How can I help you?',
                sender: 'agent',
                timestamp: new Date().toISOString(), // Use ISO string for frontend message
                agentId: agentData.data.agent.id
              };
              // Add welcome message after fetching history (for new thread)
              // Note: If getThreadMessages for a new thread returns an empty array, this will be the first message
              setMessages(prev => [...prev, welcomeMessage]);
            }
          }

          setCurrentThread(threadId);
          console.log("Thread ID set to:", threadId);

          // After threadId is set (old or new), load message history
          if (threadId) {
             try {
               const messagesResponse = await getThreadMessages(threadId);
               // Map API response (ApiMessage[]) to ChatMessage type and sort
               const formattedMessages: ChatMessage[] = messagesResponse.data.map(msg => ({
                   id: msg.id,
                   content: msg.message_content,
                   sender: msg.sender_type,
                   timestamp: msg.created_at,
                   agentId: msg.sender_agent_id
               })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

               setMessages(formattedMessages);

             } catch (fetchError) {
               console.error('Error fetching initial messages:', fetchError); // Updated error message
               // Decide how to handle fetch error - maybe proceed without history or show error message
             }
          }

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

      const userMessage: ChatMessage = {
        id: Date.now().toString(), // Temporary ID
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        // agentId is not applicable for user message sent from frontend
      };

      // Thêm tin nhắn của người dùng vào state ngay lập tức để cập nhật UI
      setMessages(prev => [...prev, userMessage]);
      setMessage('');

      try {
        // ** Thay thế gọi API REST bằng gửi qua WebSocket **
        const messageToSend = {
          type: "chat", // Loại tin nhắn
          thread_id: currentThread, // ID của thread
          content: userMessage.content, // Nội dung tin nhắn
          // timestamp: userMessage.timestamp, // Có thể gửi timestamp từ frontend nếu backend cần
          sender_type: userMessage.sender, // Loại người gửi (user)
          // TODO: Lấy SenderUserID thực tế từ thông tin người dùng đã login
          sender_user_id: "current_user_placeholder_id", // Placeholder cho UserID
        };

        ws.current?.send(JSON.stringify(messageToSend)); // Gửi tin nhắn qua WebSocket

        // Trạng thái sending và thinking sẽ được quản lý bởi tin nhắn WebSocket phản hồi (typing/chat)
        setIsSending(false);
        // setIsAgentThinking(true); // Bật trạng thái typing tạm thời hoặc chờ tín hiệu từ backend

      } catch (error) {
        console.error('Error sending message via WebSocket:', error);
        setIsSending(false);
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
  
  const handleTaskSelect = (task: TaskWithInputs) => {
    setSelectedTaskId(task.id);
    setAboveInputContent('taskInputs');
    // Khởi tạo selectedTaskInputs với giá trị mặc định từ execution_config
    const initialInputs: {[key: string]: string} = {};
    if (task.execution_config) {
      Object.keys(task.execution_config).forEach(key => {
         initialInputs[key] = task.execution_config[key] || ''; // Dùng giá trị từ config hoặc rỗng
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

  const handleSubmitTaskInputs = async () => {
    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    if (selectedTask && currentThread) {
      setTaskExecutionStatus(prev => ({ ...prev, [selectedTask.id]: 'loading' }));
      // Mở vùng log khi submit
      setShowTaskLogs(true);
      setTaskJustSubmitted(false);
      try {
        console.log('Executing task...', selectedTask.name, 'with inputs:', selectedTaskInputs, 'thread:', currentThread);
        const response = await executeTask(selectedTask.id, selectedTaskInputs, currentThread);
        if (response.status === 200 || response.message === 'Task execution started') {
          console.log('Task initiated/executed successfully:', response);
          setTaskExecutionStatus(prev => ({ ...prev, [selectedTask.id]: 'success' }));
          setTaskJustSubmitted(true); // Đánh dấu đã submit thành công
        } else {
          console.warn('Task execution failed:', response);
          setTaskExecutionStatus(prev => ({ ...prev, [selectedTask.id]: 'error' }));
          setTaskJustSubmitted(false);
        }
      } catch (error) {
        console.error('Error executing task:', error);
        setTaskExecutionStatus(prev => ({ ...prev, [selectedTask.id]: 'error' }));
        setTaskJustSubmitted(false);
      }
      setAboveInputContent('none');
      setTimeout(() => {
        setTaskExecutionStatus(prev => ({ ...prev, [selectedTask.id]: 'idle' }));
      }, 5000);
    }
  };

  const handleActionClick = (action: 'screenshot' | 'text' | 'modify' | 'diagram' | 'prototype') => {
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

  // Handler for daily task button click
  const handleDailyTaskClick = () => {
    navigate(`/dashboard/agents/${agentId}/task/config`);
  };

  const { t } = useLanguage();

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r bg-card flex flex-col">
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
            {/* Agent Selection / Header in Sidebar */}
            <div className="p-4 border-b flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentAgent?.agent?.avatar} alt={currentAgent?.agent?.name || 'Agent'} />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {currentAgent?.agent?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{currentAgent?.agent?.name || 'Agent'}</h2>
                <p className="text-xs text-muted-foreground">{currentAgent?.agent?.type || 'AI Assistant'}</p>
              </div>
            </div>
            {/* New Chat Button */}
            <div className="p-4 border-b">
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New chat</span>
              </Button>
            </div>
            {/* Chat History List (Placeholder) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* Map through chat history here */}
              <div className="p-3 rounded-lg hover:bg-muted cursor-pointer">
                 <p className="text-sm font-medium">Chat with {currentAgent?.agent?.name}</p>
                 <p className="text-xs text-muted-foreground truncate">Last message preview...</p>
              </div>
               {/* Example of another chat item */}
              <div className="p-3 rounded-lg hover:bg-muted cursor-pointer">
                  <p className="text-sm font-medium">Previous Chat</p>
                 <p className="text-xs text-muted-foreground truncate">Another message preview...</p>
              </div>
               {/* Add more chat items as needed */}
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
            <div
              ref={chatContainerRef}
              className={cn(
                "flex-1 p-3 md:p-4 overflow-y-auto space-y-4 md:space-y-5 bg-background",
                aboveInputContent !== 'none' ? 'pb-[200px]' : 'pb-[120px]'
              )}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    cn(
                      "flex items-start",
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    )
                  }
                >
                  {msg.sender === 'agent' && (
                    <Avatar className="h-8 w-8 md:h-9 md:w-9 mr-2">
                       <AvatarImage src={currentAgent?.agent?.avatar} alt={currentAgent?.agent?.name || 'Agent'} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                         {currentAgent?.agent?.name?.charAt(0) || 'A'}
                       </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    "max-w-[70%] p-3 rounded-lg shadow-md break-words whitespace-pre-wrap",
                    getMessageStyle(msg.sender)
                  )}>
                    {msg.sender === 'agent' ? (
                       <div className="chat-message">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                       </div>
                    ) : (
                       <p>{msg.content}</p>
                    )}
                    <span className="text-xs mt-1 opacity-80 block text-right text-foreground/60">
                      {/* Check if date is valid before formatting */}
                      {new Date(msg.timestamp).toString() !== 'Invalid Date'
                        ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : msg.timestamp}
                    </span>
                  </div>
                  {msg.sender === 'user' && (
                    <Avatar className="h-8 w-8 md:h-9 md:w-9 ml-2">
                       {/* User avatar image if available */}
                      <AvatarFallback className="bg-primary text-primary-foreground">
                         {/* User initial or fallback */}
                         {/* Replace with actual user initial/fallback logic */}
                         U
                       </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Agent Thinking Indicator */}
              {isAgentThinking && (
                <div className="flex items-start justify-start">
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 mr-2">
                           <AvatarImage src={currentAgent?.agent?.avatar} alt={currentAgent?.agent?.name || 'Agent'} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                             {currentAgent?.agent?.name?.charAt(0) || 'A'}
                     </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                          "max-w-[70%] p-3 rounded-lg shadow-md break-words whitespace-pre-wrap",
                          getMessageStyle('agent')
                  )}>
                    <p>Agent is typing...</p>
                  </div>
                </div>
              )}

              {/* Vùng hiển thị Task Logs */}
              <div className="mt-4">
                <button
                  className="mb-2 px-3 py-1 rounded bg-muted text-xs hover:bg-muted/80 border border-border"
                  onClick={() => setShowTaskLogs(v => !v)}
                >
                  {showTaskLogs ? 'Ẩn log' : 'Hiện log'}
                </button>
                {showTaskLogs && taskLogs.length > 0 && (
                  <div className="p-3 border border-border rounded-lg bg-card text-card-foreground text-sm overflow-y-auto max-h-[200px]">
                    <h4 className="font-semibold mb-2">Task Logs:</h4>
                    <div className="space-y-2">
                      {taskLogs.map((log, index) => {
                        let parsed: any = null;
                        try {
                          parsed = typeof log === 'string' ? JSON.parse(log) : log;
                        } catch {
                          parsed = null;
                        }
                        if (parsed && typeof parsed === 'object') {
                          return (
                            <div key={index} className="p-2 rounded bg-muted/50">
                              <div className="font-medium">
                                {parsed.message && <span>{parsed.message}</span>}
                                {parsed.status && (
                                  <span className={
                                    parsed.status === 'completed' ? 'text-green-600 ml-2' :
                                    parsed.status === 'processing' ? 'text-yellow-600 ml-2' :
                                    parsed.status === 'error' ? 'text-red-600 ml-2' : 'ml-2'
                                  }>
                                    [{parsed.status}]
                                  </span>
                                )}
                              </div>
                              {parsed.response && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  <span>Response: </span>
                                  <span>{typeof parsed.response === 'string' ? parsed.response : JSON.stringify(parsed.response)}</span>
                                </div>
                              )}
                              {parsed.task_id && (
                                <div className="text-xs text-muted-foreground">Task ID: {parsed.task_id}</div>
                              )}
                            </div>
                          );
                        } else {
                          return <p key={index} className="text-muted-foreground">{log}</p>;
                        }
                      })}
                    </div>
                    {/* Nút Schedule Daily Task nằm trong card log */}
                    {taskJustSubmitted && (
                      <div className="flex justify-start mt-4">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2 text-sm"
                          onClick={handleDailyTaskClick}
                        >
                          <ListPlus className="h-4 w-4" />
                          Schedule Daily Task
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Area above the main input for Tasks/Knowledge */}
            <div className="p-3 md:p-4 bg-background">
               {/* Task List or Task Inputs */}
               {aboveInputContent === 'taskList' && (
                 <div className="mb-3 p-2 border border-border rounded-lg bg-card text-card-foreground max-h-60 overflow-y-auto">
                   <h3 className="text-lg font-semibold mb-2 text-foreground">Tasks</h3>
                   <div className="space-y-2">
                     {tasks.map((task) => (
                       <Button
                         key={task.id}
                         variant="outline"
                         className="w-full justify-start border-border"
                         onClick={() => handleTaskSelect(task)}
                       >
                         {/* Chỉ báo trạng thái thực thi task */}
                         {taskExecutionStatus[task.id] === 'loading' && (
                            <span className="loading-spinner mr-2 w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"></span>
                         )}
                         {taskExecutionStatus[task.id] === 'success' && (
                            <span className="text-green-500 mr-2">✓</span> // Icon thành công
                         )}
                         {taskExecutionStatus[task.id] === 'error' && (
                            <span className="text-red-500 mr-2">✗</span> // Icon thất bại
                         )}
                         {task.name}
                       </Button>
                     ))}
                   </div>
                   <Button variant="outline" className="w-full border-border mt-2" onClick={() => setAboveInputContent('none')}>Close Tasks</Button>
                 </div>
               )}

               {aboveInputContent === 'taskInputs' && selectedTask && (
                 <div className="mb-3 space-y-3 p-2 border border-border rounded-lg bg-card text-card-foreground max-h-60 overflow-y-auto">
                   <h3 className="text-lg font-semibold text-foreground">{selectedTask.name} Inputs</h3> {/* Sử dụng task.name hoặc title */}
                   {/* Render inputs dựa trên execution_config */}
                   {Object.entries(selectedTask.execution_config).map(([key, defaultValue]) => (
                     <div key={key} className="space-y-1">
                       {/* Sử dụng key làm label và input id */}
                       <label htmlFor={key} className="text-sm font-medium text-foreground">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label> {/* Tự động tạo label từ key */}
                       {/* Hiện tại mặc định là text input, có thể cần logic để xác định type input (text, number, select) nếu execution_config cung cấp info này */}
                         <Input
                           id={key}
                           type="text" // Mặc định là text, cần logic phức tạp hơn nếu có các type khác
                           value={selectedTaskInputs[key] || ''} // Lấy giá trị từ state selectedTaskInputs
                           onChange={(e) => handleInputChange(key, e.target.value)}
                           placeholder={`Enter ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).toLowerCase()}`}
                           className="bg-background text-card-foreground border-border"
                         />
                     </div>
                   ))}
                   <Button onClick={handleSubmitTaskInputs} className="teampal-button w-full">Submit Task</Button>
                   <Button variant="outline" className="w-full border-border" onClick={() => setAboveInputContent('taskList')}>Back to Tasks</Button>
                 </div>
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

               {/* Main Input Area Structure */}
               <ChatInput
                 message={message}
                 setMessage={setMessage}
                 handleSendMessage={handleSendMessage}
                 isSending={isSending}
                 handleKeyDown={handleKeyDown}
                 t={t}
                 aboveInputContent={aboveInputContent}
                 setAboveInputContent={setAboveInputContent}
               />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentChat;

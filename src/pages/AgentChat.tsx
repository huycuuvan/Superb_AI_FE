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
import { getAgentById, createThread, getWorkspace, checkThreadExists, sendMessageToThread, getThreadMessages } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskInput {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  required?: boolean;
}

// Define a more specific type for execution_config
interface ExecutionConfig {
  [key: string]: any; // TODO: Specify a more specific type
}

interface TaskWithInputs extends ApiTaskType {
  inputs?: TaskInput[];
  title?: string;
  name: string;
  task_type: string;
  execution_config: ExecutionConfig; // Use the new interface
  credit_cost: number;
  category: string;
  is_system_task: boolean;
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

  const [tasks, setTasks] = useState<TaskWithInputs[]>([
    { 
      id: 'design', 
      title: 'Tạo thiết kế từ văn bản', 
      description: 'Nhập mô tả để tạo thiết kế giao diện.',
      inputs: [
        { id: 'height', label: 'Chiều cao (px)', type: 'number', required: true },
        { id: 'width', label: 'Chiều rộng (px)', type: 'number', required: true },
        { id: 'style', label: 'Phong cách', type: 'select', options: ['Minimal', 'Modern', 'Vintage', 'Professional'], required: true },
        { id: 'description', label: 'Mô tả chi tiết', type: 'text', required: true }
      ],
      name: 'Tạo thiết kế',
      task_type: 'design',
      execution_config: {},
      credit_cost: 10,
      category: 'Design',
      is_system_task: false,
    },
    { 
      id: '1', 
      title: 'Suggest upselling strategies', 
      description: 'Đề xuất các chiến lược bán thêm cho khách hàng hiện tại.',
      inputs: [
        { id: 'customerType', label: 'Loại khách hàng', type: 'select', options: ['Cá nhân', 'Doanh nghiệp', 'Tổ chức'], required: true },
        { id: 'budget', label: 'Ngân sách', type: 'number', required: true },
        { id: 'preferences', label: 'Sở thích', type: 'text', required: true }
      ],
      name: 'Suggest upselling strategies',
      task_type: 'sales',
      execution_config: {},
      credit_cost: 5,
      category: 'Sales',
      is_system_task: false,
    },
    { 
      id: '2', 
      title: 'Generate ideas for sales promotions and discounts', 
      description: 'Tạo ý tưởng cho các chương trình khuyến mãi và giảm giá.',
      inputs: [
        { id: 'promotionType', label: 'Loại khuyến mãi', type: 'select', options: ['Giảm giá', 'Tặng quà', 'Mua 1 tặng 1', 'Khác'], required: true },
        { id: 'budget', label: 'Ngân sách', type: 'number', required: true },
        { id: 'targetAudience', label: 'Đối tượng mục tiêu', type: 'text', required: true }
      ],
      name: 'Generate ideas for sales promotions and discounts',
      task_type: 'sales',
      execution_config: {},
      credit_cost: 5,
      category: 'Sales',
      is_system_task: false,
    },
    { 
      id: '3', 
      title: 'Generate ideas for sales contests and incentives', 
      description: 'Tạo ý tưởng cho các cuộc thi và ưu đãi bán hàng.',
      inputs: [
        { id: 'contestType', label: 'Loại cuộc thi', type: 'select', options: ['Cá nhân', 'Nhóm', 'Phòng ban'], required: true },
        { id: 'duration', label: 'Thời gian (ngày)', type: 'number', required: true },
        { id: 'prize', label: 'Giải thưởng', type: 'text', required: true }
      ],
      name: 'Generate ideas for sales contests and incentives',
      task_type: 'sales',
      execution_config: {},
      credit_cost: 5,
      category: 'Sales',
      is_system_task: false,
    },
    { 
      id: '4', 
      title: 'Suggest cross-selling opportunities', 
      description: 'Đề xuất cơ hội bán chéo dựa trên lịch sử mua hàng.',
      inputs: [
        { id: 'productType', label: 'Loại sản phẩm', type: 'select', options: ['Điện tử', 'Thời trang', 'Nhà cửa', 'Khác'], required: true },
        { id: 'customerSegment', label: 'Phân khúc khách hàng', type: 'text', required: true },
        { id: 'budget', label: 'Ngân sách', type: 'number', required: true }
      ],
      name: 'Suggest cross-selling opportunities',
      task_type: 'sales',
      execution_config: {},
      credit_cost: 5,
      category: 'Sales',
      is_system_task: false,
    },
    { 
      id: '5', 
      title: 'Suggest strategies for handling difficult customers', 
      description: 'Đề xuất chiến lược xử lý khách hàng khó tính.',
      inputs: [
        { id: 'issueType', label: 'Loại vấn đề', type: 'select', options: ['Khiếu nại', 'Yêu cầu hoàn tiền', 'Chất lượng dịch vụ', 'Khác'], required: true },
        { id: 'customerHistory', label: 'Lịch sử khách hàng', type: 'text', required: true },
        { id: 'priority', label: 'Mức độ ưu tiên', type: 'select', options: ['Cao', 'Trung bình', 'Thấp'], required: true }
      ],
      name: 'Suggest strategies for handling difficult customers',
      task_type: 'customer_service',
      execution_config: {},
      credit_cost: 3,
      category: 'Customer Service',
      is_system_task: false,
    }
  ]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    // Initial message, will be added after agent data is fetched
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null); // Ref to store WebSocket instance
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const [inputAreaMode, setInputAreaMode] = useState<'chat' | 'promptList'>('chat');
  const [aboveInputContent, setAboveInputContent] = useState<'none' | 'taskList' | 'taskInputs' | 'knowledge' >('none');

  const [selectedTaskInputs, setSelectedTaskInputs] = useState<{[key: string]: string}>({});

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
        console.log("WebSocket Connected");
      };

      ws.current.onmessage = (event) => {
        console.log("RAW WebSocket Data Received:", event.data); // Log raw data
        try {
          const receivedData = JSON.parse(event.data);
          console.log("Parsed WebSocket Data:", receivedData);
  
          if (!receivedData.message_content && !receivedData.content) {
            console.warn("WebSocket message received without content:", receivedData);
            return; 
          }
          // Check for sender
          if (!receivedData.sender_type && !receivedData.sender) {
              console.warn("WebSocket message received without sender:", receivedData);
              return; // Skip if no sender
          }
  
          const newChatMessage: ChatMessage = {
            // Generate a more unique ID if server doesn't send one or sends an unreliable one
            id: receivedData.id || `ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            content: receivedData.message_content || receivedData.content,
            sender: receivedData.sender_type || receivedData.sender,
            timestamp: receivedData.created_at || receivedData.timestamp || new Date().toISOString(),
            agentId: receivedData.sender_agent_id || receivedData.agentId,
          };
  
          console.log("New ChatMessage object from WebSocket:", newChatMessage);
  
          setMessages(prevMessages => {
            // Check if a message with this ID already exists (to avoid duplicates if ID from server is reliable)
            if (newChatMessage.id && prevMessages.some(msg => msg.id === newChatMessage.id)) {
                console.log("Message with this ID already exists, not adding:", newChatMessage.id);
                return prevMessages;
            }
            console.log("Adding new message from WebSocket to state.");
            return [...prevMessages, newChatMessage];
          });
          setIsAgentThinking(false); // Stop thinking indicator
        } catch (error) {
          console.error("Error parsing WebSocket message or updating state:", error);
          console.error("Offending raw WebSocket data:", event.data); // Log offending data
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
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      
      try {
        await sendMessageToThread(currentThread, userMessage.content); // Use API call
        setIsSending(false); 
        setIsAgentThinking(true); // Agent starts thinking after message is sent

      } catch (error) {
        console.error('Error sending message:', error);
        setIsSending(false); 
      }

    } else if (aboveInputContent === 'knowledge') {
       console.log("Sending message with knowledge context:", selectedTaskInputs);
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
    setSelectedTaskInputs({});
  };

  const handleInputChange = (inputId: string, value: string) => {
    setSelectedTaskInputs(prev => ({
      ...prev,
      [inputId]: value
    }));
  };

  const handleSubmitTaskInputs = () => {
    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    if (selectedTask) {
      const inputValues = Object.entries(selectedTaskInputs)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      setMessage(`${selectedTask.title}\n${inputValues}`);
      setAboveInputContent('none');
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


  const promptSuggestions = [
    "Show me the temperature today",
    "Why does it rain",
    "Do you feel different because of weather",
    "What kind of clouds are there",
    "What is the weather forecast for the next five days in my area, including high and low temperatures"
  ];

  const handlePromptSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setInputAreaMode('chat');
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
            {/* Sidebar Footer (Optional) */}
            {/* <div className="p-4 border-t">
              <p className="text-xs text-muted-foreground text-center">Sidebar Footer</p>
            </div> */}
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
                    <p>{msg.content}</p>
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

              {/* Daily Timer Button (Keep this within the main chat area) */}
              {messages.length > 0 && messages[messages.length - 1].sender === 'agent' && ( // Only show if the last message is from the agent
                <div className="flex justify-start mt-2">
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
                         {task.title}
                       </Button>
                     ))}
                   </div>
                   <Button variant="outline" className="w-full border-border mt-2" onClick={() => setAboveInputContent('none')}>Close Tasks</Button>
                 </div>
               )}

               {aboveInputContent === 'taskInputs' && selectedTask && (
                 <div className="mb-3 space-y-3 p-2 border border-border rounded-lg bg-card text-card-foreground max-h-60 overflow-y-auto">
                   <h3 className="text-lg font-semibold text-foreground">{selectedTask.title} Inputs</h3>
                   {selectedTask.inputs.map((input) => (
                     <div key={input.id} className="space-y-1">
                       <label htmlFor={input.id} className="text-sm font-medium text-foreground">{input.label}</label>
                       {input.type === 'select' ? (
                         <Select
                           value={selectedTaskInputs[input.id] || ''}
                           onValueChange={(value) => handleInputChange(input.id, value)}
                         >
                           <SelectTrigger className="bg-background text-card-foreground border-border">
                             <SelectValue placeholder={`Select ${input.label.toLowerCase()}`} />
                           </SelectTrigger>
                           <SelectContent>
                             {input.options?.map((option) => (
                               <SelectItem key={option} value={option}>
                                 {option}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       ) : (
                         <Input
                           id={input.id}
                           type={input.type}
                           value={selectedTaskInputs[input.id] || ''}
                           onChange={(e) => handleInputChange(input.id, e.target.value)}
                           placeholder={`Enter ${input.label.toLowerCase()}`}
                           className="bg-background text-card-foreground border-border"
                         />
                       )}
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
               <div className="flex flex-col space-y-2 p-4 border border-border rounded-lg bg-card text-card-foreground md:max-w-[800px] mx-auto">
                 {/* Textarea Row */}
                 <div className="flex items-center space-x-2 md:space-x-3 flex-grow">
                    <Textarea
                      placeholder={t('askAI')}
                      className="flex-1 resize-none min-h-[48px] pr-10 bg-transparent text-card-foreground border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      style={{ overflowY: 'hidden', height: 'auto' }}
                    />

                 </div>

                 {/* Tool Buttons and Send Button Row with Descriptions */}
                 <div className="flex items-center space-x-2 pt-2 justify-between">
                    <div className="flex items-center space-x-4">
                       {/* Knowledge Button with Description */}
                       <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1 rounded-full border-border text-foreground hover:bg-muted"
                          onClick={() => setAboveInputContent(aboveInputContent === 'knowledge' ? 'none' : 'knowledge')}
                       >
                          <Book className="h-4 w-4" />
                          <span className="text-sm">Knowledge</span>
                       </Button>

                       {/* Task Button with Description */}
                       <Button
                          variant="outline"
                           size="sm"
                          className="flex items-center space-x-1 rounded-full border-border text-foreground hover:bg-muted"
                          onClick={() => setAboveInputContent(aboveInputContent === 'taskList' ? 'none' : 'taskList')}
                       >
                          <ListPlus className="h-4 w-4" />
                          <span className="text-sm">Task</span>
                       </Button>

                       {/* Attach File Button with Description */}
                       <Button
                          variant="outline"
                           size="sm"
                          className="flex items-center space-x-1 rounded-full border-border text-foreground hover:bg-muted"
                       >
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">Attach file</span>
                       </Button>
                    </div>

                    {/* Send Button (Moved to the second row) */}
                    <Button type="submit" size="icon" className="flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSendMessage} disabled={!message.trim() || isSending || !currentThread}> {/* Disable if message is empty or sending or no thread */}
                      {isSending ? <span className="loading-spinner"></span> : <Send className="h-4 w-4" />} {/* Show spinner when sending */}
                    </Button>
                 </div>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentChat;

import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, X, Plus, Paperclip, 
  ListPlus, CheckCircle2, Camera, Edit, Share2, SlidersHorizontal, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Agent, ChatTask, ChatMessage, Task as ApiTaskType } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAgentById } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { getTasksByAgentId } from '@/services/taskService';
import { Label } from '@/components/ui/label';

interface TaskInput {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  required?: boolean;
}

interface TaskWithInputs extends ApiTaskType {
  inputs?: TaskInput[];
  title?: string;
  name: string;
}

const AgentChat = () => {
  const { theme } = useTheme();
  const { agentId } = useParams<{ agentId: string }>();
  const [message, setMessage] = useState('');
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [tasks, setTasks] = useState<TaskWithInputs[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    // Initial message, will be added after agent data is fetched
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const [inputAreaMode, setInputAreaMode] = useState<'chat' | 'taskList' | 'promptList' | 'taskInputs'>('chat');

  const [selectedTaskInputs, setSelectedTaskInputs] = useState<{[key: string]: string}>({});
  const [showTaskInputModal, setShowTaskInputModal] = useState(false);

  // Fetch agent data
  useEffect(() => {
    const fetchAgent = async () => {
      if (agentId) {
        setLoadingAgent(true);
        try {
          const response = await getAgentById(agentId);
          setCurrentAgent(response.data);
          // Add initial agent message after fetching agent data
          setMessages([
            {
              id: '1',
              content: `Hello! I'm ${response.data?.name}, ${response.data?.instructions}`,
              sender: 'agent',
              timestamp: new Date().toISOString(),
              agentId: response.data?.id
            }
          ]);
        } catch (err) {
          console.error('Error fetching agent:', err);
          setCurrentAgent(null);
          // Optionally set an error state to display to the user
        } finally {
          setLoadingAgent(false);
        }
      } else {
        setCurrentAgent(null);
        setLoadingAgent(false);
         // Handle case where agentId is not in URL
        console.error('Agent ID not found in URL');
      }
    };

    fetchAgent();
  }, [agentId]);

  // Fetch tasks for the agent
  useEffect(() => {
    const fetchTasks = async () => {
      if (agentId) {
        setLoadingTasks(true);
        try {
          const response = await getTasksByAgentId(agentId);
          // We might need to map the response data to TaskWithInputs if their structures differ significantly
          // For now, casting directly and assuming basic fields like id, title/name, description exist.
          setTasks(response.data.map(task => ({ ...task, inputs: [] })) as TaskWithInputs[]);
        } catch (err) {
          console.error('Error fetching tasks:', err);
          setTasks([]); // Clear tasks on error
        } finally {
          setLoadingTasks(false);
        }
      } else {
        setTasks([]); // Clear tasks if no agentId
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [agentId]); // Fetch tasks whenever agentId changes

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Simulate agent response after a delay
      setTimeout(() => {
        const agentResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'Cảm ơn bạn đã liên hệ với tôi! Tôi sẽ hỗ trợ bạn ngay lập tức. Bạn cần hỗ trợ gì hôm nay?',
          sender: 'agent',
          timestamp: new Date().toISOString(),
          agentId: currentAgent?.id
        };
        
        setMessages(prev => [...prev, agentResponse]);
      }, 1000);
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
    setInputAreaMode('taskInputs');
    setShowTaskInputModal(true);
    setSelectedTaskInputs({});
    // TODO: Cần cập nhật logic này để xử lý FormFields từ API (task.execution_config?.form_fields)
    // Khởi tạo selectedTaskInputs dựa trên task.execution_config?.form_fields nếu có
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
      // TODO: Gửi thông tin task và input lên API thay vì chỉ hiển thị trong chat
      // Tạo payload dựa trên selectedTask.task_type, selectedTask.id và selectedTaskInputs
      const inputValues = Object.entries(selectedTaskInputs)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      setMessage(`${selectedTask.title || selectedTask.name}\n${inputValues}`);
      setInputAreaMode('chat');
      setShowTaskInputModal(false);
    }
  };

  const handleActionClick = (action: 'screenshot' | 'text' | 'modify' | 'diagram' | 'prototype') => {
    // This function is no longer used in this layout
  };

  // Get appropriate colors based on theme
  const getMessageStyle = (sender: string) => {
    if (sender === 'user') {
      if (theme === 'teampal-pink') return 'bg-teampal-100 text-foreground';
      if (theme === 'blue') return 'bg-blue-100 text-foreground';
      if (theme === 'purple') return 'bg-purple-100 text-foreground';
      return 'bg-accent text-foreground';
    } else {
      if (theme === 'teampal-pink') return 'bg-white border shadow-sm';
      if (theme === 'blue') return 'bg-white border shadow-sm';
      if (theme === 'purple') return 'bg-white border shadow-sm';
      return 'bg-white border shadow-sm';
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
    // Navigate to daily task view or open a modal
    // navigate('/daily-tasks');
  };

  // Giả lập dữ liệu lịch sử chat
  const chatHistory = [
    { id: '1', title: 'Tra cứu thời tiết', lastMessage: 'Nhiệt độ hôm nay là 30°C', time: '10:00' },
    { id: '2', title: 'Tư vấn AI', lastMessage: 'Bạn cần gì về AI?', time: '11:00' },
    { id: '3', title: 'Hỏi đáp chung', lastMessage: 'Xin chào, tôi có thể giúp gì?', time: '12:00' },
  ];

  // Render loading state for agent
  if (loadingAgent) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Skeleton className="w-12 h-12 rounded-full mb-4" />
        <Skeleton className="w-48 h-6 mb-2" />
        <Skeleton className="w-64 h-4" />
      </div>
    );
  }

  // Render not found state if agent is null
  if (!currentAgent) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Agent not found</h1>
        <p className="text-muted-foreground">The requested agent could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-full w-full" style={{height: '100vh'}}>
      {/* Khu vực chat chính */}
      <div className="flex flex-col flex-1 h-full">
        {/* Agent Header */}
        <div className={`flex items-center justify-between p-4 border-b ${theme === 'teampal-pink' ? 'bg-teampal-50' : 'bg-secondary'}`}>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
              <AvatarFallback className="bg-teampal-100 text-teampal-500">{currentAgent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{currentAgent.name}</h2>
              <p className="text-sm text-muted-foreground">{currentAgent.type}</p>
            </div>
          </div>
          {/* Agent actions */}
          <div className="flex gap-2">
            <Button variant="ghost" size="icon"><Edit className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Share2 className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><SlidersHorizontal className="h-5 w-5" /></Button>
          </div>
        </div>

        {/* Chat area */}
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-background">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
                  <AvatarFallback className="bg-teampal-100 text-teampal-500">{currentAgent.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`p-3 rounded-lg max-w-xs break-words ${getMessageStyle(msg.sender)}`}>
                {msg.content}
                <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'} text-muted-foreground`}>
                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
               {msg.sender === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-800">You</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t bg-background flex-shrink-0">
          {
            inputAreaMode === 'chat' && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setInputAreaMode('taskList')}>
                  <ListPlus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setInputAreaMode('promptList')}>
                   <MessageSquare className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Ask AI anything..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()} className="teampal-button">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            )
          }
          {
            inputAreaMode === 'taskList' && (
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Chọn Task</h3>
                  <Button variant="ghost" size="icon" onClick={() => setInputAreaMode('chat')}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {loadingTasks ? (
                  <div className="text-center text-muted-foreground">Đang tải tasks...</div>
                ) : tasks.length === 0 ? (
                   <div className="text-center text-muted-foreground">Không tìm thấy tasks nào cho agent này.</div>
                ) : (
                  <div className="mb-2 p-2 border rounded-lg bg-background max-h-[30vh] overflow-y-auto">
                    {tasks.map((task) => (
                      <div 
                        key={task.id}
                        className="p-2 hover:bg-accent cursor-pointer rounded-md"
                        onClick={() => handleTaskSelect(task)}
                      >
                        <div className="font-medium">{task.title || task.name}</div>
                        {task.description && <div className="text-sm text-muted-foreground">{task.description}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          }
           {
            inputAreaMode === 'promptList' && (
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Gợi ý Prompt</h3>
                  <Button variant="ghost" size="icon" onClick={() => setInputAreaMode('chat')}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                 <div className="mb-2 p-2 border rounded-lg bg-background max-h-[30vh] overflow-y-auto space-y-2">
                   {promptSuggestions.map((suggestion, index) => (
                     <div 
                       key={index}
                       className="p-2 hover:bg-accent cursor-pointer rounded-md text-sm text-muted-foreground"
                       onClick={() => handlePromptSuggestionClick(suggestion)}
                     >
                       {suggestion}
                     </div>
                   ))}
                 </div>
              </div>
            )
          }
        </div>
        {/* Task Input Modal */}
        {showTaskInputModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{selectedTask.title || selectedTask.name}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowTaskInputModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-muted-foreground mb-4">{selectedTask.description}</p>
              <div className="space-y-4">
                {selectedTask.inputs?.map(input => (
                  <div key={input.id}>
                    <Label htmlFor={input.id}>{input.label}</Label>
                    {input.type === 'text' && (
                      <Input
                        id={input.id}
                        value={selectedTaskInputs[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        required={input.required}
                      />
                    )}
                    {input.type === 'number' && (
                      <Input
                        id={input.id}
                        type="number"
                        value={selectedTaskInputs[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        required={input.required}
                      />
                    )}
                    {input.type === 'select' && input.options && (
                       <Select 
                         value={selectedTaskInputs[input.id] || ''}
                         onValueChange={(value) => handleInputChange(input.id, value)}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder={`Select ${input.label}`} />
                         </SelectTrigger>
                         <SelectContent>
                           {input.options.map(option => (
                             <SelectItem key={option} value={option}>{option}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowTaskInputModal(false)}>Cancel</Button>
                <Button onClick={handleSubmitTaskInputs}>Submit Task</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Cột lịch sử chat bên phải */}
      <div className="w-72 border-l bg-white h-full flex flex-col">
        <div className="p-4 border-b font-semibold text-lg">Lịch sử chat</div>
        <div className="flex-1 overflow-y-auto">
          {chatHistory.map((item) => (
            <div key={item.id} className="p-4 border-b hover:bg-accent cursor-pointer">
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-muted-foreground truncate">{item.lastMessage}</div>
              <div className="text-xs text-muted-foreground">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentChat;

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
import { Agent, ChatTask, ChatMessage, Task as ApiTaskType } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

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
  const [currentAgent, setCurrentAgent] = useState(agents.find(agent => agent.id === agentId));
  const [tasks, setTasks] = useState<TaskWithInputs[]>([
    { 
      id: 'design', 
      title: 'Tạo thiết kế từ văn bản', 
      completed: false, 
      description: 'Nhập mô tả để tạo thiết kế giao diện.',
      inputs: [
        { id: 'height', label: 'Chiều cao (px)', type: 'number', required: true },
        { id: 'width', label: 'Chiều rộng (px)', type: 'number', required: true },
        { id: 'style', label: 'Phong cách', type: 'select', options: ['Minimal', 'Modern', 'Vintage', 'Professional'], required: true },
        { id: 'description', label: 'Mô tả chi tiết', type: 'text', required: true }
      ]
    },
    { 
      id: '1', 
      title: 'Suggest upselling strategies', 
      completed: false, 
      description: 'Đề xuất các chiến lược bán thêm cho khách hàng hiện tại.',
      inputs: [
        { id: 'customerType', label: 'Loại khách hàng', type: 'select', options: ['Cá nhân', 'Doanh nghiệp', 'Tổ chức'], required: true },
        { id: 'budget', label: 'Ngân sách', type: 'number', required: true },
        { id: 'preferences', label: 'Sở thích', type: 'text', required: true }
      ]
    },
    { 
      id: '2', 
      title: 'Generate ideas for sales promotions and discounts', 
      completed: false, 
      description: 'Tạo ý tưởng cho các chương trình khuyến mãi và giảm giá.',
      inputs: [
        { id: 'promotionType', label: 'Loại khuyến mãi', type: 'select', options: ['Giảm giá', 'Tặng quà', 'Mua 1 tặng 1', 'Khác'], required: true },
        { id: 'budget', label: 'Ngân sách', type: 'number', required: true },
        { id: 'targetAudience', label: 'Đối tượng mục tiêu', type: 'text', required: true }
      ]
    },
    { 
      id: '3', 
      title: 'Generate ideas for sales contests and incentives', 
      completed: false, 
      description: 'Tạo ý tưởng cho các cuộc thi và ưu đãi bán hàng.',
      inputs: [
        { id: 'contestType', label: 'Loại cuộc thi', type: 'select', options: ['Cá nhân', 'Nhóm', 'Phòng ban'], required: true },
        { id: 'duration', label: 'Thời gian (ngày)', type: 'number', required: true },
        { id: 'prize', label: 'Giải thưởng', type: 'text', required: true }
      ]
    },
    { 
      id: '4', 
      title: 'Suggest cross-selling opportunities', 
      completed: false, 
      description: 'Đề xuất cơ hội bán chéo dựa trên lịch sử mua hàng.',
      inputs: [
        { id: 'productType', label: 'Loại sản phẩm', type: 'select', options: ['Điện tử', 'Thời trang', 'Nhà cửa', 'Khác'], required: true },
        { id: 'customerSegment', label: 'Phân khúc khách hàng', type: 'text', required: true },
        { id: 'budget', label: 'Ngân sách', type: 'number', required: true }
      ]
    },
    { 
      id: '5', 
      title: 'Suggest strategies for handling difficult customers', 
      completed: false, 
      description: 'Đề xuất chiến lược xử lý khách hàng khó tính.',
      inputs: [
        { id: 'issueType', label: 'Loại vấn đề', type: 'select', options: ['Khiếu nại', 'Yêu cầu hoàn tiền', 'Chất lượng dịch vụ', 'Khác'], required: true },
        { id: 'customerHistory', label: 'Lịch sử khách hàng', type: 'text', required: true },
        { id: 'priority', label: 'Mức độ ưu tiên', type: 'select', options: ['Cao', 'Trung bình', 'Thấp'], required: true }
      ]
    }
  ]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    // Initial message, will be added after agent data is fetched
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const [inputAreaMode, setInputAreaMode] = useState<'chat' | 'promptList'>('chat');
  const [aboveInputContent, setAboveInputContent] = useState<'none' | 'taskList' | 'taskInputs' | 'knowledge' >('none');

  const [selectedTaskInputs, setSelectedTaskInputs] = useState<{[key: string]: string}>({});

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
    } else if (aboveInputContent === 'knowledge') {
       // Handle sending message with knowledge files if implemented
       console.log("Sending message with knowledge context:", selectedTaskInputs);
       // Clear message and knowledge selection after sending
       setMessage('');
       setAboveInputContent('none'); // Hide knowledge selection
       // Add logic to actually send message with selected files
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
      setMessage(`${selectedTask.title}\n${inputValues}`);
      setAboveInputContent('none');
    }
  };

  const handleActionClick = (action: 'screenshot' | 'text' | 'modify' | 'diagram' | 'prototype') => {
    // This function is no longer used in this layout
  };

  // Get appropriate colors based on theme
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
        {/* Agent Selection / Header in Sidebar */}
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
             <p className="text-sm font-medium">Chat with {currentAgent?.name}</p>
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
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
         {/* Agent header (moved to sidebar) */}
         {/* <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 border-b bg-background">
           <Avatar className="h-10 w-10 md:h-12 md:w-12">
             <AvatarImage src={currentAgent?.avatar} alt={currentAgent?.name || 'Agent'} />
             <AvatarFallback className="bg-secondary text-secondary-foreground">
               {currentAgent?.name?.charAt(0) || 'A'}
             </AvatarFallback>
           </Avatar>
           <div>
             <h1 className="text-lg md:text-xl font-semibold text-foreground">{currentAgent?.name || 'Agent'}</h1>
             <p className="text-xs md:text-sm text-muted-foreground">{currentAgent?.type || 'AI Assistant'}</p>
           </div>
         </div> */}

        {/* Chat area */}
        <div
          ref={chatContainerRef}
          className={cn(
            "flex-1 p-3 md:p-4 overflow-y-auto space-y-4 md:space-y-5 bg-background",
            aboveInputContent !== 'none' ? 'pb-[200px]' : 'pb-[120px]' // Adjust padding based on whether content is above input
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
                   <AvatarImage src={currentAgent?.avatar} alt={currentAgent?.name || 'Agent'} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                     {currentAgent?.name?.charAt(0) || 'A'}
                   </AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                "max-w-[70%] p-3 rounded-lg shadow-md break-words whitespace-pre-wrap",
                getMessageStyle(msg.sender)
              )}>
                <p>{msg.content}</p>
                <span className="text-xs mt-1 opacity-80 block text-right text-foreground/60">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

          {/* Daily Timer Button (Keep this within the main chat area) */}
          {messages.length > 0 && messages[messages.length - 1].sender === 'agent' && ( // Only show if the last message is from the agent
            <div className="flex justify-start mt-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-sm"
                onClick={handleDailyTaskClick}
              >
                <ListPlus className="h-4 w-4" />
                Hẹn giờ hằng ngày
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
                         <SelectValue placeholder={`Chọn ${input.label.toLowerCase()}`} />
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
                       placeholder={`Nhập ${input.label.toLowerCase()}`}
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
                <Button type="submit" size="icon" className="flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;

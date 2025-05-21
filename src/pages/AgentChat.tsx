import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Send, X, Plus, Paperclip, 
  ListPlus, CheckCircle2, Camera, Edit, Share2, SlidersHorizontal, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { agents } from '@/services/mockData';
import { ChatTask, ChatMessage } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

interface TaskInput {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  required?: boolean;
}

interface TaskWithInputs extends ChatTask {
  inputs: TaskInput[];
}

const AgentChat = () => {
  const { theme } = useTheme();
  const { agentId } = useParams<{ agentId: string }>();
  const [message, setMessage] = useState('');
  const [showTaskPopup, setShowTaskPopup] = useState(false);
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
    {
      id: '1',
      content: `Xin chào! Tôi là ${currentAgent?.name}, Quản lý kinh doanh tại AI Automation, sẵn sàng hỗ trợ bạn trong mọi vấn đề liên quan đến giải pháp tự động hóa AI. Tôi có thể giúp bạn xây dựng chiến lược kinh doanh, tối ưu hóa hiệu suất và giải đáp mọi thắc mắc liên quan đến AI. Dù bạn là doanh nghiệp hay khách hàng thành viên, tôi luôn ở đây để đảm bảo bạn có trải nghiệm tốt nhất. Hãy cho tôi biết tôi có thể trợ giúp cho bạn hôm nay như thế nào!`,
      sender: 'agent',
      timestamp: new Date().toISOString(),
      agentId: currentAgent?.id
    }
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const [inputAreaMode, setInputAreaMode] = useState<'chat' | 'taskList' | 'promptList' | 'taskInputs'>('chat');

  const [selectedTaskInputs, setSelectedTaskInputs] = useState<{[key: string]: string}>({});
  const [showTaskInputModal, setShowTaskInputModal] = useState(false);

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
    navigate(`/dashboard/agents/${agentId}/task/config`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      {/* Agent header */}
      <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 border-b">
        <Avatar className="h-10 w-10 md:h-12 md:w-12">
          <AvatarImage src={currentAgent?.avatar} alt={currentAgent?.name || 'Agent'} />
          <AvatarFallback className="bg-teampal-100 text-teampal-500">
            {currentAgent?.name?.charAt(0) || 'A'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg md:text-xl font-semibold">{currentAgent?.name || 'Agent'}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">{currentAgent?.type || 'AI Assistant'}</p>
        </div>
      </div>
      
      {/* Chat area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 p-3 md:p-4 overflow-y-auto space-y-4 md:space-y-5 bg-accent/30"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-3/4 ${getMessageStyle(msg.sender)} rounded-lg p-2 md:p-3 text-sm md:text-base shadow-sm`}>
              {msg.sender === 'agent' && (
                <div className="flex items-center space-x-2 mb-1">
                  <Avatar className="h-6 w-6 md:h-7 md:w-7">
                    <AvatarImage src={currentAgent?.avatar} alt={currentAgent?.name || 'Agent'} />
                    <AvatarFallback className="bg-teampal-100 text-teampal-500 text-xs md:text-sm">
                      {currentAgent?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-xs md:text-sm">{currentAgent?.name}</span>
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm md:text-base">{msg.content}</p>
              <div className="text-[10px] md:text-xs text-muted-foreground mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}

        {/* Daily Timer Button */}
        {messages.length > 0 && messages[messages.length - 1].sender === 'agent' && (
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
      
      {/* Input area */}
      <div className="p-3 md:p-4 border-t bg-background">
        {/* Task and Prompt buttons */}
        <div className="flex gap-2 mb-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setInputAreaMode(inputAreaMode === 'taskList' ? 'chat' : 'taskList')}
          >
            <ListPlus className="h-4 w-4" />
            Task
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setInputAreaMode(inputAreaMode === 'promptList' ? 'chat' : 'promptList')}
          >
            <MessageSquare className="h-4 w-4" />
            Prompt
          </Button>
        </div>

        {/* Conditional Content Area (Task List, Prompt List, or Task Input Form) */}
        {inputAreaMode === 'taskList' && (
          <div className="mb-2 p-2 border rounded-lg bg-background max-h-40 overflow-y-auto">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className="p-2 hover:bg-accent cursor-pointer rounded-md"
                onClick={() => handleTaskSelect(task)}
              >
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-muted-foreground">{task.description}</div>
              </div>
            ))}
          </div>
        )}

        {inputAreaMode === 'promptList' && (
          <div className="mb-2 p-2 border rounded-lg bg-background max-h-40 overflow-y-auto">
            {promptSuggestions.map((prompt, index) => (
              <div 
                key={index}
                className="p-2 hover:bg-accent cursor-pointer rounded-md"
                onClick={() => {
                  setMessage(prompt);
                  setInputAreaMode('chat');
                }}
              >
                {prompt}
              </div>
            ))}
          </div>
        )}

        {/* Input chat */}
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-2 w-full">
             {/* Input Textarea */}
            <div className="relative flex-1">
              <Textarea
                className="flex-1 text-sm pr-16 min-h-[50px] max-h-[400px] resize-none"
                placeholder="Ask AI anything..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {/* Icons inside textarea */}
              <div className="absolute bottom-2 right-2 flex gap-2">
                {/* <ListPlus className="h-5 w-5 text-muted-foreground cursor-pointer" /> */}
                {/* <SlidersHorizontal className="h-5 w-5 text-muted-foreground cursor-pointer" /> */}
              </div>
            </div>
            {/* Send Button */}
            <Button className="bg-teampal-500 h-9 md:h-10 px-3 md:px-4 flex-shrink-0" onClick={handleSendMessage}>
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Task Input Modal */}
      {showTaskInputModal && selectedTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-auto p-4 bg-background rounded-lg shadow-lg">
            {/* Close button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2"
              onClick={() => setShowTaskInputModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">{tasks.find(t => t.id === selectedTaskId)?.title}</h3>
              <p className="text-sm text-muted-foreground">{tasks.find(t => t.id === selectedTaskId)?.description}</p>
            </div>
            <div className="space-y-3">
              {tasks.find(t => t.id === selectedTaskId)?.inputs.map((input) => (
                <div key={input.id} className="space-y-1">
                  <label className="text-sm font-medium">{input.label}</label>
                  {input.type === 'select' ? (
                    <Select
                      value={selectedTaskInputs[input.id] || ''}
                      onValueChange={(value) => handleInputChange(input.id, value)}
                    >
                      <SelectTrigger>
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
                      type={input.type}
                      value={selectedTaskInputs[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      placeholder={`Nhập ${input.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowTaskInputModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmitTaskInputs}>
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentChat;

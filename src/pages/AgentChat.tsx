import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Send, X, Plus, Paperclip, 
  ListPlus, CheckCircle2 
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

const AgentChat = () => {
  const { theme } = useTheme();
  const { agentId } = useParams<{ agentId: string }>();
  const [message, setMessage] = useState('');
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(agents.find(agent => agent.id === agentId));
  const [tasks, setTasks] = useState<ChatTask[]>([
    { id: '1', title: 'Suggest upselling strategies for existing customers', completed: false, description: 'Đề xuất các chiến lược bán thêm cho khách hàng hiện tại.' },
    { id: '2', title: 'Generate ideas for sales promotions and discounts', completed: false, description: 'Tạo ý tưởng cho các chương trình khuyến mãi và giảm giá.' },
    { id: '3', title: 'Generate ideas for sales contests and incentives', completed: false, description: 'Tạo ý tưởng cho các cuộc thi và ưu đãi bán hàng.' },
    { id: '4', title: 'Suggest cross-selling opportunities based on purchase history', completed: false, description: 'Đề xuất cơ hội bán chéo dựa trên lịch sử mua hàng.' },
    { id: '5', title: 'Suggest strategies for handling difficult customers', completed: false, description: 'Đề xuất chiến lược xử lý khách hàng khó tính.' }
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
  
  const handleTaskSelect = (taskId: string) => {
    // Add task to message input
    const selectedTask = tasks.find(task => task.id === taskId);
    if (selectedTask) {
      setMessage(selectedTask.title);
    }
    setShowTaskPopup(false);
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

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      {/* Agent header */}
      <div className="flex items-center space-x-4 p-4 border-b">
        <Avatar className="h-12 w-12">
          <AvatarImage src={currentAgent?.avatar} alt={currentAgent?.name || 'Agent'} />
          <AvatarFallback className="bg-teampal-100 text-teampal-500">
            {currentAgent?.name?.charAt(0) || 'A'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">{currentAgent?.name || 'Agent'}</h1>
          <p className="text-sm text-muted-foreground">{currentAgent?.type || 'AI Assistant'}</p>
        </div>
      </div>
      
      {/* Chat area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 bg-accent/30"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3/4 ${getMessageStyle(msg.sender)} rounded-lg p-3`}>
              {msg.sender === 'agent' && (
                <div className="flex items-center space-x-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={currentAgent?.avatar} alt={currentAgent?.name || 'Agent'} />
                    <AvatarFallback className="bg-teampal-100 text-teampal-500 text-xs">
                      {currentAgent?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{currentAgent?.name}</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Task droplist và input động */}
      <div className="p-4 border-t bg-background">
        <div className="mb-4 flex items-center gap-4">
          <Select value={selectedTaskId || ''} onValueChange={setSelectedTaskId}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Chọn Task" />
            </SelectTrigger>
            <SelectContent>
              {tasks.map(task => (
                <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTask && (
            <div className="flex flex-col gap-2 ml-4 w-full max-w-xl">
              <Input
                placeholder="Tiêu đề task"
                value={selectedTask.title}
                readOnly
              />
              {/* Có thể thêm các input động khác ở đây, ví dụ: mô tả, ngày hết hạn... */}
              <Textarea placeholder="Mô tả task (demo)" value={selectedTask.description || ''} readOnly />
              {/* Nếu muốn cho phép nhập, bỏ readOnly và thêm state */}
            </div>
          )}
        </div>
        {/* Input chat ... giữ nguyên */}
        <div className="flex items-center gap-2">
          <Input
            className="flex-1"
            placeholder="Nhập tin nhắn của bạn..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button className="bg-teampal-500" onClick={handleSendMessage}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;

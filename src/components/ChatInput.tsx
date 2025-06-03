import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Book, ListPlus, Paperclip, Send } from 'lucide-react';

interface ChatInputProps {
  message: string;
  setMessage: (msg: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  t: (key: string) => string;
  aboveInputContent: 'none' | 'taskList' | 'taskInputs' | 'knowledge';
  setAboveInputContent: (v: 'none' | 'taskList' | 'taskInputs' | 'knowledge') => void;
}

const ChatInput: React.FC<ChatInputProps> = React.memo(({
  message,
  setMessage,
  handleSendMessage,
  isSending,
  handleKeyDown,
  t,
  aboveInputContent,
  setAboveInputContent,
}) => {
  return (
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
        {/* Send Button */}
        <Button type="submit" size="icon" className="flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSendMessage} disabled={!message.trim() || isSending}>
          {isSending ? <span className="loading-spinner"></span> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
});

export default ChatInput; 
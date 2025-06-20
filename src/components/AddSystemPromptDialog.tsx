import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Agent } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { createSystemPrompt } from '@/services/api';

interface AddSystemPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: Agent | null;
  onSuccess?: () => void;
}

export const AddSystemPromptDialog = ({ 
  open, 
  onOpenChange, 
  agent, 
  onSuccess 
}: AddSystemPromptDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState('System Prompt Template');
  const [description, setDescription] = useState('System prompt cho AI agent');
  const [templateContent, setTemplateContent] = useState('Bạn là {{.agent.name}}, trợ lý AI của {{.workspace.brandName}}.');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!agent?.id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin agent",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createSystemPrompt({
        agent_id: agent.id,
        name,
        description,
        template_content: templateContent,
        category: 'system',
        template_type: 'system_prompt',
        is_featured: true,
        order_index: 1
      });

      toast({
        title: "Thành công!",
        description: "System prompt đã được tạo thành công.",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating system prompt:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo system prompt. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo System Prompt</DialogTitle>
          <DialogDescription>
            Tạo system prompt cho agent "{agent?.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prompt-name" className="text-right">
              Tên
            </Label>
            <Input
              id="prompt-name"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prompt-description" className="text-right">
              Mô tả
            </Label>
            <Input
              id="prompt-description"
              className="col-span-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template-content" className="text-right">
              Nội dung
            </Label>
            <Textarea
              id="template-content"
              className="col-span-3"
              rows={5}
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Tạo System Prompt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
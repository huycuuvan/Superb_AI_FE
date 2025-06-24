import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Agent } from '@/types';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { PromptTemplate, getPromptTemplatesByAgent, renderPromptTemplate } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';


interface PromptTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  onSelectPrompt?: (renderedPrompt: string) => void;
}

export const PromptTemplatesModal = ({
  open,
  onOpenChange,
  agent,
  onSelectPrompt
}: PromptTemplatesModalProps) => {
  const { toast } = useToast();
  const { workspace } = useSelectedWorkspace();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [renderedContent, setRenderedContent] = useState('');
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (open && agent?.id) {
      loadTemplates();
    }
  }, [open, agent?.id]);

  const loadTemplates = async () => {
    if (!agent?.id) return;
    
    setIsLoading(true);
    try {
      const response = await getPromptTemplatesByAgent(agent.id);
      setTemplates(response.data || []);
      
      // Auto-select the first template if available
      if (response.data && response.data.length > 0) {
        handleSelectTemplate(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading prompt templates:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải mẫu prompt. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = async (template: PromptTemplate) => {
    if (!agent?.id || !workspace?.id) return;
    
    setSelectedTemplate(template);
    setIsRendering(true);
    
    try {
      const response = await renderPromptTemplate(template.id, {
        agent_id: agent.id,
        workspace_id: workspace.id
      });
      
      setRenderedContent(response.rendered_content);
    } catch (error) {
      console.error('Error rendering prompt template:', error);
      toast({
        title: "Lỗi",
        description: "Không thể render mẫu prompt. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsRendering(false);
    }
  };

  const handleUsePrompt = () => {
    if (onSelectPrompt && renderedContent) {
      onSelectPrompt(renderedContent);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] p-0 border border-border">
        <DialogHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">Mẫu prompt gợi ý</DialogTitle>
        
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Chọn một mẫu prompt để sử dụng với agent "{agent?.name}".
          </p>
        </DialogHeader>
        
        <div className="flex h-[500px]">
          {/* Template list */}
          <div className="w-1/3 border-r border-gray-800">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-gray-800" />
                  ))}
                </div>
              ) : templates.length > 0 ? (
                <div>
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="ghost"
                      className={`w-full justify-start text-left h-auto py-3 px-4 rounded-none border-l-4 ${
                        selectedTemplate?.id === template.id 
                          ? 'bg-blue-900/30 border-l-blue-500 text-blue-400' 
                          : 'border-l-transparent text-gray-300 hover:bg-gray-800/50'
                      }`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-gray-400">
                  Không có mẫu prompt nào cho agent này
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Template preview */}
          <div className="w-2/3 p-4 flex flex-col">
            {selectedTemplate ? (
              <>
                <div className="mb-2 font-medium text-lg">{selectedTemplate.name}</div>
                <div className="text-sm text-gray-400 mb-4">{selectedTemplate.description}</div>
                <Textarea
                  className="flex-1 min-h-[300px] bg-gray-900/50 border-gray-700 text-gray-200 resize-none focus-visible:ring-blue-500"
                  value={isRendering ? "Đang tải nội dung..." : renderedContent}
                  readOnly
                  disabled={isRendering}
                />
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={handleUsePrompt}
                    disabled={!renderedContent || isRendering}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Sử dụng prompt này
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Chọn một mẫu prompt để xem chi tiết
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
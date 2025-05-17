import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const AddAgentDialog = ({ open: openProp, onOpenChange, folderId }: { open?: boolean, onOpenChange?: (open: boolean) => void, folderId?: string }) => {
  const { t } = useLanguage();
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = onOpenChange ? onOpenChange : setInternalOpen;

  const handleCreateAgent = () => {
    if (agentName.trim() && agentType) {
      console.log('Creating agent:', { name: agentName, type: agentType, description: agentDescription, folderId });
      // In a real app, this would save the agent kèm folderId
    }
    setAgentName('');
    setAgentType('');
    setAgentDescription('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <UserPlus className="h-[1rem] w-[1rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addAgent')}</DialogTitle>
          <DialogDescription>
            {t('createAgent')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent-name" className="text-right">
              Name
            </Label>
            <Input
              id="agent-name"
              className="col-span-3"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent-type" className="text-right">
              Type
            </Label>
            <Select onValueChange={setAgentType} value={agentType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectItem value="customer-service">Customer Service</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="agent-description"
              className="col-span-3"
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleCreateAgent} disabled={!agentName.trim() || !agentType}>
            {t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

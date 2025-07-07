import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import {
  PromptTemplate,
  getAllPromptTemplates,
  createSystemPrompt,
  getAgents,
  updatePromptTemplate,
  deletePromptTemplate,
} from '@/services/api';
import { Agent } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

// Danh sách biến động và mô tả
const PROMPT_VARIABLES = [
  // Agent
  { label: 'Tên agent', value: '{{.agent.name}}', desc: 'Tên agent' },
  { label: 'Loại agent', value: '{{.agent.type}}', desc: 'Loại agent' },
  { label: 'Vai trò agent', value: '{{.agent.roleDescription}}', desc: 'Vai trò agent' },
  { label: 'Vị trí agent', value: '{{.agent.position}}', desc: 'Vị trí agent' },
  { label: 'Mô tả công việc', value: '{{.agent.jobBrief}}', desc: 'Mô tả công việc agent' },
  { label: 'Ngôn ngữ agent', value: '{{.agent.language}}', desc: 'Ngôn ngữ agent' },
  // Workspace
  { label: 'Tên workspace', value: '{{.workspace.name}}', desc: 'Tên workspace' },
  { label: 'ID workspace', value: '{{.workspace.id}}', desc: 'ID workspace' },
  // User
  { label: 'Tên user', value: '{{.user.name}}', desc: 'Tên người dùng hiện tại' },
  { label: 'Email user', value: '{{.user.email}}', desc: 'Email người dùng hiện tại' },
  // Workspace profile
  { label: 'Tên thương hiệu', value: '{{.workspace.brandName}}', desc: 'Tên thương hiệu (brand name)' },
  { label: 'Loại hình kinh doanh', value: '{{.workspace.businessType}}', desc: 'Loại hình kinh doanh' },
  { label: 'Mô tả thương hiệu', value: '{{.workspace.description}}', desc: 'Mô tả thương hiệu' },
  { label: 'Sản phẩm/dịch vụ', value: '{{.workspace.productsServices}}', desc: 'Sản phẩm/dịch vụ' },
  { label: 'Website', value: '{{.workspace.websiteURL}}', desc: 'Website' },
  { label: 'Logo URL', value: '{{.workspace.logoURL}}', desc: 'Logo URL' },
  { label: 'Ngôn ngữ mặc định', value: '{{.workspace.defaultLanguage}}', desc: 'Ngôn ngữ mặc định' },
  { label: 'Địa điểm mặc định', value: '{{.workspace.defaultLocation}}', desc: 'Địa điểm mặc định' },
];

// Hàm chèn biến vào vị trí con trỏ
function insertAtCursor(ref, value, setValue) {
  const textarea = ref.current;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const newText = text.slice(0, start) + value + text.slice(end);
  setValue(newText);
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + value.length;
  }, 0);
}

// Hàm chuyển đổi loại template sang tiếng Việt
function getTemplateTypeLabel(type: string) {
  if (type === 'system_prompt') return 'System Prompt';
  if (type === 'user_prompt') return 'User Prompt';
  return type;
}

// Helper lấy category string an toàn
function getCategoryString(category: unknown): string {
  if (category && typeof category === 'object' && category !== null && 'String' in category) {
    return String((category as { String: string }).String);
  }
  return category ? String(category) : '';
}

export default function PromptTemplatesPage() {
  const { user } = useAuth();
  const { workspace } = useSelectedWorkspace();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    name: '',
    description: '',
    template_content: '',
    category: 'system',
    template_type: 'user_prompt',
    is_featured: true,
    order_index: 1,
    agent_id: '',
  });
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);

  // State for edit modal
  const [editPrompt, setEditPrompt] = useState<PromptTemplate | null>(null);
  const [editPromptData, setEditPromptData] = useState({
    name: '',
    description: '',
    template_content: '',
    category: '',
    template_type: '',
    is_featured: false,
    order_index: 1,
    agent_id: '',
  });
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Thêm ref cho textarea
  const addPromptTextareaRef = useRef(null);
  const editPromptTextareaRef = useRef(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user && workspace?.id && (user.role === 'admin' || user.role === 'super_admin')) {
      fetchTemplates();
      fetchAgents();
    }
    // eslint-disable-next-line
  }, [user, workspace?.id, page]);

  // Chỉ cho phép admin
  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <div className="p-8 text-center text-lg text-muted-foreground">Chỉ admin mới được truy cập trang này.</div>;
  }

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const res = await getAllPromptTemplates(pageSize, offset);
      setTemplates(Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []));
      setTotalPages(res.total_pages || 1);
    } catch (e) {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách prompt', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await getAgents(1, 100);
      // Fix: lấy đúng mảng agents từ res.data.data
      const agentArr = (res.data && Array.isArray(res.data.data)) ? res.data.data : [];
      setAgents(agentArr.map((a: Agent) => ({ id: String(a.id), name: a.name })));
    } catch (e) {
      setAgents([]);
    }
  };

  const getAgentName = (agent_id: string) => {
    const found = agents.find(a => a.id === agent_id);
    return found ? found.name : agent_id;
  };

  const handleAddPrompt = async () => {
    try {
      await createSystemPrompt({
        ...newPrompt,
        agent_id: newPrompt.agent_id,
      });
      toast({ title: 'Thành công', description: 'Đã thêm prompt mới!' });
      setShowAddDialog(false);
      setNewPrompt({
        name: '',
        description: '',
        template_content: '',
        category: 'system',
        template_type: 'user_prompt',
        is_featured: true,
        order_index: 1,
        agent_id: '',
      });
      fetchTemplates();
    } catch (e) {
      toast({ title: 'Lỗi', description: 'Không thể thêm prompt', variant: 'destructive' });
    }
  };

  // Edit modal handlers
  const openEditModal = (template: PromptTemplate) => {
    setEditPrompt(template);
    setEditPromptData({
      name: template.name,
      description: template.description,
      template_content: template.template_content,
      category: template.category,
      template_type: template.template_type,
      is_featured: template.is_featured,
      order_index: template.order_index,
      agent_id: template.agent_id,
    });
  };
  const closeEditModal = () => {
    setEditPrompt(null);
  };
  const handleEditSave = async () => {
    if (!editPrompt) return;
    setIsSavingEdit(true);
    try {
      await updatePromptTemplate(editPrompt.id, { ...editPromptData });
      toast({ title: 'Thành công', description: 'Đã cập nhật prompt!' });
      closeEditModal();
      fetchTemplates();
    } catch (e) {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật prompt', variant: 'destructive' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete modal handlers
  const openDeleteModal = (id: string) => setShowDeleteId(id);
  const closeDeleteModal = () => setShowDeleteId(null);
  const handleDelete = async () => {
    if (!showDeleteId) return;
    setIsDeleting(true);
    try {
      await deletePromptTemplate(showDeleteId);
      toast({ title: 'Thành công', description: 'Đã xóa prompt!' });
      closeDeleteModal();
      fetchTemplates();
    } catch (e) {
      toast({ title: 'Lỗi', description: 'Không thể xóa prompt', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý Prompt Templates</h1>
        <Button onClick={() => setShowAddDialog(true)}>Thêm prompt mới</Button>
      </div>
      <div className="grid gap-4">
        {isLoading ? (
          <div>Đang tải...</div>
        ) : templates.length === 0 ? (
          <div className="text-muted-foreground">Chưa có prompt nào.</div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-primary/90 text-white font-bold text-sm rounded-t-xl">
                  <th className="px-3 py-2 text-left">Tên</th>
                  <th className="px-3 py-2 text-left">Agent</th>
                  <th className="px-3 py-2 text-left">Loại</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">Ngày tạo</th>
                  <th className="px-3 py-2 text-left">Ngày cập nhật</th>
                  <th className="px-3 py-2 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template, idx) => (
                  <tr
                    key={template.id}
                    className={
                      `border-b border-border transition-colors ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/60'} hover:bg-primary/10`
                    }
                  >
                    <td className="px-3 py-2 font-semibold max-w-[180px] truncate">{template.name}</td>
                    <td className="px-3 py-2 max-w-[140px] truncate">{getAgentName(template.agent_id)}</td>
                    <td className="px-3 py-2">{getTemplateTypeLabel(template.template_type)}</td>
                    <td className="px-3 py-2 max-w-[120px] truncate">{getCategoryString(template.category)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(template.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(template.updated_at).toLocaleString()}</td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => openEditModal(template)} title="Sửa">
                          <span className="sr-only">Sửa</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.414 1.414-4.243a4 4 0 01.828-1.414z" /></svg>
                        </Button>
                        <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => openDeleteModal(template.id)} title="Xóa">
                          <span className="sr-only">Xóa</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    href="#"
                    isActive={page === idx + 1}
                    onClick={e => { e.preventDefault(); setPage(idx + 1); }}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          </>
        )}
      </div>

      {/* Add Prompt Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog} >
        <DialogContent className="overflow-y-auto no-scrollbar max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Thêm Prompt Template mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 no-scrollbar ">
            <div >
              <Label htmlFor="add-name">Tên prompt</Label>
              <Input id="add-name" placeholder="Tên" value={newPrompt.name} onChange={e => setNewPrompt(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="add-desc">Mô tả</Label>
              <Input id="add-desc" placeholder="Mô tả" value={newPrompt.description} onChange={e => setNewPrompt(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="add-content">Nội dung prompt</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="secondary" type="button" tabIndex={-1} className="ml-2">
                      <Sparkles className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 max-h-72 overflow-y-auto p-2 space-y-2">
                    <TooltipProvider delayDuration={100}>
                      {PROMPT_VARIABLES.map(v => (
                        <Tooltip key={v.value}>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="ghost" className="w-full justify-start" type="button" onClick={() => { insertAtCursor(addPromptTextareaRef, v.value, val => setNewPrompt(p => ({ ...p, template_content: val }))); }}>
                              {v.label}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{v.desc}</TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </PopoverContent>
                </Popover>
              </div>
              <Textarea
                id="add-content"
                ref={addPromptTextareaRef}
                placeholder="Nội dung prompt"
                value={newPrompt.template_content}
                onChange={e => setNewPrompt(p => ({ ...p, template_content: e.target.value }))}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="add-category">Danh mục (Category)</Label>
              <Input id="add-category" placeholder="Category" value={newPrompt.category} onChange={e => setNewPrompt(p => ({ ...p, category: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="add-type">Loại template (Template Type)</Label>
              <Select value={newPrompt.template_type} onValueChange={val => setNewPrompt(p => ({ ...p, template_type: val }))}>
                <SelectTrigger id="add-type">
                  <SelectValue placeholder="Chọn loại template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system_prompt">System Prompt</SelectItem>
                  <SelectItem value="user_prompt">User Prompt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="add-agent">Chọn Agent</Label>
              <Select value={newPrompt.agent_id} onValueChange={val => setNewPrompt(p => ({ ...p, agent_id: val }))}>
                <SelectTrigger id="add-agent">
                  <SelectValue placeholder="Chọn agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="add-order">Thứ tự (Order Index)</Label>
              <Input id="add-order" type="number" placeholder="Order Index" value={newPrompt.order_index} onChange={e => setNewPrompt(p => ({ ...p, order_index: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Hủy</Button>
            <Button onClick={handleAddPrompt}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Prompt Dialog */}
      <Dialog open={!!editPrompt} onOpenChange={closeEditModal} >
        <DialogContent className="overflow-y-auto no-scrollbar max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Chỉnh sửa Prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-name">Tên prompt</Label>
              <Input id="edit-name" placeholder="Tên" value={editPromptData.name} onChange={e => setEditPromptData(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-desc">Mô tả</Label>
              <Input id="edit-desc" placeholder="Mô tả" value={editPromptData.description} onChange={e => setEditPromptData(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="edit-content">Nội dung prompt</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="secondary" type="button" tabIndex={-1} className="ml-2">
                      <Sparkles className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 max-h-72 overflow-y-auto p-2 space-y-2">
                    <TooltipProvider delayDuration={100}>
                      {PROMPT_VARIABLES.map(v => (
                        <Tooltip key={v.value}>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="ghost" className="w-full justify-start" type="button" onClick={() => { insertAtCursor(editPromptTextareaRef, v.value, val => setEditPromptData(p => ({ ...p, template_content: val }))); }}>
                              {v.label}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{v.desc}</TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </PopoverContent>
                </Popover>
              </div>
              <Textarea
                id="edit-content"
                ref={editPromptTextareaRef}
                placeholder="Nội dung prompt"
                value={editPromptData.template_content}
                onChange={e => setEditPromptData(p => ({ ...p, template_content: e.target.value }))}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Danh mục (Category)</Label>
              <Input id="edit-category" placeholder="Category" value={editPromptData.category} onChange={e => setEditPromptData(p => ({ ...p, category: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-type">Loại template (Template Type)</Label>
              <Select value={editPromptData.template_type} onValueChange={val => setEditPromptData(p => ({ ...p, template_type: val }))}>
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Chọn loại template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system_prompt">System Prompt</SelectItem>
                  <SelectItem value="user_prompt">User Prompt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-agent">Chọn Agent</Label>
              <Select value={editPromptData.agent_id} onValueChange={val => setEditPromptData(p => ({ ...p, agent_id: val }))}>
                <SelectTrigger id="edit-agent">
                  <SelectValue placeholder="Chọn agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-order">Thứ tự (Order Index)</Label>
              <Input id="edit-order" type="number" placeholder="Order Index" value={editPromptData.order_index} onChange={e => setEditPromptData(p => ({ ...p, order_index: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>Hủy</Button>
            <Button onClick={handleEditSave} disabled={isSavingEdit}>{isSavingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Prompt Dialog */}
      <Dialog open={!!showDeleteId} onOpenChange={closeDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa Prompt</DialogTitle>
          </DialogHeader>
          <div>Bạn có chắc chắn muốn xóa prompt này không?</div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Đang xóa...' : 'Xóa'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
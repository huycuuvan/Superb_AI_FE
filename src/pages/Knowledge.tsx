import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Upload, MoreVertical, Download, Trash, Eye, Edit, Filter } from 'lucide-react';
import { uploadKnowledge, listKnowledge, updateKnowledge, deleteKnowledge } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { useUniqueAgentsByFolders } from '@/hooks/useUniqueAgentsByFolders';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

interface KnowledgeItem {
  id: string;
  title: string;
  content?: string;
  status: string;
  file_url?: string;
  agent_id: string;
  workspace_id: string;
  created_at?: string;
  updated_at?: string;
  preview?: string; // Thêm trường preview
  type?: string; // Thêm trường type
  table_preview?: string; // Thêm trường table_preview
}

const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'main', label: 'Chính thức' },
  { value: 'draft', label: 'Nháp' },
];

const Knowledge: React.FC = () => {
  const { toast } = useToast();
  const { workspace } = useSelectedWorkspace();
  const { user } = useAuth();
  const { agents, isLoading: isLoadingAgents } = useUniqueAgentsByFolders();
  const navigate = useNavigate();

  // State filter
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // State knowledge
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Upload state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string>('');
  // Thêm state cho status khi upload
  const [uploadStatusValue, setUploadStatusValue] = useState<string>('main');

  // Edit state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState('main');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({ title: 'Cảnh báo', description: 'File vượt quá 10MB, vui lòng chọn file nhỏ hơn.', variant: 'destructive' });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !workspace?.id || !user) return;
    setUploadStatus('loading');
    setUploadError('');
    try {
      const agent_id = selectedAgentId || (agents[0]?.id || '');
      const res = await uploadKnowledge(selectedFile, agent_id, workspace.id, uploadStatusValue);
      if (res.success) {
        toast({ title: 'Thành công', description: 'Tải lên tri thức thành công!' });
        setShowUploadDialog(false);
        setSelectedFile(null);
        fetchKnowledge();
        setUploadStatus('success');
      } else {
        throw new Error('Upload thất bại');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setUploadError(errorMsg);
      toast({ title: 'Lỗi', description: errorMsg, variant: 'destructive' });
      setUploadStatus('error');
    }
  };

  // List
  const fetchKnowledge = async () => {
    if (!workspace?.id) return;
    setIsLoading(true);
    try {
      const params: Record<string, string> = { workspace_id: workspace.id };
      if (selectedAgentId && selectedAgentId !== 'all') params.agent_id = selectedAgentId;
      if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
      const res = await listKnowledge(params);
      if (res.success) {
        setKnowledgeList(res.data || []);
      } else {
        setKnowledgeList([]);
      }
    } catch (err) {
      setKnowledgeList([]);
      const errorMsg = err instanceof Error ? err.message : 'Không lấy được danh sách tri thức';
      toast({ title: 'Lỗi', description: errorMsg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
    // eslint-disable-next-line
  }, [workspace?.id, selectedAgentId, selectedStatus]);

  // Edit
  const openEditDialog = (item: KnowledgeItem) => {
    setEditingKnowledge(item);
    setEditTitle(item.title || '');
    setEditContent(item.content || '');
    setEditStatus(item.status || 'main');
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    if (!editingKnowledge) return;
    setIsSavingEdit(true);
    try {
      const res = await updateKnowledge({
        id: editingKnowledge.id,
        title: editTitle,
        content: editContent,
        status: editStatus,
      });
      if (res.success) {
        toast({ title: 'Thành công', description: 'Cập nhật tri thức thành công!' });
        setShowEditDialog(false);
        setEditingKnowledge(null);
        fetchKnowledge();
      } else {
        throw new Error('Cập nhật thất bại');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Cập nhật thất bại';
      toast({ title: 'Lỗi', description: errorMsg, variant: 'destructive' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setIsDeleting(true);
    try {
      const res = await deleteKnowledge(id);
      if (res.success) {
        toast({ title: 'Thành công', description: 'Xóa tri thức thành công!' });
        fetchKnowledge();
      } else {
        throw new Error('Xóa thất bại');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Xóa thất bại';
      toast({ title: 'Lỗi', description: errorMsg, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  // Download (mock)
  const handleDownload = (item: KnowledgeItem) => {
    if (item.file_url) {
      window.open(item.file_url, '_blank');
    } else {
      toast({ title: 'Chưa hỗ trợ tải file này', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 bg-background text-foreground">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý tri thức</h1>
          <p className="text-sm text-muted-foreground mt-1">Tải lên, chỉnh sửa, lọc và quản lý tri thức theo workspace, agent</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)} className="bg-primary hover:bg-primary/90">
          <Upload className="mr-2 h-4 w-4" /> Tải lên tri thức
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-center">
        <Select value={selectedAgentId || 'all'} onValueChange={v => setSelectedAgentId(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Chọn agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả agent</SelectItem>
            {agents.map(agent => (
              <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus || 'all'} onValueChange={v => setSelectedStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchKnowledge} className="flex items-center gap-2">
          <Filter className="h-4 w-4" /> Lọc
        </Button>
      </div>

      {/* Danh sách tri thức */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Đang tải dữ liệu...</div>
        ) : knowledgeList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Không có tri thức nào</div>
        ) : knowledgeList.map(item => (
          <Card key={item.id} className="p-4 hover:shadow-md transition-shadow bg-card text-card-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">Trạng thái: {item.status}</p>
                  {/* Đã bỏ phần hiển thị table preview vì view detail đã chuyển sang trang khác */}
                  {item.preview ? (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.preview}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1 italic">Không có preview</p>
                  )}
                  {item.created_at && <p className="text-xs text-muted-foreground mt-1">Tải lên: {item.created_at}</p>}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload(item)}>
                    <Download className="mr-2 h-4 w-4" /> Tải xuống
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditDialog(item)}>
                    <Edit className="mr-2 h-4 w-4" /> Sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/dashboard/knowledge/${item.id}`); }}>
                    <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeletingId(item.id)}>
                    <Trash className="mr-2 h-4 w-4" /> Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tải lên tri thức</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Chọn file</label>
              <Input type="file" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt,.md,.ppt,.pptx,.xls,.xlsx" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Agent</label>
              <Select value={selectedAgentId || 'all'} onValueChange={v => setSelectedAgentId(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả agent</SelectItem>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={uploadStatusValue} onValueChange={setUploadStatusValue}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Chính thức</SelectItem>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="archived">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Hủy</Button>
            <Button onClick={handleUpload} disabled={!selectedFile || uploadStatus === 'loading'} className="bg-primary hover:bg-primary/90">
              {uploadStatus === 'loading' ? 'Đang tải lên...' : 'Tải lên'}
            </Button>
          </DialogFooter>
          {uploadError && <div className="text-destructive text-sm mt-2">{uploadError}</div>}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tri thức</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nội dung</label>
              <Input value={editContent} onChange={e => setEditContent(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.filter(opt => opt.value).map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Hủy</Button>
            <Button onClick={handleEditSave} disabled={isSavingEdit} className="bg-primary hover:bg-primary/90">
              {isSavingEdit ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={!!deletingId} onOpenChange={open => { if (!open) setDeletingId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tri thức</DialogTitle>
          </DialogHeader>
          <div>Bạn có chắc chắn muốn xóa tri thức này không?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>Hủy</Button>
            <Button onClick={() => deletingId && handleDelete(deletingId)} disabled={isDeleting} className="bg-destructive text-white">
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Knowledge; 
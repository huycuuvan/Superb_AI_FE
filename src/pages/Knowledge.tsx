/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const KNOWLEDGE_TYPES = [
  { id: "file", label: "File", icon: FileText },
  { id: "database", label: "Database", icon: Database },
  { id: "rag", label: "RAG", icon: BookOpen },
  { id: "api", label: "API", icon: Globe },
  { id: "crawler", label: "Crawler", icon: Network },
] as const;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  Upload,
  MoreVertical,
  Download,
  Trash,
  Eye,
  Edit,
  Filter,
  Database,
  BookOpen,
  Globe,
  Network,
} from "lucide-react";
import {
  uploadKnowledge,
  listKnowledge,
  updateKnowledge,
  deleteKnowledge,
} from "@/services/api";
import { useSelectedWorkspace } from "@/hooks/useSelectedWorkspace";
import { useUniqueAgentsByFolders } from "@/hooks/useUniqueAgentsByFolders";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

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
  preview?: string;
  type: (typeof KNOWLEDGE_TYPES)[number]["id"];
  table_preview?: string;
  config?: Record<string, any>; // Cấu hình tùy theo loại tri thức
}

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "main", label: "Chính thức" },
  { value: "draft", label: "Nháp" },
];

const Knowledge: React.FC = () => {
  const { toast } = useToast();
  const { workspace } = useSelectedWorkspace();
  const { user } = useAuth();
  const { agents, isLoading: isLoadingAgents } = useUniqueAgentsByFolders();
  const navigate = useNavigate();

  // State filter
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] =
    useState<(typeof KNOWLEDGE_TYPES)[number]["id"]>("file");

  // State knowledge
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Upload state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string>("");
  // Thêm state cho status khi upload
  const [uploadStatusValue, setUploadStatusValue] = useState<string>("main");

  // Edit state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingKnowledge, setEditingKnowledge] =
    useState<KnowledgeItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editStatus, setEditStatus] = useState("main");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        toast({
          title: "Cảnh báo",
          description: "File vượt quá 10MB, vui lòng chọn file nhỏ hơn.",
          variant: "destructive",
        });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !workspace?.id || !user) return;
    setUploadStatus("loading");
    setUploadError("");
    try {
      const agent_id = selectedAgentId || agents[0]?.id || "";
      const res = await uploadKnowledge(
        selectedFile,
        agent_id,
        workspace.id,
        uploadStatusValue
      );
      if (res.success) {
        toast({
          title: "Thành công",
          description: "Tải lên tri thức thành công!",
        });
        setShowUploadDialog(false);
        setSelectedFile(null);
        fetchKnowledge();
        setUploadStatus("success");
      } else {
        throw new Error("Upload thất bại");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Lỗi không xác định";
      setUploadError(errorMsg);
      toast({ title: "Lỗi", description: errorMsg, variant: "destructive" });
      setUploadStatus("error");
    }
  };

  // List
  const fetchKnowledge = async () => {
    if (!workspace?.id) return;
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        workspace_id: workspace.id,
        type: selectedType,
      };
      if (selectedAgentId && selectedAgentId !== "all")
        params.agent_id = selectedAgentId;
      if (selectedStatus && selectedStatus !== "all")
        params.status = selectedStatus;
      const res = await listKnowledge(params);
      if (res.success) {
        setKnowledgeList(res.data || []);
      } else {
        setKnowledgeList([]);
      }
    } catch (err) {
      setKnowledgeList([]);
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Không lấy được danh sách tri thức";
      toast({ title: "Lỗi", description: errorMsg, variant: "destructive" });
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
    setEditTitle(item.title || "");
    setEditContent(item.content || "");
    setEditStatus(item.status || "main");
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
        toast({
          title: "Thành công",
          description: "Cập nhật tri thức thành công!",
        });
        setShowEditDialog(false);
        setEditingKnowledge(null);
        fetchKnowledge();
      } else {
        throw new Error("Cập nhật thất bại");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Cập nhật thất bại";
      toast({ title: "Lỗi", description: errorMsg, variant: "destructive" });
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
        toast({ title: "Thành công", description: "Xóa tri thức thành công!" });
        fetchKnowledge();
      } else {
        throw new Error("Xóa thất bại");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Xóa thất bại";
      toast({ title: "Lỗi", description: errorMsg, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  // Download (mock)
  const handleDownload = (item: KnowledgeItem) => {
    if (item.file_url) {
      window.open(item.file_url, "_blank");
    } else {
      toast({ title: "Chưa hỗ trợ tải file này", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 bg-background text-foreground">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý tri thức
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tải lên, chỉnh sửa, lọc và quản lý tri thức theo workspace, agent
          </p>
        </div>
        <Button
          onClick={() => setShowUploadDialog(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Upload className="mr-2 h-4 w-4" /> Tải lên tri thức
        </Button>
      </div>

      <Tabs
        value={selectedType}
        onValueChange={(value) => setSelectedType(value as typeof selectedType)}
        className="w-full mb-6"
      >
        <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto">
          {KNOWLEDGE_TYPES.map((type) => (
            <TabsTrigger
              key={type.id}
              value={type.id}
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none px-4 py-2"
            >
              <type.icon className="h-4 w-4 mr-2" />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-2 my-4 items-center">
          <Select
            value={selectedAgentId || "all"}
            onValueChange={(v) => setSelectedAgentId(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Chọn agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả agent</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedStatus || "all"}
            onValueChange={(v) => setSelectedStatus(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={fetchKnowledge}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" /> Lọc
          </Button>
        </div>

        <TabsContent value="file" className="mt-6">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tài liệu</h3>
              <Button
                onClick={() => setShowUploadDialog(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="h-4 w-4 mr-2" /> Tải lên file
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Hỗ trợ các định dạng: PDF, Word, Excel, PowerPoint, Text, Markdown
            </p>
            {/* File list */}
            <div className="grid gap-4">
              {knowledgeList.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 hover:shadow-md transition-shadow bg-card text-card-foreground"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Trạng thái: {item.status}
                        </p>
                        {item.preview ? (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {item.preview}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            Không có preview
                          </p>
                        )}
                        {item.created_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Tải lên: {item.created_at}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(item)}>
                          <Download className="mr-2 h-4 w-4" /> Tải xuống
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(item)}>
                          <Edit className="mr-2 h-4 w-4" /> Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/knowledge/${item.id}`);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletingId(item.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Kết nối Database</h3>
              <Button
                onClick={() => {}}
                className="bg-primary hover:bg-primary/90"
              >
                <Database className="h-4 w-4 mr-2" /> Kết nối mới
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Kết nối và đồng bộ dữ liệu từ các nguồn database khác nhau
            </p>
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Thông tin kết nối</h4>
                <div className="grid gap-3">
                  <Input placeholder="Host" />
                  <Input placeholder="Port" />
                  <Input placeholder="Database name" />
                  <Input placeholder="Username" type="text" />
                  <Input placeholder="Password" type="password" />
                  <Button className="w-full">Kiểm tra kết nối</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rag" className="mt-6">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">RAG Configuration</h3>
              <Button
                onClick={() => {}}
                className="bg-primary hover:bg-primary/90"
              >
                <BookOpen className="h-4 w-4 mr-2" /> Tạo RAG mới
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Cấu hình và quản lý các Retrieval-Augmented Generation (RAG)
            </p>
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Cấu hình RAG</h4>
                <div className="grid gap-3">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại Vector Database" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pinecone">Pinecone</SelectItem>
                      <SelectItem value="milvus">Milvus</SelectItem>
                      <SelectItem value="qdrant">Qdrant</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="API Key" />
                  <Input placeholder="Environment" />
                  <Input placeholder="Index name" />
                  <Button className="w-full">Lưu cấu hình</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">API Integration</h3>
              <Button
                onClick={() => {}}
                className="bg-primary hover:bg-primary/90"
              >
                <Globe className="h-4 w-4 mr-2" /> Thêm API
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tích hợp và quản lý các API endpoint
            </p>
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Thông tin API</h4>
                <div className="grid gap-3">
                  <Input placeholder="API URL" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="get">GET</SelectItem>
                      <SelectItem value="post">POST</SelectItem>
                      <SelectItem value="put">PUT</SelectItem>
                      <SelectItem value="delete">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="API Key (nếu có)" />
                  <div className="flex gap-2">
                    <Button className="flex-1">Test API</Button>
                    <Button className="flex-1">Lưu</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="crawler" className="mt-6">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Web Crawler</h3>
              <Button
                onClick={() => {}}
                className="bg-primary hover:bg-primary/90"
              >
                <Network className="h-4 w-4 mr-2" /> Thêm Crawler
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Cấu hình và quản lý các crawler để thu thập dữ liệu từ web
            </p>
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Cấu hình Crawler</h4>
                <div className="grid gap-3">
                  <Input placeholder="URL gốc" />
                  <Input placeholder="Selector CSS" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tần suất cập nhật" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Mỗi giờ</SelectItem>
                      <SelectItem value="daily">Mỗi ngày</SelectItem>
                      <SelectItem value="weekly">Mỗi tuần</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">Tạo Crawler</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tải lên tri thức</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Chọn file</label>
              <Input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.md,.ppt,.pptx,.xls,.xlsx"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Agent</label>
              <Select
                value={selectedAgentId || "all"}
                onValueChange={(v) => setSelectedAgentId(v === "all" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả agent</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select
                value={uploadStatusValue}
                onValueChange={setUploadStatusValue}
              >
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
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === "loading"}
              className="bg-primary hover:bg-primary/90"
            >
              {uploadStatus === "loading" ? "Đang tải lên..." : "Tải lên"}
            </Button>
          </DialogFooter>
          {uploadError && (
            <div className="text-destructive text-sm mt-2">{uploadError}</div>
          )}
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
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nội dung</label>
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions
                    .filter((opt) => opt.value)
                    .map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={isSavingEdit}
              className="bg-primary hover:bg-primary/90"
            >
              {isSavingEdit ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tri thức</DialogTitle>
          </DialogHeader>
          <div>Bạn có chắc chắn muốn xóa tri thức này không?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Hủy
            </Button>
            <Button
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={isDeleting}
              className="bg-destructive text-white"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Knowledge;

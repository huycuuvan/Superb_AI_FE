import React, { useState } from 'react';
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
import { FileText, Upload, MoreVertical, Download, Trash, Eye } from 'lucide-react';

interface KnowledgeFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  description?: string;
}

const Knowledge: React.FC = () => {
  const { toast } = useToast();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Mock data - replace with actual API calls
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([
    {
      id: '1',
      name: 'Product Manual.pdf',
      type: 'PDF',
      size: '2.5 MB',
      uploadDate: '2024-03-15',
      description: 'Complete product manual with all features and specifications'
    },
    {
      id: '2',
      name: 'API Documentation.docx',
      type: 'DOCX',
      size: '1.8 MB',
      uploadDate: '2024-03-14',
      description: 'API integration guide for developers'
    },
    {
      id: '3',
      name: 'Training Guide.pptx',
      type: 'PPTX',
      size: '4.2 MB',
      uploadDate: '2024-03-13',
      description: 'Employee training materials and guidelines'
    }
  ]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Mock upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newFile: KnowledgeFile = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.name.split('.').pop()?.toUpperCase() || 'Unknown',
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        description: fileDescription
      };

      setKnowledgeFiles(prev => [newFile, ...prev]);
      toast({
        title: "Success!",
        description: "File uploaded successfully.",
      });
      setShowUploadDialog(false);
      setSelectedFile(null);
      setFileDescription('');
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (fileId: string) => {
    // Mock delete - replace with actual API call
    setKnowledgeFiles(prev => prev.filter(file => file.id !== fileId));
    toast({
      title: "Success!",
      description: "File deleted successfully.",
    });
  };

  const handleDownload = (file: KnowledgeFile) => {
    // Mock download - replace with actual API call
    toast({
      title: "Downloading...",
      description: `Starting download of ${file.name}`,
    });
  };

  return (
    <div className="p-6 bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and organize your knowledge files</p>
        </div>
        <Button 
          onClick={() => setShowUploadDialog(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>

      <div className="grid gap-4">
        {knowledgeFiles.map((file) => (
          <Card key={file.id} className="p-4 hover:shadow-md transition-shadow bg-card text-card-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {file.type} • {file.size} • Uploaded {file.uploadDate}
                  </p>
                  {file.description && (
                    <p className="text-sm text-muted-foreground mt-1">{file.description}</p>
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
                  <DropdownMenuItem onClick={() => handleDownload(file)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Knowledge File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">File</label>
              <Input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.md,.ppt,.pptx"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                placeholder="Enter file description"
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-primary hover:bg-primary/90"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Knowledge; 
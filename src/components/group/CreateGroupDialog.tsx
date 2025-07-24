import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ open, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-auto shadow-2xl border border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-xl">Tạo nhóm mới</CardTitle>
          <CardDescription>Nhập tên và mô tả (tuỳ chọn) cho nhóm mới trong workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            className=""
            placeholder="Tên nhóm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <textarea
            className="border rounded-md p-2 w-full min-h-[80px] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Mô tả (tuỳ chọn)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">Hủy</Button>
          <Button
            className="bg-primary text-white"
            onClick={() => {
              if (name) onCreate(name, description);
            }}
            disabled={!name}
          >
            Tạo nhóm
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateGroupDialog; 
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddGroupMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (userId: string, role: 'admin' | 'member') => void;
}

const AddGroupMemberDialog: React.FC<AddGroupMemberDialogProps> = ({ open, onClose, onAdd }) => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<'admin' | 'member'>('member');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-auto shadow-2xl border border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-xl">Thêm thành viên vào nhóm</CardTitle>
          <CardDescription>Nhập user ID hoặc email, chọn vai trò để thêm thành viên vào nhóm.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            className=""
            placeholder="Nhập user ID hoặc email"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoFocus
          />
          <div>
            <label className="mr-2 font-medium">Vai trò:</label>
            <select
              className="border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">Hủy</Button>
          <Button
            className="bg-primary text-white"
            onClick={() => {
              if (userId) onAdd(userId, role);
            }}
            disabled={!userId}
          >
            Thêm
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddGroupMemberDialog; 
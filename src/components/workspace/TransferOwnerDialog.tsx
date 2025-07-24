import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkspaceMember, WorkspaceRole } from "@/types";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TransferOwnerDialogProps {
  open: boolean;
  onClose: () => void;
  members: WorkspaceMember[];
  currentOwnerId: string;
  workspaceId: string;
  onTransferSuccess: (newOwnerId: string) => void;
}

export const TransferOwnerDialog: React.FC<TransferOwnerDialogProps> = ({
  open,
  onClose,
  members,
  currentOwnerId,
  workspaceId,
  onTransferSuccess,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Lọc ra các thành viên có thể nhận quyền owner (admin hoặc member, không phải owner hiện tại)
  const eligibleMembers = members.filter(
    (m) => m.user_id !== currentOwnerId && (m.role === "admin" || m.role === "member")
  );

  const handleTransfer = async () => {
    if (!selectedUserId) {
      toast.error("Vui lòng chọn thành viên kế nhiệm");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/transfer-ownership`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ new_owner_id: selectedUserId }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Chuyển quyền owner thành công!");
        onTransferSuccess(selectedUserId);
        onClose();
      } else {
        toast.error(data.message || "Chuyển quyền owner thất bại");
      }
    } catch (err) {
      toast.error("Lỗi khi chuyển quyền owner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chuyển quyền chủ sở hữu workspace</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>Chọn thành viên kế nhiệm để chuyển quyền owner:</div>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn thành viên kế nhiệm" />
            </SelectTrigger>
            <SelectContent>
              {eligibleMembers.map((m) => (
                <SelectItem key={m.user_id} value={m.user_id}>
                  {m.name || m.email} ({m.role === "admin" ? "Quản trị viên" : "Thành viên"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button onClick={handleTransfer} disabled={loading || !selectedUserId}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang chuyển quyền...
              </>
            ) : (
              "Xác nhận chuyển quyền"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
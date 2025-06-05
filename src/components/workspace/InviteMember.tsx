/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Loader2 } from "lucide-react"; // Thêm Loader2 cho trạng thái loading
import { API_BASE_URL } from "@/config/api";
import { useQueryClient } from "@tanstack/react-query"; // Import useQueryClient

interface InviteMemberProps {
  workspaceId: string;
  iconOnly?: boolean;
}

export function InviteMember({ workspaceId, iconOnly }: InviteMemberProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member"); // Giá trị mặc định cho role
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Lấy queryClient instance
  const queryClient = useQueryClient();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email.trim()) {
        toast.error("Please enter an email address.");
        setIsLoading(false);
        return;
    }
    if (!role) {
        toast.error("Please select a role.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Lấy token một cách an toàn hơn, ví dụ từ context hoặc một service quản lý auth
          // localStorage có thể không phải là nơi an toàn nhất cho token quan trọng.
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          invitee_email: email,
          role: role,
        }),
      });

      // Xử lý response không thành công chi tiết hơn
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to send invitation. Please check details and try again." }));
        // Ví dụ: API có thể trả về { message: "User already invited", details: "..." }
        throw new Error(errorData.message || "Failed to send invitation");
      }

      // const data = await response.json(); // data có thể không cần dùng trực tiếp ở đây
      toast.success("Invitation sent successfully!");
      
      // Vô hiệu hóa query 'userInvitations' để Header tự động fetch lại
      // Điều này sẽ làm mới danh sách lời mời mà người dùng hiện tại nhận được,
      // nếu API được thiết kế để lời mời mới cho người khác cũng kích hoạt cập nhật cho admin.
      // Quan trọng hơn, nếu component này được dùng trong một trang quản lý lời mời của workspace,
      // nó sẽ giúp làm mới danh sách đó.
      await queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      // Nếu bạn có một query riêng để lấy danh sách các lời mời ĐÃ GỬI của một workspace, bạn cũng nên invalidate nó:
      // await queryClient.invalidateQueries({ queryKey: ['workspaceSentInvitations', workspaceId] });


      setOpen(false); // Đóng dialog
      // Reset form sau khi thành công
      setEmail("");
      setRole("member"); 
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
      console.error("Error sending invitation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) { // Reset form khi dialog đóng bằng cách khác (click ra ngoài, ESC)
            setEmail("");
            setRole("member");
            setIsLoading(false); // Đảm bảo reset trạng thái loading
        }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center justify-center transition-all duration-150 ease-in-out ${iconOnly ? "w-9 h-9 p-0 rounded-full" : "gap-2 px-3 py-2 text-sm"}`} // Tinh chỉnh style cho iconOnly
          size={iconOnly ? "icon" : "default"}
          aria-label="Invite member"
        >
          <Users className={`h-4 w-4 ${iconOnly ? "" : "mr-1"}`} /> {/* Điều chỉnh margin */}
          {!iconOnly && "Invite Member"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Member to Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-6 pt-4"> {/* Tăng space-y và pt */}
          <div className="space-y-1.5"> {/* Giảm space-y nội bộ */}
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={isLoading}
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-sm font-medium">Role</Label>
            <Select value={role} onValueChange={setRole} disabled={isLoading}>
              <SelectTrigger id="role" className="text-sm">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member" className="text-sm">Member</SelectItem>
                <SelectItem value="admin" className="text-sm">Admin</SelectItem>
                {/* Thêm các role khác nếu có */}
                {/* <SelectItem value="viewer">Viewer</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full text-sm py-2.5" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
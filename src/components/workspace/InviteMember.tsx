/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useQueryClient } from "@tanstack/react-query";
import { WorkspaceRole } from "@/types";
import { canInviteWithRole, getRoleLabel } from "@/utils/workspacePermissions";
import { handleWorkspaceError } from "@/utils/errorHandler";

interface InviteMemberProps {
  workspaceId: string;
  iconOnly?: boolean;
  userRole: WorkspaceRole;
}

export function InviteMember({ workspaceId, iconOnly, userRole }: InviteMemberProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("member");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email.trim()) {
      toast.error("Please enter an email address.");
      setIsLoading(false);
      return;
    }

    if (!canInviteWithRole(userRole, role)) {
      toast.error(`You don't have permission to invite users with ${getRoleLabel(role)} role.`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          invitee_email: email,
          role: role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.tag) {
          handleWorkspaceError(errorData);
        } else {
          throw new Error(errorData.error || errorData.message || "Failed to send invitation");
        }
        return;
      }

      toast.success("Invitation sent successfully!");
      await queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      await queryClient.invalidateQueries({ queryKey: ['workspaceSentInvitations', workspaceId] });

      setOpen(false);
      setEmail("");
      setRole("member");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
      console.error("Error sending invitation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show roles that the current user can invite
  const availableRoles: WorkspaceRole[] = ['member', 'admin'].filter(r => 
    canInviteWithRole(userRole, r as WorkspaceRole)
  ) as WorkspaceRole[];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setEmail("");
        setRole("member");
        setIsLoading(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`flex hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text items-center justify-center transition-all duration-150 ease-in-out ${iconOnly ? "w-9 h-9 p-0 rounded-full" : "gap-2 px-3 py-2 text-sm"}`}
          size={iconOnly ? "icon" : "default"}
          aria-label="Invite member"
        >
          <Users className={`h-4 w-4 ${iconOnly ? "" : "mr-1"}`} />
          {!iconOnly && "Invite Member"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Member to Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-6 pt-4">
          <div className="space-y-1.5">
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
            <Select value={role} onValueChange={(value) => setRole(value as WorkspaceRole)} disabled={isLoading}>
              <SelectTrigger id="role" className="text-sm">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r} value={r} className="text-sm">
                    {getRoleLabel(r)}
                  </SelectItem>
                ))}
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
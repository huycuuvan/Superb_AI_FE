import React, { useState } from "react";
import { useGroups } from "@/hooks/useGroups";
import GroupList from "@/components/group/GroupList";
import GroupMembers from "@/components/group/GroupMembers";
import AddGroupMemberDialog from "@/components/group/AddGroupMemberDialog";
import CreateGroupDialog from "@/components/group/CreateGroupDialog";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const GroupsPage: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id || null;
  const {
    groups,
    loading,
    error,
    selectedGroup,
    setSelectedGroup,
    members,
    membersLoading,
    fetchMembers,
    handleAddMember,
    handleRemoveMember,
    handleTransferOwner,
    handleUpdateRole,
    handleCreateGroup,
  } = useGroups(workspaceId);
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [search, setSearch] = useState("");

  // Lấy role của user trong group hiện tại
  const currentUserId = user?.id || "";
  const currentGroup = selectedGroup;
  const currentMember = members.find((m) => m.user_id === currentUserId);
  const canManage = currentMember && (currentMember.role === "owner" || currentMember.role === "admin");
  const isOwner = currentMember && currentMember.role === "owner";

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Quản lý nhóm</h1>
            <p className="text-muted-foreground">Tạo, quản lý nhóm và thành viên trong workspace.</p>
          </div>
        </div>
        <Button className="bg-primary text-white" onClick={() => setShowCreateDialog(true)}>
          + Tạo nhóm
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Danh sách nhóm */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Danh sách nhóm</CardTitle>
            <CardDescription>Chọn nhóm để xem thành viên và thao tác.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Tìm kiếm nhóm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <GroupList
              groups={groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))}
              selectedGroupId={currentGroup?.id}
              onSelect={(g) => {
                setSelectedGroup(g);
                fetchMembers(g.id);
              }}
              loading={loading}
            />
            <CreateGroupDialog
              open={showCreateDialog}
              onClose={() => setShowCreateDialog(false)}
              onCreate={async (name, description) => {
                if (workspaceId) {
                  await handleCreateGroup({ workspace_id: workspaceId, name, description });
                  setShowCreateDialog(false);
                }
              }}
            />
          </CardContent>
        </Card>
        {/* Thành viên nhóm */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {currentGroup ? `Thành viên nhóm: ${currentGroup.name}` : "Chọn một nhóm để xem thành viên"}
            </CardTitle>
            <CardDescription>
              {currentGroup
                ? "Quản lý thành viên, phân quyền, chuyển owner cho nhóm."
                : "Vui lòng chọn nhóm ở danh sách bên trái."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentGroup ? (
              <>
                <div className="flex justify-end mb-2">
                  {canManage && (
                    <Button
                      className="bg-primary text-white"
                      onClick={() => setShowAddDialog(true)}
                    >
                      + Thêm thành viên
                    </Button>
                  )}
                </div>
                <GroupMembers
                  members={members}
                  currentUserId={currentUserId}
                  groupOwnerId={currentGroup.owner_id}
                  onRemove={(userId) => handleRemoveMember(currentGroup.id, userId)}
                  onChangeRole={(userId, role) => handleUpdateRole(currentGroup.id, userId, role)}
                  onTransferOwner={(userId) => handleTransferOwner(currentGroup.id, userId)}
                  canManage={!!canManage}
                  loading={membersLoading}
                />
                <AddGroupMemberDialog
                  open={showAddDialog}
                  onClose={() => setShowAddDialog(false)}
                  onAdd={async (userId, role) => {
                    try {
                      await handleAddMember(currentGroup.id, userId, role);
                      setShowAddDialog(false);
                    } catch (err) {
                      if (err instanceof Error && err.message === "User must be a member of workspace to be added to group") {
                        toast({
                          title: "Không thể thêm thành viên",
                          description: "User phải là thành viên workspace mới được thêm vào group này.",
                          variant: "destructive",
                        });
                      } else {
                        toast({
                          title: "Lỗi",
                          description: err instanceof Error ? err.message : "Đã xảy ra lỗi khi thêm thành viên.",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                />
              </>
            ) : (
              <div className="text-center text-muted-foreground py-10">Chọn một nhóm để xem thành viên.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupsPage; 
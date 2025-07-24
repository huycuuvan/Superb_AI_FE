import React from "react";
import { GroupMember } from "@/services/api";
import { Button } from "@/components/ui/button";

interface GroupMembersProps {
  members: GroupMember[];
  currentUserId: string;
  groupOwnerId: string;
  onRemove: (userId: string) => void;
  onChangeRole: (userId: string, role: 'admin' | 'member') => void;
  onTransferOwner: (userId: string) => void;
  canManage: boolean;
  loading?: boolean;
}

const GroupMembers: React.FC<GroupMembersProps> = ({
  members,
  currentUserId,
  groupOwnerId,
  onRemove,
  onChangeRole,
  onTransferOwner,
  canManage,
  loading,
}) => {
  if (loading) return <div>Đang tải thành viên...</div>;
  if (!members.length) return <div className="text-center text-muted-foreground py-8">Nhóm chưa có thành viên.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left font-semibold text-muted-foreground">Tên</th>
            <th className="p-3 text-left font-semibold text-muted-foreground">Email</th>
            <th className="p-3 text-left font-semibold text-muted-foreground">Vai trò</th>
            {canManage && <th className="p-3 font-semibold text-muted-foreground">Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr
              key={m.user_id}
              className={`transition-colors ${m.user_id === groupOwnerId ? "bg-yellow-50 dark:bg-yellow-900/20" : "hover:bg-muted/60"}`}
            >
              <td className="p-3 font-medium whitespace-nowrap">{m.user_name}</td>
              <td className="p-3 whitespace-nowrap">{m.user_email}</td>
              <td className="p-3 font-semibold">
                {m.role === 'owner' ? 'Owner' : m.role === 'admin' ? 'Admin' : 'Member'}
              </td>
              {canManage && (
                <td className="p-3 space-x-2 whitespace-nowrap">
                  {m.role !== 'owner' && (
                    <>
                      <Button
                        variant="link"
                        className="text-primary px-0 no-underline hover:no-underline hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                        onClick={() => onChangeRole(m.user_id, m.role === 'admin' ? 'member' : 'admin')}
                      >
                        {m.role === 'admin' ? 'Chuyển thành member' : 'Chuyển thành admin'}
                      </Button>
                      <Button
                        variant="link"
                        className="text-destructive px-0 no-underline hover:no-underline hover:text-red-700 dark:hover:text-red-400 transition-colors"
                        onClick={() => onRemove(m.user_id)}
                      >
                        Xóa
                      </Button>
                      {currentUserId === groupOwnerId && (
                        <Button
                          variant="link"
                          className="text-green-600 dark:text-green-400 px-0 no-underline hover:no-underline hover:text-green-700 dark:hover:text-green-300 transition-colors"
                          onClick={() => onTransferOwner(m.user_id)}
                        >
                          Chuyển owner
                        </Button>
                      )}
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupMembers; 
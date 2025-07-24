import React from "react";
import { Group } from "@/services/api";

interface GroupListProps {
  groups: Group[];
  selectedGroupId?: string;
  onSelect: (group: Group) => void;
  loading?: boolean;
}

const GroupList: React.FC<GroupListProps> = ({ groups, selectedGroupId, onSelect, loading }) => {
  if (loading) return <div>Đang tải danh sách nhóm...</div>;
  if (!groups.length) return <div className="text-center text-muted-foreground py-8">Chưa có nhóm nào trong workspace.</div>;
  return (
    <ul className="divide-y divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
      {groups.map((group) => (
        <li
          key={group.id}
          className={`p-4 cursor-pointer transition-colors select-none ${selectedGroupId === group.id ? "bg-primary/10 dark:bg-primary/20" : "hover:bg-muted/60"}`}
          onClick={() => onSelect(group)}
        >
          <div className="font-semibold text-base text-foreground">{group.name}</div>
          {group.description && <div className="text-xs text-muted-foreground mt-1">{group.description}</div>}
        </li>
      ))}
    </ul>
  );
};

export default GroupList; 
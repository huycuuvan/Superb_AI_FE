import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useRunningTasksRealtime } from '@/hooks/useScheduledTasks';
import { Activity } from 'lucide-react';

interface RunningTasksBadgeProps {
  className?: string;
  showIcon?: boolean;
}

export const RunningTasksBadge: React.FC<RunningTasksBadgeProps> = ({ 
  className = "", 
  showIcon = true 
}) => {
  const runningCount = useRunningTasksRealtime();

  // Không hiển thị nếu không có task đang chạy
  if (runningCount === 0) {
    return null;
  }

  return (
    <Badge 
      variant="destructive" 
      className={`animate-pulse ${className}`}
      title={`${runningCount} task đang chạy`}
    >
      {showIcon && <Activity className="w-3 h-3 mr-1" />}
      {runningCount}
    </Badge>
  );
};

export default RunningTasksBadge; 
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useScheduledTaskRuns } from '@/hooks/useScheduledTasks';
import { ScheduledTask } from '@/services/api';
import { Clock, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';

interface ScheduledTaskRunsProps {
  task: ScheduledTask;
}

export const ScheduledTaskRuns: React.FC<ScheduledTaskRunsProps> = ({ task }) => {
  const { data: runsData, isLoading, error } = useScheduledTaskRuns(task.id);
  const runs = runsData?.data || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'paused':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case 'failed':
        return <Badge variant="destructive">Thất bại</Badge>;
      case 'running':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Đang chạy</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Tạm dừng</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes % 60}m`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds % 60}s`;
    } else {
      return `${diffSeconds}s`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thực thi</CardTitle>
          <CardDescription>Đang tải...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center p-3 border rounded-lg">
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500">Lỗi khi tải lịch sử thực thi</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Lịch sử thực thi
        </CardTitle>
        <CardDescription>
          Danh sách các lần thực thi của task "{task.name}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có lịch sử thực thi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {getStatusIcon(run.status)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {run.is_scheduled ? 'Tự động' : 'Thủ công'}
                      </span>
                      {getStatusBadge(run.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Bắt đầu: {formatDateTime(run.start_time)}
                    </div>
                    {run.end_time && (
                      <div className="text-sm text-muted-foreground">
                        Thời gian: {formatDuration(run.start_time, run.end_time)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {run.status === 'running' && (
                    <Badge variant="secondary" className="animate-pulse">
                      Đang chạy
                    </Badge>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Chi tiết thực thi</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Thông tin cơ bản</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ID:</span>
                              <span className="font-mono">{run.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Trạng thái:</span>
                              <span>{getStatusBadge(run.status)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Loại:</span>
                              <span>{run.is_scheduled ? 'Tự động' : 'Thủ công'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Thời gian</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Bắt đầu:</span>
                              <span>{formatDateTime(run.start_time)}</span>
                            </div>
                            {run.end_time && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Kết thúc:</span>
                                <span>{formatDateTime(run.end_time)}</span>
                              </div>
                            )}
                            {run.end_time && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Thời gian:</span>
                                <span>{formatDuration(run.start_time, run.end_time)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Thông tin khác</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Thread ID:</span>
                              <span className="font-mono">{run.thread_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">User ID:</span>
                              <span className="font-mono">{run.user_id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduledTaskRuns; 
// src/components/chat/TaskSelectionModal.tsx

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from "@/components/ui/dialog";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { ApiTaskType } from "@/types";
  
  interface TaskSelectionModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    tasks: ApiTaskType[];
    onTaskSelect: (task: ApiTaskType) => void;
  }
  
  export const TaskSelectionModal = ({ isOpen, onOpenChange, tasks, onTaskSelect }: TaskSelectionModalProps) => {
    // Hàm này sẽ được gọi khi người dùng nhấn vào một thẻ task
    const handleSelectTask = (task: ApiTaskType) => {
      onTaskSelect(task); // Gọi lại hàm xử lý cũ để mở ô nhập liệu
      onOpenChange(false); // Tự động đóng modal sau khi chọn
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl">Thư viện Tác vụ (Tasks)</DialogTitle>
            <DialogDescription>
              Chọn một trong các tác vụ có sẵn dưới đây để bắt đầu.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                
                <Card 
                  key={task.id}
                  className="cursor-pointer hover:border-primary transition-all group flex flex-col hover:bg-primary/10"
                  onClick={() => handleSelectTask(task)}
                >
                  <CardHeader className="p-0">
                    <img 
                      // Dùng ảnh của task, nếu không có thì dùng ảnh placeholder
                      src={task.img_url || 'https://via.placeholder.com/400x200?text=Task+Image'} 
                      alt={task.name} 
                      className="w-full h-36 object-cover rounded-t-lg"
                    />
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold mb-2 group-hover:text-primary dark:group-hover:text-white transition-colors">{task.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1 group-hover:text-primary dark:group-hover:text-white transition-colors">
                          {task.description || "Không có mô tả cho tác vụ này."}
                      </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
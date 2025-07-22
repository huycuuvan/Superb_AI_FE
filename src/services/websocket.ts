import { toast } from "react-hot-toast";

interface WebSocketMessage {
  type: string;
  payload: unknown;
}

type MessageHandler = (data: unknown) => void;

type ConnectionState = "connecting" | "open" | "closed" | "error";
type StateChangeListener = (state: ConnectionState) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private currentWsUrl: string | null = null;
  private connectionState: ConnectionState = "closed";
  private stateChangeListeners: StateChangeListener[] = [];

  constructor() {
    console.log("Khởi tạo WebSocket service...");
  }

  private setConnectionState(state: ConnectionState) {
    this.connectionState = state;
    console.log("WebSocket state changed:", state);
    this.stateChangeListeners.forEach((listener) => listener(state));
  }

  public subscribeToStateChange(listener: StateChangeListener) {
    this.stateChangeListeners.push(listener);
    listener(this.connectionState); // Notify immediately of current state
  }

  public unsubscribeFromStateChange(listener: StateChangeListener) {
    this.stateChangeListeners = this.stateChangeListeners.filter(
      (l) => l !== listener
    );
  }

  public connect(url: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket đã kết nối, bỏ qua yêu cầu kết nối mới.");
      this.setConnectionState("open");
      if (this.currentWsUrl !== url) {
        this.disconnect();
        this.connect(url);
      }
      return;
    }
    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log("WebSocket đang kết nối, bỏ qua yêu cầu kết nối mới.");
      if (this.currentWsUrl !== url) {
        this.disconnect();
        this.connect(url);
      }
      this.setConnectionState("connecting");
      return;
    }

    this.currentWsUrl = url;
    this.setConnectionState("connecting");

    try {
      console.log("Đang kết nối đến WebSocket server:", this.currentWsUrl);

      this.ws = new WebSocket(this.currentWsUrl);

      this.ws.onopen = () => {
        console.log("✅ WebSocket đã kết nối thành công");
        this.reconnectAttempts = 0;
        this.setConnectionState("open");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          console.log("📥 Nhận tin nhắn WebSocket:", data);

          const { type } = data;
          if (this.messageHandlers.has(type)) {
            console.log(`🔄 Xử lý tin nhắn loại: ${type}`);
            this.messageHandlers.get(type)?.forEach((handler) => handler(data));
          } else {
            console.log(`⚠️ Không tìm thấy handler cho loại tin nhắn: ${type}`);
          }
        } catch (error) {
          console.error("❌ Lỗi khi xử lý tin nhắn WebSocket:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log("🔌 WebSocket đã đóng kết nối:", event.code, event.reason);
        this.setConnectionState("closed");
        if (this.currentWsUrl) {
          this.handleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error("❌ Lỗi WebSocket:", error);
        this.setConnectionState("error");
      };
    } catch (error) {
      console.error("❌ Lỗi khi kết nối WebSocket:", error);
      this.setConnectionState("error");
      if (this.currentWsUrl) {
        this.handleReconnect();
      } else {
        toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }
  }

  private handleReconnect() {
    if (!this.currentWsUrl) return;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Đang thử kết nối lại lần ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );
      setTimeout(() => {
        if (this.currentWsUrl) {
          this.setConnectionState("connecting");
          this.connect(this.currentWsUrl);
        }
      }, this.reconnectTimeout);
    } else {
      console.error("❌ Đã vượt quá số lần thử kết nối lại");
      toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    }
  }

  public subscribe(type: string, handler: MessageHandler) {
    console.log(`📝 Đăng ký lắng nghe sự kiện: ${type}`);
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  public unsubscribe(type: string, handler: MessageHandler) {
    console.log(`🔕 Hủy đăng ký sự kiện: ${type}`);
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public send(messageObject: unknown) {
    console.log(`📤 Gửi tin nhắn WebSocket:`, messageObject);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(messageObject));
    } else {
      console.error("❌ Không thể gửi tin nhắn - WebSocket chưa kết nối");
      toast.error(
        "Không thể gửi tin nhắn. Kết nối WebSocket đã đóng hoặc đang trong quá trình kết nối lại."
      );
    }
  }

  public disconnect() {
    console.log("🔌 Đóng kết nối WebSocket");
    if (this.ws) {
      this.currentWsUrl = null;
      this.setConnectionState("closed");
      this.ws.close();
      this.ws = null;
    }
  }

  public getReadyState(): number | undefined {
    return this.ws?.readyState;
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // Join vào WebSocket thread để nhận updates cho scheduled task
  public joinThread(threadId: string) {
    console.log(`🔗 [DEBUG] FE join thread_id:`, threadId);
    this.send({
      type: "join",
      thread_id: threadId,
    });
  }

  // Xử lý message cho scheduled task run-now
  public handleScheduledTaskStatus(
    callback: (data: {
      thread_id: string;
      task_run_id: string;
      status: string;
      error?: string;
      message?: string;
    }) => void
  ) {
    this.subscribe("status", (payload) => {
      try {
        // Xử lý payload là object có content
        if (payload && typeof payload === "object" && "content" in payload) {
          const data = payload as {
            thread_id: string;
            content: string;
            timestamp: string;
          };
          const content = JSON.parse(data.content);
          console.log("[DEBUG] FE nhận content:", content);
          if (content.task_run_id) {
            callback({
              thread_id: data.thread_id,
              task_run_id: content.task_run_id,
              status: content.status,
              error: content.error,
              message: content.message,
            });
          }
        } else if (typeof payload === "string") {
          // Nếu payload là string (có thể là content luôn)
          const content = JSON.parse(payload);
          console.log("[DEBUG] FE nhận content:", content);
          if (content.task_run_id) {
            callback({
              thread_id: "", // Không có thread_id trong trường hợp này
              task_run_id: content.task_run_id,
              status: content.status,
              error: content.error,
              message: content.message,
            });
          }
        } else {
          console.warn(
            "[DEBUG] Không nhận diện được payload WebSocket:",
            payload
          );
        }
      } catch (error) {
        console.error("❌ Lỗi khi xử lý scheduled task status:", error);
      }
    });
    // Log toàn bộ message nhận được từ server
    this.subscribe("*", (payload) => {
      console.log("[DEBUG] FE nhận message từ server:", payload);
    });
  }

  // Xử lý cập nhật thông tin scheduled task
  public handleScheduledTaskUpdate(
    callback: (data: {
      workspace_id: string;
      task_id: string;
      total_runs: number;
      successful_runs: number;
      failed_runs: number;
      last_run_at?: string;
      next_run_at?: string;
      thread_id?: string;
      status?: "active" | "paused";
    }) => void
  ) {
    this.subscribe("scheduled_task_update", (payload) => {
      try {
        // Parse message từ websocket
        let wsMessage;
        if (typeof payload === "string") {
          wsMessage = JSON.parse(payload);
        } else {
          wsMessage = payload as {
            type: string;
            thread_id: string;
            content: string;
            timestamp: string;
          };
        }

        // Parse content trong message
        const data = JSON.parse(wsMessage.content);
        console.log("[DEBUG] FE nhận scheduled task update:", data);

        if (data.scheduled_task_id || data.task_id) {
          // Validate status
          const status =
            data.status === "active" || data.status === "paused"
              ? data.status
              : undefined;

          callback({
            workspace_id: data.workspace_id,
            task_id: data.scheduled_task_id || data.task_id, // Support both field names
            total_runs: data.total_runs,
            successful_runs: data.successful_runs,
            failed_runs: data.failed_runs,
            last_run_at: data.last_run_at,
            next_run_at: data.next_run_at,
            thread_id: wsMessage.thread_id,
            status,
          });
        }
      } catch (error) {
        console.error("❌ Lỗi khi xử lý scheduled task update:", error);
      }
    });
  }
}

export const websocketService = new WebSocketService();

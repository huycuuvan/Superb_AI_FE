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

          const { type, payload } = data;
          if (this.messageHandlers.has(type)) {
            console.log(`🔄 Xử lý tin nhắn loại: ${type}`);
            this.messageHandlers
              .get(type)
              ?.forEach((handler) => handler(payload));
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
}

export const websocketService = new WebSocketService();

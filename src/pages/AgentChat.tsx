/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send,
  X,
  Plus,
  Paperclip,
  ListPlus,
  Book,
  Clock,
  Rocket,
  Lightbulb,
  ChevronsDown,
  BrainCircuit,
  ChevronUp,
  ChevronDown,
  Coins,
  Key,
  FileText,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Agent,
  ChatTask,
  ChatMessage,
  ApiTaskType,
  Workspace,
  ApiMessage,
  TaskRun,
} from "@/types";
import { History } from "lucide-react";
import { TaskHistory } from "@/components/chat/TaskHistory"; // Đảm bảo đường dẫn này đúng
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import {
  getAgentById,
  createThread,
  getWorkspace,
  checkThreadExists,
  sendMessageToThread,
  getThreadMessages,
  getAgentTasks,
  executeTask,
  getThreads,
  getThreadById,
  getThreadByAgentId,
  getTaskRunsByThreadId,
  uploadMessageWithFiles,
  getCredentials,
  deleteThread,
  getSubflowLogPairs,
  listKnowledge,
  saveAgentPlan,
} from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { AgentTypingIndicator } from "@/components/ui/agent-typing-indicator";
import { ChatMessageContent } from "@/components/chat/ChatMessageContent";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TaskSelectionModal } from "@/components/chat/TaskSelectionModal";
import { PromptTemplatesModal } from "@/components/chat/PromptTemplatesModal";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useSelectedWorkspace } from "@/hooks/useSelectedWorkspace";
import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";
import { CreditPurchaseDialog } from "@/components/CreditPurchaseDialog";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import LogAgentThinking from "@/components/LogAgentThinking";
import { useInView } from "react-intersection-observer";
import React from "react";
import { WS_URL } from "@/config/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { isAgentResImageObject, getAgentResImageUrl } from "@/utils/imageUtils";
import { useTheme } from "@/hooks/useTheme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Define a more specific type for execution_config
interface ExecutionConfig {
  [key: string]: string; // Cập nhật kiểu dữ liệu cho execution_config dựa trên response API
}

// Use ApiTaskType directly everywhere

interface Message {
  type: string;
  thread_id: string;
  content: string;
  timestamp: string;
  sender_type: "user" | "agent";
  sender_user_id: string;
  chat_message?: ApiMessage;
  parent_message_id?: string;
}

// Định nghĩa một kiểu dữ liệu cho output video
type TaskOutputData = TaskRun["output_data"];

// Type guard cho TaskLog
function isTaskLogMessage(obj: unknown): obj is TaskLog {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "status" in obj &&
    "message" in obj
  );
}

// Type guard cho TaskOutputData (kết quả video)
function isTaskOutputData(obj: unknown): obj is TaskOutputData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "url" in obj &&
    "snapshot_url" in obj
  );
}

// Interface cho log từ WebSocket task
interface TaskLog {
  message?: string;
  status?: "completed" | "processing" | "error" | string; // Có thể có các trạng thái khác
  response?: unknown; // Sử dụng unknown thay cho any để yêu cầu kiểm tra kiểu rõ ràng
  task_id?: string;
}

// Interface cho subflow log từ WebSocket
interface SubflowLog {
  type: "subflow_log";
  thread_id: string;
  content: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

// Định nghĩa interface Credential (giống CredentialsPage)
interface Credential {
  id: string;
  provider: string;
  credential: object;
  created_at?: string;
}

// Thêm component con cho message agent:
const AgentMessageWithLog = ({
  msg,
  userMsgId,
  messageLogs,
  loadingLog,
  handleShowLog,
  children,
}) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  React.useEffect(() => {
    if (inView && userMsgId && !messageLogs[msg.id] && !loadingLog[msg.id]) {
      handleShowLog(msg.id, userMsgId);
    }
  }, [inView, userMsgId, msg.id, messageLogs, loadingLog]);
  return (
    <div ref={ref} key={msg.id} className="flex flex-col">
      {children}
    </div>
  );
};

const AgentChat = () => {
  const { agentId, threadId: threadFromUrl } = useParams<{
    agentId: string;
    threadId?: string;
  }>();
  const { workspace, isLoading: isWorkspaceLoading } = useSelectedWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  const [subflowLogs, setSubflowLogs] = useState<SubflowLog[]>([]);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const { user, updateUser } = useAuth();
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  // Thêm state để ngăn chặn tạo thread đồng thời
  const [isThreadCreationInProgress, setIsThreadCreationInProgress] =
    useState(false);
  // Agent and workspace info
  const [currentThread, setCurrentThread] = useState<string | null>(
    threadFromUrl || null
  );
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);

  // Mobile sidebar state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Ref to prevent duplicate thread creation
  const isInitializingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const previousAgentIdRef = useRef<string | null>(null);

  // Chat display states
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // State mới để lưu tasks được fetch từ API
  const [tasks, setTasks] = useState<ApiTaskType[]>([]); // Khởi tạo rỗng, sẽ fetch data

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // State mới để theo dõi trạng thái thực thi của từng task: taskId -> 'idle' | 'loading' | 'success' | 'error'
  const [taskExecutionStatus, setTaskExecutionStatus] = useState<{
    [taskId: string]: "idle" | "loading" | "success" | "error";
  }>({});

  // Ref để theo dõi ID của tin nhắn agent đang được stream/chunk
  const lastAgentMessageIdRef = useRef<string | null>(null);
  const agentDoneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [taskRunItems, setTaskRunItems] = useState<TaskRun[]>([]);

  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null); // Ref to store WebSocket instance
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const [aboveInputContent, setAboveInputContent] = useState<
    "none" | "taskList" | "taskInputs" | "knowledge"
  >("none");

  const [selectedTaskInputs, setSelectedTaskInputs] = useState<{
    [key: string]: string;
  }>({});

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Thêm hàm để lấy lịch sử task
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["taskRuns", currentThread, currentAgent?.id],
    queryFn: () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("Không tìm thấy thông tin người dùng");
      const user = JSON.parse(userStr);
      return getTaskRunsByThreadId(user.id, currentAgent?.id || "");
    },
    enabled: !!currentThread && !!currentAgent?.id && showTaskHistory,
  });

  const handleScroll = () => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const isScrolledUp =
        chatContainer.scrollHeight -
          chatContainer.scrollTop -
          chatContainer.clientHeight >
        300; // 300px là ngưỡng, có thể tùy chỉnh
      setShowScrollToBottom(isScrolledUp);
    }
  };

  // ADDED: Hàm để cuộn xuống tin nhắn mới nhất
  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: behavior,
      });
    }
  };

  // State cho credential
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string>("");
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  // Clean up interval on component unmount (now handled by WS cleanup)
  useEffect(() => {
    if (currentThread) {
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      if (!token) {
        return;
      }

      const wsUrl = `${WS_URL}?token=${token}&thread_id=${currentThread}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket Connected", { threadId: currentThread });
      };

      ws.current.onmessage = (event) => {
        try {
          const receivedData: any = JSON.parse(event.data);
          // Xử lý cập nhật credit realtime
          if (
            receivedData.type === "credit_update" &&
            typeof receivedData.credit === "number"
          ) {
            updateUser({ ...user, credit: receivedData.credit });
            return;
          }
          // Xử lý lỗi hết credit
          if (
            receivedData.type === "error" &&
            receivedData.content &&
            receivedData.content.includes("hết credit")
          ) {
            setIsCreditError(true);
            setIsAgentThinking(false);
            return;
          }
          const msgData = receivedData.chat_message
            ? receivedData.chat_message
            : receivedData;

          const optimisticId =
            receivedData.optimistic_id || msgData.optimistic_id;

          if (optimisticId) {
            setMessages((prevMessages) => {
              const confirmedMessage: ChatMessage = {
                id: msgData.id,
                content: msgData.message_content || msgData.content,
                sender: msgData.sender_type,
                timestamp: msgData.created_at,
                agentId: msgData.sender_agent_id,
                image_urls: msgData.image_urls,
                ...(msgData.file_urls ? { file_urls: msgData.file_urls } : {}), // chỉ gán nếu có
                isStreaming: false,
              };

              const indexToReplace = prevMessages.findIndex(
                (m) => m.id === optimisticId
              );

              if (indexToReplace !== -1) {
                const newMessages = [...prevMessages];
                newMessages[indexToReplace] = confirmedMessage;
                return newMessages;
              } else {
                if (!prevMessages.some((m) => m.id === confirmedMessage.id)) {
                  return [...prevMessages, confirmedMessage];
                }
                return prevMessages;
              }
            });
            // CHỈ tắt trạng thái đang nghĩ nếu message này là của agent
            if (msgData.sender_type === "agent") {
              setIsAgentThinking(false);
              // Reset realtimeLogs cho message agent này
              setRealtimeLogs((prev) => {
                const newLogs = { ...prev };
                if (msgData.id) delete newLogs[msgData.id];
                return newLogs;
              });
            }
            return; // Kết thúc
          }

          if (receivedData.type === "chat") {
            setSubflowLogs([]); // Reset subflow logs khi có message mới
            setMessages((prevMessages) => {
              const lastMessageIndex = prevMessages.length - 1;
              // Nếu là agent và đang stream, update message cuối
              if (
                msgData.sender_type === "agent" &&
                prevMessages.length > 0 &&
                prevMessages[lastMessageIndex].sender === "agent" &&
                prevMessages[lastMessageIndex].isStreaming
              ) {
                const lastMessage = prevMessages[lastMessageIndex];
                const updatedContent =
                  msgData.message_content || msgData.content;
                const updatedLastMessage: ChatMessage = {
                  ...lastMessage,
                  content: updatedContent,
                  timestamp: msgData.created_at || receivedData.timestamp,
                };
                const updatedMessages = [...prevMessages];
                updatedMessages[lastMessageIndex] = updatedLastMessage;
                return updatedMessages;
              } else {
                // Nếu là message agent mà không có id từ BE, bỏ qua (không tạo id tạm)
                if (!msgData.id && msgData.sender_type === "agent")
                  return prevMessages;
                // Nếu là agent, fake streaming
                if (msgData.sender_type === "agent") {
                  const newChatMessage: ChatMessage = {
                    id: msgData.id || `ws-${Date.now()}`,
                    content: "", // bắt đầu với rỗng
                    sender: msgData.sender_type,
                    timestamp: msgData.created_at || receivedData.timestamp,
                    agentId: msgData.sender_user_id,
                    image_urls: msgData.image_urls,
                    ...(msgData.file_urls
                      ? { file_urls: msgData.file_urls }
                      : {}),
                    isStreaming: true,
                    parent_message_id: msgData.parent_message_id,
                  };
                  if (prevMessages.some((m) => m.id === newChatMessage.id))
                    return prevMessages;
                  if (newChatMessage.parent_message_id) {
                    handleShowLog(
                      newChatMessage.id,
                      newChatMessage.parent_message_id
                    );
                  }
                  // Thêm vào messages
                  setTimeout(() => {
                    import("@/utils/fakeStreaming").then(
                      ({ fakeStreamMessage }) => {
                        fakeStreamMessage(
                          msgData.message_content || msgData.content,
                          (partial) => {
                            setMessages((msgs) =>
                              msgs.map((m) =>
                                m.id === newChatMessage.id
                                  ? { ...m, content: partial }
                                  : m
                              )
                            );
                          },
                          () => {
                            setMessages((msgs) =>
                              msgs.map((m) =>
                                m.id === newChatMessage.id
                                  ? { ...m, isStreaming: false }
                                  : m
                              )
                            );
                          }
                        );
                      }
                    );
                  }, 100); // delay nhỏ để đảm bảo message đã được thêm vào state
                  return [...prevMessages, newChatMessage];
                }
                const newChatMessage: ChatMessage = {
                  id: msgData.id || `ws-${Date.now()}`,
                  content: msgData.message_content || msgData.content,
                  sender: msgData.sender_type,
                  timestamp: msgData.created_at || receivedData.timestamp,
                  agentId: msgData.sender_user_id,
                  image_urls: msgData.image_urls,
                  ...(msgData.file_urls
                    ? { file_urls: msgData.file_urls }
                    : {}),
                  isStreaming: false,
                  parent_message_id: msgData.parent_message_id,
                };
                if (prevMessages.some((m) => m.id === newChatMessage.id))
                  return prevMessages;
                // GỌI LUÔN handleShowLog nếu có parent_message_id
                if (newChatMessage.parent_message_id) {
                  handleShowLog(
                    newChatMessage.id,
                    newChatMessage.parent_message_id
                  );
                }
                return [...prevMessages, newChatMessage];
              }
            });
            // Chỉ tắt trạng thái đang nghĩ nếu message này là của agent
            if (msgData.sender_type === "agent") {
              setIsAgentThinking(false);
              // Reset realtimeLogs cho message agent này
              setRealtimeLogs((prev) => {
                const newLogs = { ...prev };
                if (msgData.id) delete newLogs[msgData.id];
                return newLogs;
              });
            }
            return;
          }

          if (receivedData.type === "done") {
            lastAgentMessageIdRef.current = null;
            setIsAgentThinking(false);
            setSubflowLogs([]); // Reset subflow logs khi agent hoàn thành
            setMessages((prevMessages) => {
              if (prevMessages.length === 0) return prevMessages;
              const lastMessageIndex = prevMessages.length - 1;
              const lastMessage = prevMessages[lastMessageIndex];
              if (lastMessage.sender === "agent" && lastMessage.isStreaming) {
                const finalizedMessage = { ...lastMessage, isStreaming: false };
                const updatedMessages = [...prevMessages];
                updatedMessages[lastMessageIndex] = finalizedMessage;
                return updatedMessages;
              }
              return prevMessages;
            });
            // Reset realtimeLogs cho message agent cuối cùng
            setRealtimeLogs((prev) => {
              const newLogs = { ...prev };
              const lastMsg = messages[messages.length - 1];
              if (lastMsg && lastMsg.sender === "agent" && lastMsg.id) {
                delete newLogs[lastMsg.id];
              }
              return newLogs;
            });
            return;
          }
          if (receivedData.type === "status") {
            try {
              const statusUpdate = JSON.parse(receivedData.content);
              const runIdToUpdate = statusUpdate.task_run_id;

              if (runIdToUpdate) {
                setTaskRunItems((prevRuns) =>
                  prevRuns.map((run) => {
                    // Tìm đúng item trong danh sách bằng run_id
                    if (run.id === runIdToUpdate) {
                      // Cập nhật lại trạng thái, kết quả và thông báo lỗi (nếu có)
                      return {
                        ...run,
                        status: statusUpdate.status,
                        output_data:
                          statusUpdate.result ??
                          statusUpdate.response ??
                          run.output_data,
                        updated_at: new Date().toISOString(),
                        error:
                          statusUpdate.status === "error" ||
                          statusUpdate.status === "failed"
                            ? statusUpdate.message ||
                              statusUpdate.error_message ||
                              "Đã xảy ra lỗi."
                            : undefined,
                      };
                    }
                    return run;
                  })
                );
                if (
                  statusUpdate.status === "completed" ||
                  statusUpdate.status === "error" ||
                  statusUpdate.status === "failed"
                ) {
                  // Ra lệnh cho useQuery tự động fetch lại dữ liệu mới nhất từ API
                  queryClient.invalidateQueries({
                    queryKey: ["taskRuns", currentThread],
                  });
                }
              }
            } catch (e) {
              console.error("Error parsing status update: ", e);
            }
          }

          // Xử lý subflow_log từ backend
          if (
            receivedData.type === "subflow_log" ||
            receivedData.type === "subflow_result"
          ) {
            const log = {
              ...receivedData,
              is_result: receivedData.type === "subflow_result",
            };
            const msgId = log.message_id;
            const logType =
              receivedData.log_type ||
              (receivedData.type === "subflow_result" ? "result" : "execute");
            if (msgId) {
              setRealtimeLogs((prev) => ({
                ...prev,
                [msgId]: {
                  ...prev[msgId],
                  [logType]: log,
                },
              }));
            }
            setSubflowLogs((prevLogs) => [...prevLogs, log]);
            return;
          }

          // Xử lý subflow_result từ backend (log kết quả)
          if (receivedData.type === "subflow_result") {
            setSubflowLogs((prevLogs) => {
              const newLog: any = {
                ...receivedData,
                is_result: true, // Ép cứng log kết quả
              };
              return [...prevLogs, newLog];
            });
            return;
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      ws.current.onclose = (event) => {
        console.log(
          "WebSocket Disconnected. Code:",
          event.code,
          "Reason:",
          event.reason,
          "Was Clean:",
          event.wasClean
        );
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setIsAgentThinking(false); // Stop typing indicator
      };

      return () => {
        ws.current?.close();
      };
    }
  }, [currentThread]); // Reconnect when currentThread changes

  useEffect(() => {
    // Reset toàn bộ state liên quan đến chat khi đổi agent
    setCurrentAgent(null);
    setMessages([]);
    setCurrentThread(null);
    setTasks([]);
    setIsLoading(true);
    setIsSending(false);
    setIsCreatingThread(false);
    setShowScrollToBottom(false);
    setShowMobileSidebar(false);
    setIsAgentThinking(false);
    setAboveInputContent("none");
    setSelectedTaskId(null);
    setSelectedTaskInputs({});
    setTaskExecutionStatus({});
    setTaskRunItems([]);
    setCredentials([]);
    setSelectedCredentialId("");
    setLoadingCredentials(false);
    setUploadedFiles([]);
    setFilePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (textareaRef.current) textareaRef.current.style.height = "40px";
    hasInitializedRef.current = false;
    isInitializingRef.current = false;
    setIsThreadCreationInProgress(false); // Reset state khi đổi agent
    previousAgentIdRef.current = null; // Reset agentId trước đó

    // Gọi lại initializeChat khi agentId thay đổi hoặc khi workspace thay đổi mà chưa có thread
    if (
      agentId &&
      workspace?.id &&
      (agentId !== previousAgentIdRef.current || !currentThread)
    ) {
      const initializeChat = async () => {
        // Ngăn chặn việc chạy nhiều lần đồng thời
        if (isInitializingRef.current || isThreadCreationInProgress) return;

        // Nếu đã khởi tạo thành công và có thread hiện tại, không cần khởi tạo lại
        if (
          hasInitializedRef.current &&
          currentThread &&
          agentId === previousAgentIdRef.current
        )
          return;

        isInitializingRef.current = true;

        try {
          setIsLoading(true);
          await new Promise((resolve) => setTimeout(resolve, 500));

          const currentWorkspaceId = workspace.id;
          const agentData = await getAgentById(agentId);
          setCurrentAgent(agentData.data);

          // Fetch tasks for the agent
          if (agentId) {
            try {
              const agentTasksResponse = await getAgentTasks(agentId);
              if (agentTasksResponse.data) {
                setTasks(agentTasksResponse.data);
              }
            } catch (taskError) {
              console.error("Error fetching agent tasks:", taskError);
            }
          }

          let threadId: string | null = null;
          let initialMessages: ChatMessage[] = [];

          // Kiểm tra thread tồn tại
          let threadCheck = null;
          if (currentWorkspaceId) {
            threadCheck = await checkThreadExists(agentId, currentWorkspaceId);
          }

          if (threadCheck && threadCheck.exists && threadCheck.thread_id) {
            // Sử dụng thread đã tồn tại
            threadId = threadCheck.thread_id;
          } else {
            // Tạo thread mới khi không tồn tại thread nào
            setIsThreadCreationInProgress(true);
            try {
              const threadData = {
                agent_id: agentId,
                workspace_id: currentWorkspaceId,
                title: "",
              };
              const threadResponse = await createThread(threadData);
              threadId = threadResponse.data.id;
            } finally {
              setIsThreadCreationInProgress(false);
            }
          }

          // Fetch messages cho thread (dù mới tạo hay đã tồn tại)
          if (threadId) {
            try {
              const messagesResponse = await getThreadMessages(threadId);
              initialMessages = (
                messagesResponse.data && Array.isArray(messagesResponse.data)
                  ? messagesResponse.data
                  : []
              )
                .map((msg) => ({
                  id: msg.id,
                  content: msg.message_content,
                  sender: msg.sender_type,
                  timestamp: msg.created_at,
                  agentId: msg.sender_agent_id,
                  image_urls: msg.image_urls,
                  ...(msg.file_urls ? { file_urls: msg.file_urls } : {}), // <--- thêm dòng này
                  parent_message_id: msg.parent_message_id,
                }))
                .sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                );

              // Chỉ thêm welcome message nếu không có tin nhắn nào
              if (
                initialMessages.length === 0 &&
                agentData.data.greeting_message
              ) {
                const welcomeMessage: ChatMessage = {
                  id: Date.now().toString(),
                  content:
                    agentData.data.greeting_message ||
                    "Hello! How can I help you?",
                  sender: "agent",
                  timestamp: new Date().toISOString(),
                  agentId: agentData.data.id,
                  image_urls: agentData.data.image_urls,
                };
                initialMessages.push(welcomeMessage);
              }
            } catch (fetchError) {
              console.error("Error fetching initial messages:", fetchError);
              // Nếu không fetch được messages, vẫn tạo welcome message
              if (agentData.data.greeting_message) {
                const welcomeMessage: ChatMessage = {
                  id: Date.now().toString(),
                  content:
                    agentData.data.greeting_message ||
                    "Hello! How can I help you?",
                  sender: "agent",
                  timestamp: new Date().toISOString(),
                  agentId: agentData.data.id,
                  image_urls: agentData.data.image_urls,
                };
                initialMessages = [welcomeMessage];
              }
            }
          }

          setCurrentThread(threadId);
          setMessages(initialMessages);
          hasInitializedRef.current = true; // Đánh dấu đã khởi tạo thành công
          previousAgentIdRef.current = agentId; // Cập nhật agentId trước đó
        } catch (error) {
          console.error("Error initializing chat:", error);
        } finally {
          setIsLoading(false);
          isInitializingRef.current = false;
        }
      };
      initializeChat();
    }
  }, [agentId, workspace?.id]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const isAtBottom =
        chatContainer.scrollHeight -
          chatContainer.scrollTop -
          chatContainer.clientHeight <
        150;

      if (isAtBottom || !isAgentThinking) {
        // Sử dụng requestAnimationFrame để đợi DOM update xong rồi mới cuộn
        requestAnimationFrame(() => {
          scrollToBottom("auto"); // Cuộn ngay lập tức khi có tin nhắn mới
        });
      }
    }
  }, [messages, isAgentThinking]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        scrollToBottom("auto");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    // Gắn listener sau khi loading xong
    if (chatContainer && !isLoading) {
      chatContainer.addEventListener("scroll", handleScroll);
    }

    // Dọn dẹp listener khi component unmount
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isLoading]); // Chạy lại khi trạng thái loading thay đổi
  const handleSendMessage = () => {
    if (isCreditError) return;
    if ((message.trim() || uploadedFiles.length > 0) && currentThread) {
      setIsSending(true);
      const optimisticId = `optimistic-${Date.now()}`;
      // Tạo tin nhắn tạm thời để hiển thị ngay
      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        content: message,
        sender: "user",
        timestamp: new Date().toISOString(),
        // Sửa lại: chỉ preview nhiều ảnh nếu ChatMessage cho phép, nếu không thì bỏ qua
        // images: filePreviews.map(f => f.url),
      } as any;
      // Nếu muốn preview nhiều ảnh, có thể thêm thuộc tính images (hoặc sửa lại UI hiển thị)
      (optimisticMessage as any).images = filePreviews.map((f) => f.url);
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
      const messageToSend = message;
      const filesToSend = uploadedFiles;
      const threadIdToSend = currentThread;
      setMessage("");
      setUploadedFiles([]);
      setFilePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (textareaRef.current) {
        textareaRef.current.style.height = "40px";
        textareaRef.current.focus();
      }
      if (filesToSend.length > 0) {
        setIsAgentThinking(true);
        uploadMessageWithFiles(
          threadIdToSend,
          messageToSend,
          filesToSend,
          optimisticId
        )
          .catch((error) => {
            setUploadedFiles([]);
            setFilePreviews([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            toast({
              variant: "destructive",
              title: "Lỗi",
              description: "Gửi file thất bại.",
            });
            setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          })
          .finally(() => {
            setIsSending(false);
          });
      } else {
        // Gửi text như cũ
        const messageToSendObj = {
          type: "chat",
          thread_id: threadIdToSend,
          content: messageToSend,
          sender_type: "user",
          sender_user_id: user?.id,
          message_id: optimisticId,
        };
        ws.current?.send(JSON.stringify(messageToSendObj));
        setIsSending(false);
        setIsAgentThinking(true);
        setSubflowLogs([]);
      }
    }
  };

  const handleTaskSelect = (task: ApiTaskType) => {
    setSelectedTaskId(task.id);
    setAboveInputContent("taskInputs");
    // Khởi tạo selectedTaskInputs với giá trị mặc định từ execution_config
    const initialInputs: { [key: string]: string } = {};
    if (task.execution_config) {
      Object.keys(task.execution_config).forEach((key) => {
        initialInputs[key] = String(task.execution_config[key] ?? "");
      });
    }
    setSelectedTaskInputs(initialInputs);
    // Reset trạng thái thực thi khi chọn task mới
    setTaskExecutionStatus((prev) => ({ ...prev, [task.id]: "idle" }));
  };

  const handleInputChange = (inputId: string, value: string) => {
    setSelectedTaskInputs((prev) => ({
      ...prev,
      [inputId]: value,
    }));
  };
  // Fetch threads for the current workspace
  const {
    data: threadsData,
    isLoading: isLoadingThreads,
    error: threadsError,
  } = useQuery({
    queryKey: ["threads", agentId],
    queryFn: () => getThreadByAgentId(agentId),
    enabled: !!agentId,
  });
  // Handle New Chat action
  const handleNewChat = async (agentId: string | undefined) => {
    if (!agentId) {
      toast({
        title: "Lỗi!",
        description: "Không tìm thấy Agent ID.",
        variant: "destructive",
      });
      return;
    }

    if (!workspace?.id) {
      toast({
        title: "Lỗi!",
        description: "Không tìm thấy Workspace ID.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingThread(true); // Start loading
    setIsThreadCreationInProgress(true); // Ngăn chặn tạo thread đồng thời

    // Close mobile sidebar on thread click (already there, keep it)
    setShowMobileSidebar(false);

    try {
      const newThread = await createThread({
        agent_id: agentId,
        workspace_id: workspace.id,
        title: "",
      });
      if (newThread?.data?.id) {
        // Cập nhật state trước khi navigate
        setCurrentThread(newThread.data.id);

        // ** Lấy messages từ response backend và format lại **
        const initialMessages: ChatMessage[] = (newThread.data.messages || [])
          .map((msg) => ({
            id: msg.id,
            content: msg.message_content,
            sender: msg.sender_type,
            timestamp: msg.created_at,
            agentId: msg.sender_agent_id,
            image_urls: msg.image_urls,
            ...(msg.file_urls ? { file_urls: msg.file_urls } : {}), // <--- thêm dòng này
            parent_message_id: msg.parent_message_id,
          }))
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

        setMessages(initialMessages); // Sử dụng messages từ backend

        // Thêm tin nhắn chào mừng nếu không có tin nhắn ban đầu
        if (initialMessages.length === 0 && currentAgent?.greeting_message) {
          const welcomeMessage: ChatMessage = {
            id: Date.now().toString(),
            content:
              currentAgent.greeting_message || "Hello! How can I help you?",
            sender: "agent",
            timestamp: new Date().toISOString(),
            agentId: currentAgent.id,
            image_urls: currentAgent.image_urls,
            file_url: currentAgent.file_url,
          };
          setMessages([welcomeMessage]);
        }

        // Không cần navigateToAgentChat vì đã ở đúng trang
        // navigateToAgentChat(agentId);

        // Cập nhật URL không reload trang
        window.history.replaceState(null, "", `/dashboard/agents/${agentId}`);

        // Cập nhật danh sách threads trong sidebar
        queryClient.invalidateQueries({ queryKey: ["threads", agentId] });

        setIsCreatingThread(false); // End loading on success
        setIsThreadCreationInProgress(false); // Reset state

        // Hiển thị thông báo thành công
        toast({
          title: "Thành công!",
          description: "Đã tạo cuộc hội thoại mới.",
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo thread mới:", error);
      toast({
        title: "Lỗi!",
        description: `Không thể tạo cuộc hội thoại mới: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
      setIsCreatingThread(false); // End loading on error
      setIsThreadCreationInProgress(false); // Reset state
    }
  };
  const handleRetryTask = async (runToRetry: TaskRun) => {
    if (!currentThread) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy Thread ID hiện tại.",
        variant: "destructive",
      });
      return;
    }

    console.log(
      `Retrying task: ${runToRetry.task_id} with input:`,
      runToRetry.input_data
    );

    // Hiển thị toast cho người dùng biết
    toast({
      title: "Đang thử lại Task...",
      description: `Đang gửi lại yêu cầu cho task ID: ${runToRetry.task_id}`,
    });

    try {
      // Gọi lại API executeTask với dữ liệu của lần chạy lỗi
      const response = await executeTask(
        runToRetry.task_id,
        runToRetry.input_data,
        currentThread
      );
      const newRunId = response.task_run_id;

      if (newRunId) {
        // Tạo một TaskRun mới cho lần thử lại này
        const newTaskRun: TaskRun = {
          id: newRunId,
          task_id: runToRetry.task_id,
          status: "initiated", // Bắt đầu với trạng thái initiated
          start_time: new Date().toISOString(),
          input_data: runToRetry.input_data, // Dùng lại input cũ
          output_data: {},
          started_at: new Date().toISOString(),
          thread_id: currentThread,
          user_id: "", // Lấy từ context hoặc localStorage nếu cần
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Thêm task mới vào đầu danh sách để người dùng thấy ngay
        setTaskRunItems((prevRuns) => [newTaskRun, ...prevRuns]);

        // Đảm bảo bảng lịch sử vẫn đang mở để xem kết quả
        setShowTaskHistory(true);
      } else {
        toast({
          title: "Lỗi Phản Hồi",
          description: "Phản hồi từ server không chứa run ID.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi Thực Thi",
        description: "Không thể bắt đầu lại task.",
        variant: "destructive",
      });
    }
  };
  const handleSubmitTaskInputs = async () => {
    const selectedTask = tasks.find((t) => t.id === selectedTaskId);
    if (selectedTask && currentThread) {
      try {
        const extra: any = {};
        if (selectedCredentialId) {
          const cred = credentials.find(
            (c) => String(c.id) === selectedCredentialId
          );
          if (cred) {
            extra.provider = cred.provider;
            extra.credential = cred.credential;
          }
        }
        const response = await executeTask(
          selectedTask.id,
          selectedTaskInputs,
          currentThread,
          extra
        );
        const runId = response.task_run_id;

        if (runId) {
          const newTaskRun: TaskRun = {
            id: runId,
            task_id: selectedTask.id,
            status: "initiated",
            start_time: new Date().toISOString(),
            input_data: selectedTaskInputs,
            output_data: {},
            started_at: new Date().toISOString(),
            thread_id: currentThread,
            user_id: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Thêm task mới vào ĐẦU danh sách và tự động mở bảng lịch sử
          setTaskRunItems((prevRuns) => [newTaskRun, ...prevRuns]);
          setShowTaskHistory(true);
        } else {
          toast({
            title: "Lỗi Phản Hồi",
            description: "Phản hồi từ server không chứa run ID.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Lỗi Thực Thi",
          description: "Không thể bắt đầu task.",
          variant: "destructive",
        });
      }
      setAboveInputContent("none");
      setSelectedCredentialId("");
    }
  };
  const handleThreadClick = async (threadId: string) => {
    if (!agentId) {
      // Xử lý trường hợp agentId chưa được load hoặc không tồn tại
      console.error("Agent ID is not available.");
      toast({
        title: "Lỗi!",
        description: "Không tìm thấy Agent ID.",
        variant: "destructive",
      });
      return;
    }
    // Close mobile sidebar on thread click
    setShowMobileSidebar(false); // Thêm dòng này để đóng sidebar mobile

    try {
      // Fetch messages for the clicked thread
      const messagesResponse = await getThreadMessages(threadId);
      // Map API response (ApiMessage[]) to ChatMessage type and sort
      const formattedMessages: ChatMessage[] = (
        messagesResponse.data && Array.isArray(messagesResponse.data)
          ? messagesResponse.data
          : []
      )
        .map((msg) => ({
          id: msg.id,
          content: msg.message_content,
          sender: msg.sender_type,
          timestamp: msg.created_at,
          agentId: msg.sender_agent_id,
          image_urls: msg.image_urls,
          ...(msg.file_urls ? { file_urls: msg.file_urls } : {}), // <--- thêm dòng này
          parent_message_id: msg.parent_message_id,
        }))
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

      // Update the state with messages from the clicked thread
      if (formattedMessages.length === 0 && currentAgent?.greeting_message) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          content:
            currentAgent.greeting_message || "Hello! How can I help you?",
          sender: "agent",
          timestamp: new Date().toISOString(),
          agentId: currentAgent.id,
          image_urls: currentAgent.image_urls,
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(formattedMessages);
      }
      // Update the currentThread state
      setCurrentThread(threadId);

      // Reset initialization flag khi chuyển thread
      hasInitializedRef.current = true;

      // Navigate to the thread-specific URL
      // This will also trigger the main useEffect if the URL changes
      // navigate(`/dashboard/agents/${agentId}/${threadId}`); // Xóa hoặc comment dòng này
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn cho thread:", threadId, error);
      toast({
        title: "Lỗi!",
        description: `Không thể tải cuộc hội thoại: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
      // Optionally, clear messages or show an empty state if loading fails
      setMessages([]);
      setCurrentThread(threadId); // Set threadId anyway so WS might connect, but messages are empty
      // Reset initialization flag khi chuyển thread (ngay cả khi có lỗi)
      hasInitializedRef.current = true;
      // navigate(`/dashboard/agents/${agentId}/${threadId}`); // Xóa hoặc comment dòng này
    }
  };

  // Initialize useNavigate
  const navigate = useNavigate();

  // Helper function for navigation
  const navigateToAgentChat = (agentId: string) => {
    if (agentId) {
      navigate(`/dashboard/agents/${agentId}?fromProfile=true`);
    }
  };

  const { t } = useLanguage();

  useEffect(() => {
    const runsFromApi = historyData?.data;

    // Chỉ cập nhật từ API nếu có dữ liệu mới và state đang rỗng hoặc khi có cập nhật từ API
    if (runsFromApi && Array.isArray(runsFromApi)) {
      console.log(
        `[AgentChat] Nhận được ${runsFromApi.length} task runs từ API`
      );
      // Ánh xạ lại dữ liệu để chuẩn hóa thuộc tính lỗi
      const mappedRuns = runsFromApi.map((run) => ({
        ...run,
        // Logic này sẽ tìm tuần tự để đảm bảo luôn lấy được lỗi
        // Ưu tiên `run.error` -> rồi đến error trong output_data nếu có
        error:
          run.error ||
          (run.output_data &&
          typeof run.output_data === "object" &&
          "error_message" in run.output_data
            ? String(run.output_data.error_message)
            : undefined),
        // Thêm trường để force re-render
        _lastUpdate: Date.now(),
      }));

      // Sắp xếp dữ liệu đã được chuẩn hóa
      const sortedRuns = [...mappedRuns].sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );

      // Hợp nhất dữ liệu mới và dữ liệu hiện tại dựa vào ID
      // Ưu tiên dữ liệu từ taskRunItems vì có thể được cập nhật từ websocket
      const mergedRuns = sortedRuns.map((apiRun) => {
        const localRun = taskRunItems.find((item) => item.id === apiRun.id);
        if (localRun) {
          // Nếu dữ liệu local mới hơn, thì ưu tiên sử dụng local
          if (
            new Date(localRun.updated_at).getTime() >
            new Date(apiRun.updated_at).getTime()
          ) {
            console.log(
              `Sử dụng dữ liệu local cho Task ID ${apiRun.id} vì mới hơn`
            );
            return localRun;
          }
        }
        return apiRun;
      });

      // Kiểm tra xem có run mới trong taskRunItems nhưng chưa có trong API
      const additionalRuns = taskRunItems.filter(
        (localRun) => !sortedRuns.some((apiRun) => apiRun.id === localRun.id)
      );

      // Kết hợp và sắp xếp lại tất cả
      const combinedRuns = [...additionalRuns, ...mergedRuns].sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );

      console.log(
        `[AgentChat] Cập nhật taskRunItems với ${combinedRuns.length} task runs sau khi merge`
      );
      setTaskRunItems(combinedRuns);
    }
  }, [historyData]);

  const [showPromptTemplatesModal, setShowPromptTemplatesModal] =
    useState(false);

  // Handle selecting a prompt template
  const handleSelectPrompt = (renderedPrompt: string) => {
    setMessage(renderedPrompt);
  };

  // Helper: kiểm tra thread hiện tại đã có tin nhắn user chưa
  const hasUserMessage = messages.some((msg) => msg.sender === "user");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputAutoGrow = (
    e?:
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.FormEvent<HTMLTextAreaElement>
  ) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<
    { url: string; type: string; name: string; size: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const validFiles: File[] = [];
    const previews: {
      url: string;
      type: string;
      name: string;
      size: string;
    }[] = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File quá lớn",
          description: `File ${file.name} vượt quá 10MB, vui lòng chọn file nhỏ hơn.`,
        });
        continue;
      }
      validFiles.push(file);
      const fileSize =
        file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      previews.push({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        size: fileSize,
      });
    }
    setUploadedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveFile = (idx: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
    setFilePreviews((prev) => prev.filter((_, i) => i !== idx));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const newFiles: File[] = [];
    const newPreviews: {
      url: string;
      type: string;
      name: string;
      size: string;
    }[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          if (file.size > 10 * 1024 * 1024) continue;
          newFiles.push(file);
          const fileSize =
            file.size < 1024 * 1024
              ? `${(file.size / 1024).toFixed(1)} KB`
              : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
          newPreviews.push({
            url: URL.createObjectURL(file),
            type: file.type,
            name: file.name,
            size: fileSize,
          });
        }
      }
    }
    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setFilePreviews((prev) => [...prev, ...newPreviews]);
      e.preventDefault();
    }
  };

  useEffect(() => {
    // Fetch credentials khi mở form thực thi task
    if (aboveInputContent === "taskInputs") {
      setLoadingCredentials(true);
      getCredentials()
        .then((res) => {
          setCredentials(Array.isArray(res) ? res : res.data || []);
        })
        .catch(() => setCredentials([]))
        .finally(() => setLoadingCredentials(false));
    }
  }, [aboveInputContent]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const [messageLogs, setMessageLogs] = useState<Record<string, any[][]>>({});
  const [loadingLog, setLoadingLog] = useState<Record<string, boolean>>({});

  // Thêm hàm fetch log khi click:
  const handleShowLog = async (agentMsgId: string, userMsgId: string) => {
    // Không làm gì cả, vì log đã được fetch toàn bộ theo thread_id
    return;
  };

  // Tự động focus lại input chat khi agent trả lời xong
  useEffect(() => {
    if (!isAgentThinking && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAgentThinking]);

  const [isCreditError, setIsCreditError] = useState(false);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);

  const [showDeleteThreadModal, setShowDeleteThreadModal] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  // Helper: Lấy tên file từ URL
  function getFileName(url?: string) {
    if (!url) return "";
    const lastSlash = url.lastIndexOf("/");
    let name = url.substring(lastSlash + 1);
    // Nếu có dấu _ thì lấy phần sau cùng (tên gốc)
    const lastUnderscore = name.lastIndexOf("_");
    if (lastUnderscore !== -1) {
      name = name.substring(lastUnderscore + 1);
    }
    return decodeURIComponent(name);
  }

  // Helper: Xác định loại file từ tên file
  function getFileTypeLabel(fileName: string) {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["pdf"].includes(ext)) return "PDF";
    if (["doc", "docx"].includes(ext)) return "Document";
    if (["xls", "xlsx"].includes(ext)) return "Spreadsheet";
    if (["ppt", "pptx"].includes(ext)) return "Presentation";
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
      return "Image";
    if (["txt", "md", "csv"].includes(ext)) return "Text file";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "Archive";
    return "File";
  }

  // Helper: Xác định màu và label icon theo loại file
  function getFileIconProps(fileName: string) {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["pdf"].includes(ext)) return { color: "bg-red-500", label: "PDF" };
    if (["doc", "docx"].includes(ext))
      return { color: "bg-blue-500", label: "DOC" };
    if (["xls", "xlsx"].includes(ext))
      return { color: "bg-green-500", label: "XLS" };
    if (["ppt", "pptx"].includes(ext))
      return { color: "bg-orange-500", label: "PPT" };
    if (["txt", "md", "csv"].includes(ext))
      return { color: "bg-gray-500", label: "TXT" };
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
      return { color: "bg-yellow-500", label: "ZIP" };
    if (["json"].includes(ext)) return { color: "bg-pink-500", label: "JSON" };
    return { color: "bg-pink-500", label: "FILE" };
  }

  // Thay đổi: fetch toàn bộ log pairs khi có threadId
  useEffect(() => {
    if (!currentThread || messages.length === 0) return;
    (async () => {
      try {
        const res = await getSubflowLogPairs(currentThread);
        // res.data là mảng các object { message_id, execute_logs: [], result_logs: [] }
        if (Array.isArray(res?.data)) {
          const logMap: Record<string, any[]> = {};
          res.data.forEach((item: any) => {
            const logs: any[] = [];
            if (Array.isArray(item.execute_logs)) {
              logs.push(
                ...item.execute_logs.map((l) => ({ ...l, is_result: false }))
              );
            }
            if (Array.isArray(item.result_logs)) {
              logs.push(
                ...item.result_logs.map((l) => ({ ...l, is_result: true }))
              );
            }
            // Sắp xếp logs theo thời gian
            logs.sort((a, b) => {
              const timeA = new Date(
                a.timestamp || a.created_at || 0
              ).getTime();
              const timeB = new Date(
                b.timestamp || b.created_at || 0
              ).getTime();
              return timeA - timeB;
            });
            if (logs.length > 0 && item.message_id) {
              logMap[item.message_id] = logs;
            }
          });
          setMessageLogs(logMap); // luôn cập nhật lại messageLogs khi currentThread thay đổi
        } else {
          setMessageLogs({});
        }
      } catch (e) {
        setMessageLogs({});
      }
    })();
  }, [currentThread, messages.length]);

  const [realtimeLogs, setRealtimeLogs] = useState<
    Record<string, { execute?: any; result?: any }>
  >({});

  // Normalize messageLogs để loại bỏ duplicate log nếu có dữ liệu cũ dạng mảng các mảng
  useEffect(() => {
    setMessageLogs((prev) => {
      const newLogs: Record<string, any[]> = {};
      for (const key in prev) {
        if (Array.isArray(prev[key]) && Array.isArray(prev[key][0])) {
          // Nếu là mảng các mảng, gộp lại thành 1 mảng logs duy nhất
          newLogs[key] = prev[key].flat();
        } else {
          newLogs[key] = prev[key];
        }
      }
      return newLogs;
    });
  }, []);

  // State knowledge
  const [knowledgeList, setKnowledgeList] = useState<any[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string[]>([]);
  const [viewKnowledge, setViewKnowledge] = useState<any | null>(null);

  // Fetch knowledge theo agent và workspace
  useEffect(() => {
    const fetchKnowledge = async () => {
      if (!currentAgent?.id || !workspace?.id) return;
      setIsLoadingKnowledge(true);
      try {
        const res = await listKnowledge({
          agent_id: currentAgent.id,
          workspace_id: workspace.id,
          status: "main",
        });
        if (res.success) {
          setKnowledgeList(res.data || []);
        } else {
          setKnowledgeList([]);
        }
      } catch (err) {
        setKnowledgeList([]);
      } finally {
        setIsLoadingKnowledge(false);
      }
    };
    fetchKnowledge();
    setSelectedKnowledgeId(null); // Reset khi đổi agent
  }, [currentAgent?.id, workspace?.id]);

  const handleSavePlan = async (msg: ChatMessage) => {
    try {
      await saveAgentPlan({
        agent_role: currentAgent?.role_description || "",
        sessionId: currentThread || "",
        user_id: user?.id || "",
        parent_message_id: msg.parent_message_id || "",
        thread_id: currentThread || "",
        agent_tool_calling: "",
        agent_tool_executing: "",
        subflow_id: "",
        sender_id: "exa",
        receiver_id: "danma",
        workspace_id: workspace?.id || "",
        agent_id: currentAgent?.id || "",
        is_save_plan: "true",
        content: msg.content || "",
      });
      toast({
        title: "Đã lưu kế hoạch/câu trả lời thành công",
        variant: "default",
      });
    } catch (err: any) {
      toast({
        title: "Lưu kế hoạch/câu trả lời thất bại",
        description: err?.message || String(err),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
      {/* Sidebar overlay cho mobile */}
      {showMobileSidebar && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-64 z-50 primary-gradient border-r flex flex-col md:hidden">
            <button
              className="absolute top-4 right-4 z-50 p-2 bg-gray-100 dark:bg-slate-800 rounded-full border"
              onClick={() => setShowMobileSidebar(false)}
              aria-label="Đóng"
            >
              ×
            </button>
            {/* Nội dung sidebar cũ */}
            {isLoading ? (
              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b flex items-center space-x-3">
                  <div className="h-10 w-10 flex items-center justify-center">
                    {currentAgent?.avatar ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: currentAgent.avatar,
                        }}
                        style={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: createAvatar(adventurer, {
                            seed: currentAgent?.name || "Agent",
                          }).toString(),
                        }}
                        style={{ width: 40, height: 40 }}
                      />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {currentAgent?.name || "Agent"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {currentAgent?.role_description || "AI Assistant"}
                    </p>
                  </div>
                </div>
                <div className="p-4 border-b hover:primary-gradient ">
                  <Button
                    variant="primary"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={() => handleNewChat(currentAgent?.id)}
                    disabled={
                      isCreatingThread ||
                      isThreadCreationInProgress ||
                      isLoading
                    }
                  >
                    {isCreatingThread || isThreadCreationInProgress ? (
                      <span className="loading-spinner animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></span>
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span>
                      {isCreatingThread || isThreadCreationInProgress
                        ? "Creating..."
                        : "New chat"}
                    </span>
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 text-white">
                  {Array.isArray(threadsData?.data) ? (
                    threadsData.data.map((thread, index, arr) => (
                      <div key={thread.id}>
                        <div className="p-3 rounded-lg hover:bg-muted cursor-pointer">
                          <Button
                            variant="primary"
                            className="text-sm font-medium"
                            onClick={() => handleThreadClick(thread.id)}
                          >
                            {thread.title ? thread.title : "New chat"}
                          </Button>
                        </div>
                        {index < arr.length - 1 && (
                          <div className="border-b border-muted-foreground/20 my-2"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-2">
                      Không có cuộc hội thoại nào
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>
        </>
      )}

      {/* Sidebar luôn hiện ở PC */}
      <aside className="w-64 flex-shrink-0 border-r dark:bg-primary-white  flex flex-col hidden md:flex">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center space-x-3">
              <div className="h-10 w-10 flex items-center justify-center">
                {currentAgent?.avatar ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: currentAgent.avatar }}
                    style={{ width: 40, height: 40 }}
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: createAvatar(adventurer, {
                        seed: currentAgent?.name || "Agent",
                      }).toString(),
                    }}
                    style={{ width: 40, height: 40 }}
                  />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {currentAgent?.name || "Agent"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {currentAgent?.role_description}
                </p>
              </div>
            </div>
            <div className="p-4 border-b flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`
                        flex-1 h-10 rounded-xl border border-primary flex items-center justify-center space-x-2 px-6
                        bg-transparent
                        dark:bg-transparent dark:text-primary-foreground dark:shadow-2xl dark:border-primary
                      `}
                      onClick={() => handleNewChat(currentAgent?.id)}
                      disabled={
                        isCreatingThread ||
                        isThreadCreationInProgress ||
                        isLoading ||
                        (!!currentThread && !hasUserMessage)
                      }
                    >
                      {isCreatingThread || isThreadCreationInProgress ? (
                        <span className="loading-spinner animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></span>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span
                        className={cn(
                          isCreatingThread || isThreadCreationInProgress
                            ? " text-primary-text"
                            : " text-primary-text"
                        )}
                      >
                        {isCreatingThread || isThreadCreationInProgress
                          ? "Creating..."
                          : "New chat"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Tạo cuộc trò chuyện mới
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
              {Array.isArray(threadsData?.data) ? (
                threadsData.data.map((thread) => {
                  const isActive = currentThread === thread.id;
                  return (
                    <a
                      key={thread.id}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleThreadClick(thread.id);
                      }}
                      className={cn(
                        "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "dark:bg-zinc-800 text-zinc-50 bg-primary "
                          : "dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      <span className="truncate">
                        {thread.title || "New chat"}
                      </span>
                      {user?.id === thread.user_id && (
                        <div className="opacity-0 transition-opacity group-hover:opacity-100 ">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-zinc-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setThreadToDelete(thread.id);
                              setShowDeleteThreadModal(true);
                            }}
                            aria-label="Xóa cuộc trò chuyện"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-destructive"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 6h18M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                              />
                            </svg>
                          </Button>
                        </div>
                      )}
                    </a>
                  );
                })
              ) : (
                <div className="text-center p-2 text-zinc-500">
                  Không có cuộc hội thoại nào
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background md:w-[calc(100%-256px)]">
        {isLoading ? (
          <div className="flex-1 p-4 space-y-4">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <div className="flex items-start justify-end space-x-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ) : (
          <>
            {/* Chat area */}
            {/* Chat area -- BẮT ĐẦU VÙNG THAY THẾ */}

            <div
              ref={chatContainerRef}
              className={cn(
                "flex-1 min-h-0 p-3 md:p-4 overflow-y-auto space-y-4 md:space-y-5 bg-background  no-scrollbar ",
                aboveInputContent !== "none" ? "pb-[200px]" : "pb-[120px]"
              )}
            >
              {/* 1. Card tri thức dưới câu chào agent */}
              {messages.length > 0 && messages[0].sender === "agent" && (
                <div className="mb-2">
                  <div className="font-semibold text-base mb-2 text-foreground">
                    Tri thức liên quan
                  </div>
                  {isLoadingKnowledge ? (
                    <div className="text-muted-foreground text-sm">
                      Đang tải tri thức...
                    </div>
                  ) : knowledgeList.length === 0 ? (
                    <div className="text-muted-foreground text-sm">
                      Không có tri thức nào
                    </div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {knowledgeList.slice(0, 5).map((item) => {
                        const isSelected = selectedKnowledgeId === item.id;
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "relative min-w-[220px] max-w-xs flex-shrink-0 cursor-pointer group",
                              isSelected
                                ? "ring-2 ring-primary border-primary bg-primary/10"
                                : "border border-primary/30 bg-card text-card-foreground",
                              "rounded-xl transition-all duration-150 shadow-md"
                            )}
                            onClick={() => setSelectedKnowledgeId(item.id)}
                          >
                            {/* Radio chọn */}
                            <div className="absolute top-2 left-2 z-10">
                              <span
                                className={cn(
                                  "inline-block w-4 h-4 rounded-full border-2",
                                  isSelected
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground bg-background"
                                )}
                              />
                            </div>
                            {/* Nút xem */}
                            <button
                              className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-accent/30"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewKnowledge(item);
                              }}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <Card className="border-0 shadow-none bg-transparent">
                              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <CardTitle
                                  className="text-base font-semibold truncate"
                                  title={item.title}
                                >
                                  {item.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0 pb-2">
                                <div className="text-xs text-muted-foreground line-clamp-3 mb-1">
                                  {item.preview ? (
                                    item.preview
                                  ) : (
                                    <span className="italic">
                                      Không có preview
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-foreground font-medium">
                                  Trạng thái:{" "}
                                  <span className="capitalize">
                                    {item.status}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Modal xem chi tiết knowledge */}
                  <Dialog
                    open={!!viewKnowledge}
                    onOpenChange={(open) => !open && setViewKnowledge(null)}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Chi tiết tri thức</DialogTitle>
                      </DialogHeader>
                      {viewKnowledge && (
                        <div className="space-y-2">
                          <div className="font-semibold text-lg">
                            {viewKnowledge.title}
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-pre-line">
                            {viewKnowledge.preview ? (
                              viewKnowledge.preview
                            ) : (
                              <span className="italic">Không có preview</span>
                            )}
                          </div>
                          <div className="text-sm">
                            Trạng thái:{" "}
                            <span className="capitalize font-medium">
                              {viewKnowledge.status}
                            </span>
                          </div>
                          {viewKnowledge.file_url && (
                            <a
                              href={viewKnowledge.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline text-sm"
                            >
                              Tải file
                            </a>
                          )}
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setViewKnowledge(null)}
                        >
                          Đóng
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              {/* 2. Vòng lặp hiển thị tin nhắn (giữ nguyên) */}
              {messages.slice(-50).map((msg, idx) => {
                if (msg.sender === "agent") {
                  // Chỉ fetch log nếu có parent_message_id, nhưng luôn render message agent
                  const userMsgId = msg.parent_message_id;
                  // Ưu tiên lấy log theo msg.id, nếu không có thì thử lấy theo parent_message_id
                  const logArrs =
                    messageLogs[msg.id] ||
                    (userMsgId ? messageLogs[userMsgId] : undefined);
                  const realtimePair =
                    realtimeLogs[msg.id] ||
                    (userMsgId ? realtimeLogs[userMsgId] : undefined);
                  return (
                    <AgentMessageWithLog
                      key={msg.id}
                      msg={msg}
                      userMsgId={userMsgId}
                      messageLogs={messageLogs}
                      loadingLog={loadingLog}
                      handleShowLog={handleShowLog}
                    >
                      <div className="flex items-end gap-2 justify-start">
                        {/* Avatar agent bên trái */}
                        <div className="h-9 w-9 flex-shrink-0 self-start mt-1">
                          {currentAgent?.avatar ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: currentAgent.avatar,
                              }}
                              style={{ width: 36, height: 36 }}
                            />
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: createAvatar(adventurer, {
                                  seed: currentAgent?.name || "Agent",
                                }).toString(),
                              }}
                              style={{ width: 36, height: 36 }}
                            />
                          )}
                        </div>
                        {/* Bubble agent */}
                        <div
                          className={cn(
                            "max-w-[85%] md:max-w-[75%] p-3 rounded-2xl shadow-sm relative",
                            "dark:bg-[#23272f] light:bg-gradient-light text-foreground rounded-bl-lg",
                            "whitespace-normal"
                          )}
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {/* Log subflow nếu có */}
                          {msg.sender === "agent" &&
                          !msg.isStreaming &&
                          Array.isArray(logArrs) &&
                          logArrs.length > 0 ? (
                            <div className="border border-blue-400 dark:border-blue-700 rounded-2xl shadow-md p-2 mb-2 bg-blue-50 dark:bg-blue-900/20 max-h-[30rem] overflow-y-auto no-scrollbar">
                              <LogAgentThinking logs={logArrs} />
                            </div>
                          ) : (
                            realtimePair &&
                            ((realtimePair.execute &&
                              realtimePair.execute.content) ||
                              (realtimePair.result &&
                                realtimePair.result.content)) &&
                            (() => {
                              const logs = [
                                realtimePair.execute &&
                                realtimePair.execute.content
                                  ? {
                                      ...realtimePair.execute,
                                      is_result:
                                        realtimePair.execute.log_type ===
                                        "result"
                                          ? true
                                          : false,
                                    }
                                  : null,
                                realtimePair.result &&
                                realtimePair.result.content
                                  ? {
                                      ...realtimePair.result,
                                      is_result:
                                        realtimePair.result.log_type ===
                                        "result"
                                          ? true
                                          : false,
                                    }
                                  : null,
                              ]
                                .filter(Boolean)
                                .sort((a, b) => {
                                  const timeA = new Date(
                                    a.timestamp || a.created_at || 0
                                  ).getTime();
                                  const timeB = new Date(
                                    b.timestamp || b.created_at || 0
                                  ).getTime();
                                  return timeA - timeB;
                                });
                              return logs.length > 0 ? (
                                <div className="border border-blue-400 dark:border-blue-700 rounded-2xl shadow-md p-2 mb-2 bg-blue-50 dark:bg-blue-900/20 max-h-48 overflow-y-auto no-scrollbar">
                                  <LogAgentThinking
                                    logs={logs}
                                    isCollapsed={true}
                                  />
                                </div>
                              ) : null;
                            })()
                          )}
                          {/* Hiển thị ảnh agent_res nếu có */}
                          {(() => {
                            if (isAgentResImageObject(msg.content)) {
                              const url = getAgentResImageUrl(msg.content);
                              return url ? (
                                <div className="flex flex-col items-center gap-2">
                                  <img
                                    src={url}
                                    alt="Ảnh kết quả"
                                    className="max-w-xs rounded shadow mx-auto"
                                  />
                                </div>
                              ) : null;
                            }
                            return (
                              <ChatMessageContent
                                content={msg.content}
                                isAgent={true}
                                stream={msg.isStreaming ?? false}
                                images={msg.image_urls}
                                onSavePlan={() => handleSavePlan(msg)}
                              />
                            );
                          })()}

                          {(msg.image_urls ||
                            msg.file_urls ||
                            msg.file_url) && (
                            <div className="mt-2">
                              {msg.image_urls ? (
                                // Hiển thị ảnh
                                <div className="flex flex-wrap gap-2">
                                  {msg.image_urls.map((url, index) => (
                                    <img
                                      key={index}
                                      src={url}
                                      alt="uploaded image"
                                      className="max-w-xs rounded-lg"
                                    />
                                  ))}
                                </div>
                              ) : msg.file_urls &&
                                Array.isArray(msg.file_urls) ? (
                                // Hiển thị nhiều file
                                <div className="flex flex-row gap-2 mt-2 overflow-x-auto max-w-full">
                                  {msg.file_urls.map((url, index) => {
                                    const fileName = getFileName(url);
                                    const fileType = getFileTypeLabel(fileName);
                                    return (
                                      <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-32 min-w-0"
                                        style={{ textDecoration: "none" }}
                                      >
                                        <div className="flex flex-col items-center p-2 bg-background/80 rounded-lg border border-border shadow-sm hover:border-primary transition">
                                          <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center mb-1">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="w-6 h-6 text-white"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                                              />
                                            </svg>
                                          </div>
                                          <div className="text-xs font-semibold truncate w-full text-center">
                                            {fileName}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground text-center">
                                            {fileType}
                                          </div>
                                        </div>
                                      </a>
                                    );
                                  })}
                                </div>
                              ) : msg.file_url ? (
                                (() => {
                                  const fileName = getFileName(msg.file_url);
                                  const fileType = getFileTypeLabel(fileName);
                                  return (
                                    <a
                                      href={msg.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block max-w-xs"
                                      style={{ textDecoration: "none" }}
                                    >
                                      <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg border border-border shadow-sm hover:border-primary transition">
                                        <div className="flex-shrink-0">
                                          {/* Icon document màu hồng */}
                                          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="w-5 h-5 text-white"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                                              />
                                            </svg>
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-semibold truncate">
                                            {fileName}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {fileType}
                                          </div>
                                        </div>
                                      </div>
                                    </a>
                                  );
                                })()
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Timestamp agent */}
                      <div className="px-12 text-xs text-muted-foreground select-none mt-1 text-left">
                        <span>
                          {msg.timestamp &&
                            new Date(msg.timestamp).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }
                            )}
                        </span>
                      </div>
                    </AgentMessageWithLog>
                  );
                }
                // Message user
                return (
                  <div key={msg.id} className="flex flex-col">
                    <div className="flex items-end gap-2 justify-end">
                      {/* Bubble user */}
                      <div
                        className={cn(
                          "max-w-[85%] md:max-w-[75%] p-3 rounded-2xl shadow-sm relative",
                          "bg-gradient-light dark:bg-gradient-dark text-white rounded-br-lg",
                          "whitespace-normal"
                        )}
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        <ChatMessageContent
                          content={msg.content}
                          isAgent={false}
                          stream={msg.isStreaming ?? false}
                          images={
                            Array.isArray(msg.image_urls)
                              ? msg.image_urls
                              : undefined
                          }
                        />
                        {/* Hiển thị file đã upload nếu có */}
                        {msg.file_urls && Array.isArray(msg.file_urls) && (
                          <div className="mt-2 flex flex-col gap-2">
                            {msg.file_urls.map((url, index) => {
                              const fileName = getFileName(url);
                              const fileType = getFileTypeLabel(fileName);
                              return (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block max-w-xs"
                                  style={{ textDecoration: "none" }}
                                >
                                  <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg border border-border shadow-sm hover:border-primary transition">
                                    <div className="flex-shrink-0">
                                      <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="w-5 h-5 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-semibold truncate">
                                        {fileName}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {fileType}
                                      </div>
                                    </div>
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {/* Avatar user bên phải */}
                      <Avatar className="h-9 w-9 flex-shrink-0 self-start mt-1">
                        <AvatarFallback className="font-bold button-gradient-light dark:button-gradient-dark text-white">
                          U
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {/* Timestamp user */}
                    <div className="px-12 text-xs text-muted-foreground select-none mt-1 text-right">
                      <span>
                        {msg.timestamp &&
                          new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {showTaskHistory && (
              // Lớp phủ màu đen mờ phía sau
              <div
                className="absolute inset-0 z-30 bg-background/80 backdrop-blur-sm flex items-center justify-center"
                onClick={() => setShowTaskHistory(false)} // Nhấn ra ngoài để đóng
              >
                {/* Panel Lịch sử */}
                <div
                  className="relative flex flex-col h-[90%] max-h-[800px] w-[95%] max-w-4xl bg-card border rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()} // Ngăn việc nhấn vào panel làm đóng modal
                >
                  {/* 1. Header của Panel */}
                  <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                    <h2 className="text-xl font-bold">Lịch sử thực thi Task</h2>
                    {/* NÚT ĐÓNG MỚI */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowTaskHistory(false)}
                      aria-label="Đóng"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* 2. Khu vực nội dung có thể cuộn */}
                  <div className="flex-1 p-1 md:p-4 overflow-y-auto">
                    {isLoadingHistory && taskRunItems.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Đang tải lịch sử...
                      </p>
                    ) : (
                      <TaskHistory
                        runs={taskRunItems}
                        agentId={agentId}
                        onRetry={handleRetryTask}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Area above the main input for Tasks/Knowledge */}
            <div className="p-3 md:p-4 bg-background">
              {/* Task List or Task Inputs */}

              {aboveInputContent === "taskInputs" && selectedTask && (
                <Card className="mb-3 animate-in fade-in-50 duration-300 shadow-xl rounded-2xl border border-border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold">
                        <span className="text-foreground">
                          Điền thông tin cho Task:
                        </span>{" "}
                        <span className="text-primary">
                          {selectedTask.name}
                        </span>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setAboveInputContent("none")}
                      >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Đóng</span>
                      </Button>
                    </div>
                    <CardDescription className="text-base text-muted-foreground mt-1">
                      Vui lòng cung cấp các thông tin cần thiết để thực thi task
                      này.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 max-h-80 overflow-y-auto pr-2">
                    {/* Select credential */}
                    <div className="space-y-1">
                      <Label
                        htmlFor="credential-select"
                        className="font-semibold flex items-center gap-2"
                      >
                        <Key className="h-4 w-4 mr-1 text-primary" />
                        Chọn Credential (nếu cần)
                      </Label>
                      <Select
                        value={selectedCredentialId || "none"}
                        onValueChange={(val) =>
                          setSelectedCredentialId(val === "none" ? "" : val)
                        }
                        disabled={
                          loadingCredentials || credentials.length === 0
                        }
                      >
                        <SelectTrigger className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground">
                          <SelectValue placeholder="Không gửi credential" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            Không gửi credential
                          </SelectItem>
                          {credentials.map((cred) => (
                            <SelectItem key={cred.id} value={cred.id}>
                              {cred.provider.charAt(0).toUpperCase() +
                                cred.provider.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {credentials.length === 0 && (
                        <div className="text-xs text-muted-foreground mt-1 pl-1">
                          Bạn chưa có credential nào, có thể bỏ qua bước này.
                        </div>
                      )}
                    </div>
                    {/* Các input động */}
                    {Object.entries(selectedTask.execution_config ?? {}).map(
                      ([key, defaultValue]) => (
                        <div key={key} className="space-y-1">
                          <Label
                            htmlFor={key}
                            className="capitalize font-semibold flex items-center gap-2"
                          >
                            {key.replace(/_/g, " ")}
                          </Label>
                          <Textarea
                            id={key}
                            value={selectedTaskInputs[key] || ""}
                            onChange={(e) =>
                              handleInputChange(key, e.target.value)
                            }
                            placeholder={`Nhập ${key.replace(/_/g, " ")}...`}
                            className="font-mono text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/40 focus:outline-none transition"
                            rows={key.toLowerCase().includes("script") ? 4 : 2}
                            autoFocus={
                              key ===
                              Object.keys(
                                selectedTask.execution_config ?? {}
                              )[0]
                            }
                          />
                        </div>
                      )
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      className="w-full py-3 text-lg font-semibold flex items-center justify-center gap-2"
                      onClick={handleSubmitTaskInputs}
                    >
                      <Rocket className="mr-2 h-5 w-5" />
                      Bắt đầu thực thi
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Knowledge File Selection (Placeholder) */}
              {aboveInputContent === "knowledge" && (
                <div className="mb-3 p-4 border border-border rounded-lg bg-card text-card-foreground max-h-60 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    Danh sách tri thức
                  </h3>
                  {isLoadingKnowledge ? (
                    <div className="text-muted-foreground text-sm">
                      Đang tải tri thức...
                    </div>
                  ) : knowledgeList.length === 0 ? (
                    <div className="text-muted-foreground text-sm">
                      Không có tri thức nào
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {knowledgeList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`knowledge_${item.id}`}
                            checked={
                              Array.isArray(selectedKnowledgeId)
                                ? selectedKnowledgeId.includes(item.id)
                                : selectedKnowledgeId === item.id
                            }
                            onChange={(e) => {
                              if (Array.isArray(selectedKnowledgeId)) {
                                if (e.target.checked) {
                                  setSelectedKnowledgeId([
                                    ...selectedKnowledgeId,
                                    item.id,
                                  ]);
                                } else {
                                  setSelectedKnowledgeId(
                                    selectedKnowledgeId.filter(
                                      (id) => id !== item.id
                                    )
                                  );
                                }
                              } else {
                                setSelectedKnowledgeId(
                                  e.target.checked ? [item.id] : []
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`knowledge_${item.id}`}
                            className="text-sm text-foreground cursor-pointer flex-1"
                          >
                            <span className="font-medium">{item.title}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              [{item.status}]
                            </span>
                            {item.file_url && (
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-primary underline text-xs"
                              >
                                Tải file
                              </a>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-border mt-4"
                    onClick={() => setAboveInputContent("none")}
                  >
                    Đóng
                  </Button>
                </div>
              )}

              {(() => {
                // Lấy ra tin nhắn cuối cùng trong danh sách
                const lastMessage = messages[messages.length - 1];
                // Kiểm tra xem có phải agent đang trong quá trình streaming hay không
                const isAgentCurrentlyStreaming =
                  lastMessage?.sender === "agent" && lastMessage.isStreaming;

                // Chỉ hiển thị chỉ báo "..." KHI agent đang nghĩ VÀ CHƯA bắt đầu streaming
                if (isAgentThinking && !isAgentCurrentlyStreaming) {
                  return (
                    <AgentTypingIndicator
                      agentName={currentAgent?.name}
                      agentAvatar={currentAgent?.avatar}
                      subflowLogs={subflowLogs}
                    />
                  );
                }

                // Trả về null trong các trường hợp khác
                return null;
              })()}
              {showScrollToBottom && (
                <div className="absolute bottom-28 md:bottom-32 right-6 z-40">
                  <Button
                    size="icon"
                    className="rounded-full h-8 w-8 bg-background/70 backdrop-blur-sm border-2 border-border shadow-lg hover:scale-110 hover:bg-muted/90 transition-all duration-200 animate-in fade-in-50"
                    onClick={() => scrollToBottom("smooth")}
                    aria-label="Cuộn xuống cuối"
                  >
                    <ChevronsDown className="h-2 w-2 text-muted-foreground" />
                  </Button>
                </div>
              )}

              <div className="p-4 bg-background border-t border-border">
                <div className="w-full max-w-4xl mx-auto">
                  <div className="relative">
                    {/* Preview file phía trên input chat */}
                    {filePreviews.length > 0 && (
                      <div className="mb-2 relative flex gap-2 overflow-x-auto max-w-full">
                        {filePreviews.map((preview, idx) => (
                          <div
                            key={idx}
                            className="relative group flex-shrink-0"
                          >
                            {preview.type.startsWith("image/") ? (
                              <img
                                src={preview.url}
                                alt={preview.name}
                                className="w-20 h-20 object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-20 h-20 flex flex-col items-center justify-center bg-muted rounded-lg border p-2">
                                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mb-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                                <div className="text-xs text-center truncate max-w-[64px]">
                                  {preview.name}
                                </div>
                              </div>
                            )}
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-6 w-6 p-0 rounded-full absolute top-1 right-1 opacity-80 group-hover:opacity-100"
                              onClick={() => handleRemoveFile(idx)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-end relative">
                      <Textarea
                        ref={textareaRef}
                        placeholder={t("common.askAI")}
                        className="w-full no-scrollbar rounded-xl border-border bg-background p-4 pr-14 resize-none text-base shadow-sm"
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          handleInputAutoGrow(e);
                        }}
                        onInput={handleInputAutoGrow}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          (e.preventDefault(), handleSendMessage())
                        }
                        rows={1}
                        disabled={
                          isSending || isAgentThinking || !currentThread
                        }
                        style={{ overflow: "auto", maxHeight: "300px" }}
                        onPaste={handlePaste}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full button-gradient-light dark:button-gradient-dark text-white"
                        onClick={handleSendMessage}
                        disabled={
                          !message.trim() ||
                          isSending ||
                          isAgentThinking ||
                          !currentThread
                        }
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {/* Mobile: icon menu và text cảnh báo căn giữa, dọc */}
                    <div className="block md:hidden mt-2 w-full">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Đính kèm tệp"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Chọn Task"
                          onClick={() => setIsTaskModalOpen(true)}
                        >
                          <ListPlus className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Sử dụng Knowledge"
                          onClick={() => setAboveInputContent("knowledge")}
                        >
                          <Book className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Lịch sử thực thi"
                          onClick={() => setShowTaskHistory(true)}
                        >
                          <History className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Gợi ý prompt"
                          onClick={() => setShowPromptTemplatesModal(true)}
                          className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <Lightbulb className="h-5 w-5" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Superb AI có thể mắc lỗi. Hãy kiểm tra các thông tin
                        quan trọng.
                      </p>
                    </div>
                    {/* Desktop: giữ nguyên layout cũ */}
                    <div className="hidden md:flex items-center justify-between mt-2 w-full">
                      {/* Actions trái */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium"
                          title="Đính kèm tệp"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                          <span className="hidden lg:inline text-sm text-muted-foreground">
                            Đính kèm
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium"
                          title="Chọn Task"
                          onClick={() => setIsTaskModalOpen(true)}
                        >
                          <ListPlus className="h-5 w-5 text-muted-foreground" />
                          <span className="hidden lg:inline text-sm text-muted-foreground">
                            Task
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium"
                          title="Knowledge"
                          onClick={() => setAboveInputContent("knowledge")}
                        >
                          <Book className="h-5 w-5 text-muted-foreground" />
                          <span className="hidden lg:inline text-sm text-muted-foreground">
                            Knowledge
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium"
                          title="Lịch sử thực thi"
                          onClick={() => setShowTaskHistory(true)}
                        >
                          <History className="h-5 w-5 text-muted-foreground" />
                          <span className="hidden lg:inline text-sm text-muted-foreground">
                            Lịch sử
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                          title="Gợi ý prompt"
                          onClick={() => setShowPromptTemplatesModal(true)}
                        >
                          <Lightbulb className="h-5 w-5" />
                          <span className="hidden lg:inline text-sm">
                            Gợi ý
                          </span>
                        </Button>
                      </div>
                      {/* Cảnh báo phải */}
                      <p className="text-xs text-muted-foreground whitespace-nowrap ml-4 md:text-wrap md:text-center md:line-clamp-3">
                        Superb AI có thể mắc lỗi. Hãy kiểm tra các thông tin
                        quan trọng.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <TaskSelectionModal
        isOpen={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        tasks={tasks}
        onTaskSelect={handleTaskSelect} // Dùng lại hàm cũ để mở ô nhập liệu
      />
      <PromptTemplatesModal
        open={showPromptTemplatesModal}
        onOpenChange={setShowPromptTemplatesModal}
        agent={currentAgent}
        onSelectPrompt={handleSelectPrompt}
      />
      <input
        type="file"
        accept="*/*"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <AlertDialog open={isCreditError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn đã hết credit</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đã hết credit, vui lòng nạp thêm để tiếp tục sử dụng dịch vụ.
              Chat sẽ tạm dừng cho đến khi bạn nạp thêm credit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsCreditError(false)}>
              Đóng
            </AlertDialogAction>
            <Button
              onClick={() => {
                setIsCreditError(false);
                setShowCreditPurchase(true);
              }}
              className="flex items-center gap-2"
            >
              <Coins className="h-4 w-4" />
              Nạp Credit
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreditPurchaseDialog
        isOpen={showCreditPurchase}
        onClose={() => setShowCreditPurchase(false)}
        onSuccess={(newCreditBalance) => {
          toast({
            title: "Nạp credit thành công",
            description: `Credit mới: ${newCreditBalance}`,
          });
        }}
      />

      {/* AlertDialog xác nhận xóa thread */}
      <AlertDialog
        open={showDeleteThreadModal}
        onOpenChange={setShowDeleteThreadModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Bạn chắc chắn muốn xóa cuộc trò chuyện này?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xóa vĩnh viễn toàn bộ tin nhắn trong cuộc trò
              chuyện này và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              onClick={async () => {
                if (!threadToDelete) return;
                try {
                  await deleteThread(threadToDelete);
                  toast({
                    title: "Đã xóa cuộc trò chuyện",
                    variant: "default",
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["threads", agentId],
                  });
                  if (currentThread === threadToDelete) {
                    setCurrentThread(null);
                    setMessages([]);
                  }
                } catch (err) {
                  toast({
                    title: "Xóa cuộc trò chuyện thất bại",
                    description: String(err),
                    variant: "destructive",
                  });
                } finally {
                  setShowDeleteThreadModal(false);
                  setThreadToDelete(null);
                }
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgentChat;

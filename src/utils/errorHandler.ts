import { WorkspaceError } from "../types";
import { toast } from "../components/ui/use-toast";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
  tag?: string;
}

export class ApiErrorException extends Error {
  code?: string;
  status?: number;
  details?: unknown;
  tag?: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiErrorException";
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
    this.tag = error.tag;
  }
}

export const handleApiError = async (response: Response): Promise<never> => {
  let errorData: ApiError;

  try {
    errorData = await response.json();
  } catch {
    // Nếu không parse được JSON
    errorData = {
      message: "Lỗi không xác định từ server",
      status: response.status,
    };
  }

  switch (response.status) {
    case 400:
      errorData.message = errorData.message || "Invalid request";
      break;
    case 401:
      errorData.message = errorData.message || "Session expired";
      break;
    case 403:
      errorData.message =
        errorData.message || "You are not authorized to access this resource";
      break;
    case 404:
      errorData.message = errorData.message || "Resource not found";
      break;
    case 500:
      errorData.message = errorData.message || "Server error";
      break;
    default:
      errorData.message =
        errorData.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
  }

  throw new ApiErrorException(errorData);
};

export const handleWorkspaceError = (error: WorkspaceError) => {
  const errorMessages: Record<WorkspaceError["tag"], string> = {
    WORKSPACE_PERMISSION_DENIED: "Bạn không có quyền thực hiện thao tác này",
    WORKSPACE_ACCESS_DENIED: "Bạn không phải là thành viên của workspace này",
    WORKSPACE_ID_MISSING: "ID workspace không được cung cấp",
    WORKSPACE_UNAUTHORIZED: "Không xác định được user_id từ token",
    WORKSPACE_MEMBER_ERROR: "Lỗi khi kiểm tra quyền thành viên workspace",
  };

  toast({
    variant: "destructive",
    title: "Lỗi",
    description: errorMessages[error.tag] || error.message,
  });
};

export const isApiError = (error: unknown): error is ApiErrorException => {
  return error instanceof ApiErrorException;
};

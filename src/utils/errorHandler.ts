export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class ApiErrorException extends Error {
  code?: string;
  status?: number;
  details?: any;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiErrorException";
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
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

  // Xử lý các mã lỗi HTTP phổ biến
  switch (response.status) {
    case 400:
      errorData.message = errorData.message || "Yêu cầu không hợp lệ";
      break;
    case 401:
      errorData.message = errorData.message || "Phiên đăng nhập hết hạn";
      break;
    case 403:
      errorData.message = errorData.message || "Không có quyền truy cập";
      break;
    case 404:
      errorData.message = errorData.message || "Không tìm thấy tài nguyên";
      break;
    case 500:
      errorData.message = errorData.message || "Lỗi server";
      break;
    default:
      errorData.message = errorData.message || "Đã xảy ra lỗi";
  }

  throw new ApiErrorException(errorData);
};

export const isApiError = (error: unknown): error is ApiErrorException => {
  return error instanceof ApiErrorException;
};

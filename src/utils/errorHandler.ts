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

  switch (response.status) {
    case 400:
      errorData.message = errorData.message || "Invalid request";
      break;
    case 401:
      errorData.message = errorData.message || "Session expired";
      break;
    case 403:
      errorData.message = errorData.message || "You are not authorized to access this resource";
      break;
    case 404:
      errorData.message = errorData.message || "Resource not found";
      break;
    case 500:
      errorData.message = errorData.message || "Server error";
      break;
    default:
      errorData.message = errorData.message || "This email is already in use";
  }

  throw new ApiErrorException(errorData);
};

export const isApiError = (error: unknown): error is ApiErrorException => {
  return error instanceof ApiErrorException;
};

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { loginWithGoogle } from "../services/api";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

interface UseGoogleLoginReturn {
  googleLoading: boolean;
  error: string;
  handleGoogleLogin: (idToken: string) => Promise<void>;
}

export const useGoogleLogin = (): UseGoogleLoginReturn => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { updateUser, user, hasWorkspace } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async (idToken: string) => {
    setGoogleLoading(true);
    setError("");
    try {
      const response = await loginWithGoogle(idToken);
      if (response.token && response.refresh_token && response.user) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("refresh_token", response.refresh_token);
        localStorage.setItem("user", JSON.stringify(response.user));
        updateUser(response.user);
        queryClient.invalidateQueries();

        // Navigation logic tương tự như trong useAuth
        if (response.user.workspace) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/workspace", { replace: true });
        }
      } else {
        setError("Không nhận được token hoặc user từ server");
      }
    } catch (err) {
      setError("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    googleLoading,
    error,
    handleGoogleLogin,
  };
};

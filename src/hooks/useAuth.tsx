import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  workspace?: {
    id: string;
    name: string;
  };
  role?: string;
}

interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  hasWorkspace: boolean;
  isTokenExpired: boolean;
  refreshToken: () => Promise<boolean>;
  role?: string | null;
  canCreateAgent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const queryClient = useQueryClient();

  const checkTokenExpiration = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (!storedRefreshToken) return false;

      const res = await fetch(API_ENDPOINTS.auth.refresh, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: storedRefreshToken
        })
      });

      const data = await res.json();

      if (data.tag === 'REFRESH_SUCCESS') {
        // Lưu token mới
        localStorage.setItem('token', data.token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        // Cập nhật user data nếu có
        if (data.user_data) {
          const existingUserStr = localStorage.getItem('user');
          let existingUserData: Partial<User> = {};
          if (existingUserStr) {
            try {
              existingUserData = JSON.parse(existingUserStr);
            } catch (e) {
              console.error("Failed to parse existing user data from localStorage:", e);
            }
          }

          // Merge new user_data with existing user data
          const mergedUserData: User = { ...existingUserData, ...data.user_data };
          
          try {
            const decodedToken = jwtDecode<DecodedToken>(data.token);
            mergedUserData.role = decodedToken.role; // Cập nhật role từ token mới
          } catch (e) {
            console.error("Failed to decode token for role:", e);
            mergedUserData.role = null;
          }
          localStorage.setItem('user', JSON.stringify(mergedUserData));
          setUser(mergedUserData);
        }
        
        setIsTokenExpired(false);
        return true;
      } else {
        // Xử lý các trường hợp lỗi
        switch (data.tag) {
          case 'REFRESH_INVALID_TOKEN':
          case 'REFRESH_USER_NOT_FOUND':
          case 'REFRESH_TOKEN_ERROR':
          case 'REFRESH_DB_ERROR':
          case 'REFRESH_RATE_LIMIT_EXCEEDED':
            console.error('Refresh token error:', data.tag);
            logout();
            return false;
          default:
            console.error('Unknown refresh error:', data);
            logout();
            return false;
        }
      }
    } catch (err) {
      console.error('Lỗi khi refresh token:', err);
      logout();
      return false;
    }
  };

  // Thêm hàm mới để kiểm tra và refresh token trước khi hết hạn
  const checkAndRefreshToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;

      // Nếu token còn ít hơn 5 phút nữa sẽ hết hạn, refresh ngay
      if (timeUntilExpiry < 300) { // 300 giây = 5 phút
        console.log('Token sắp hết hạn, đang cố gắng refresh...');
        await refreshToken();
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra token để refresh:', err);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const isExpired = checkTokenExpiration(token);
        setIsTokenExpired(isExpired);
        
        if (isExpired) {
          // Thử refresh token ngay lập tức nếu đã hết hạn
          const success = await refreshToken();
          if (!success) {
            // Nếu refresh thất bại, xóa token và user
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          const userData = JSON.parse(userStr);
          try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            userData.role = decodedToken.role;
          } catch (e) {
            console.error("Failed to decode token for role:", e);
            userData.role = null;
          }
          setUser(userData);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Thiết lập interval để kiểm tra và refresh token định kỳ
    const interval = setInterval(checkAndRefreshToken, 60000); // Kiểm tra mỗi 60 giây

    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
      
      if (data.token && data.refresh_token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        try {
          const decodedToken = jwtDecode<DecodedToken>(data.token);
          data.user.role = decodedToken.role;
        } catch (e) {
          console.error("Failed to decode token for role:", e);
          data.user.role = null;
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsTokenExpired(false);
        
        queryClient.invalidateQueries();
      } else {
        throw new Error('Không nhận được token hoặc user từ server');
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Gọi API logout để thu hồi refresh token
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(API_ENDPOINTS.auth.logout, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Lỗi khi logout:', err);
    } finally {
      // Xóa tất cả cache của React Query
      queryClient.clear();
      
      // Xóa dữ liệu local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedWorkspace');
      
      // Reset state
      setUser(null);
      setIsTokenExpired(false);
    }
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...newUser };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const hasWorkspace = Boolean(user?.workspace?.id);
  const canCreateAgent = user?.role !== 'user';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      updateUser, 
      hasWorkspace,
      isTokenExpired,
      refreshToken,
      role: user?.role,
      canCreateAgent,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
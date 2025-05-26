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
}

interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
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
      const token = localStorage.getItem('token');
      if (!token) return false;

      const res = await fetch(API_ENDPOINTS.auth.refresh, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Không thể refresh token');
      }

      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setIsTokenExpired(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Lỗi khi refresh token:', err);
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      const isExpired = checkTokenExpiration(token);
      setIsTokenExpired(isExpired);
      
      if (isExpired) {
        // Thử refresh token trước khi logout
        refreshToken().then(success => {
          if (!success) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        });
      } else {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
    }
    setLoading(false);
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
      
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsTokenExpired(false);
        
        // Invalidate all queries after successful login
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

  const logout = () => {
    // Xóa tất cả cache của React Query
    queryClient.clear();
    
    // Xóa dữ liệu local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedWorkspace');
    
    // Reset state
    setUser(null);
    setIsTokenExpired(false);
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const hasWorkspace = Boolean(user?.workspace?.id);

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
      refreshToken
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
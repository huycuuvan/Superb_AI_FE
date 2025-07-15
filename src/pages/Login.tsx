// Login.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import gsap from 'gsap';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

// Simple Superb AI Logo Component (Không thay đổi)
const SuperbAiLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };
  return (
    <Link to="/" className="flex items-center space-x-2.5 group relative z-10">
      <div className={`p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-lg shadow-md group-hover:opacity-90 transition-opacity`}>
        <svg className={`w-7 h-7 text-white`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className={`font-bold ${sizeClasses[size]} text-white group-hover:opacity-80 transition-opacity`}>Superb AI</span>
    </Link>
  );
};

// Khai báo window.google cho TypeScript
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: { theme: string; size: string; width: string }) => void;
        };
      };
    };
  }
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, user, hasWorkspace } = useAuth();
  const { googleLoading, error: googleError, handleGoogleLogin } = useGoogleLogin();
  const queryClient = useQueryClient();
  const from = location.state?.from?.pathname || "/dashboard";
  const { theme } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    if (user && hasWorkspace) {
      navigate(from, { replace: true });
    } else if (user && !hasWorkspace) {
      navigate("/workspace", { replace: true });
    }
  }, [user, hasWorkspace, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      await login(email, password);
      queryClient.invalidateQueries();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Đăng nhập thất bại");
    }
  };



  const loginCardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if(loginCardRef.current){
      gsap.set(loginCardRef.current, { opacity: 0, y: 20 });
      gsap.to(loginCardRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.2 });
    }
  },[]);

  // Google Identity Services
  const googleButtonRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: (response: { credential: string }) => {
          handleGoogleLogin(response.credential);
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        // Thay đổi theme nút Google để hợp với theme tối
        theme: theme === 'dark' ? "filled_black" : "outline",
        size: "large",
        width: "100%",
      });
    }
  }, [theme]); // Thêm theme vào dependency array

  return (
    <div className={cn(
      'min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 antialiased selection:bg-pink-300 selection:text-pink-900 overflow-hidden relative',
      // Thay đổi nền light theme để dịu mắt hơn
      'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
      // Giữ nguyên dark theme
      theme === 'dark' && 'dark bg-gradient-to-br from-zinc-900 via-zinc-950 to-black'
    )}>
      {/* Animated background shapes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-400/20 dark:bg-purple-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-80 sm:h-80 bg-pink-400/20 dark:bg-pink-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse-slower animation-delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-sky-400/20 dark:bg-sky-500/10 rounded-full filter blur-3xl opacity-40 animate-pulse-slow animation-delay-500"></div>
      </div>

      <div ref={loginCardRef} className="w-full max-w-sm sm:max-w-md relative z-10">
        <Card className={cn(
          "shadow-2xl rounded-xl backdrop-filter backdrop-blur-lg",
          // Light theme
          "bg-white/40 border border-white/20",
          // Dark theme
          "dark:bg-zinc-900/60 dark:border-zinc-700/50"
        )}>
          <CardHeader className="space-y-1.5 p-6 sm:p-8 border-b border-white/20 dark:border-zinc-700/50">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-slate-800 dark:text-zinc-100">Welcome Back!</CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-zinc-400 text-sm sm:text-base">
              Log in to access your Superb AI workspace.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-medium text-sm text-slate-700 dark:text-zinc-300">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="text-base rounded-md placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-400/50 bg-white/60 border-white/40 text-slate-800 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-purple-500"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-medium text-sm text-slate-700 dark:text-zinc-300">{t('auth.password')}</Label>
                  <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 hover:underline dark:text-purple-400 dark:hover:text-purple-300">
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="text-base rounded-md placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-400/50 bg-white/60 border-white/40 text-slate-800 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-purple-500"
                />
              </div>
              {(error || googleError) && <div className="text-red-500 dark:text-red-400 text-sm text-center pt-1 font-medium">{error || googleError}</div>}
              
              <Button type="submit" className="w-full bg-primary text-white hover:bg-primary-gradient shadow-lg hover:shadow-primary/40 dark:shadow-primary/80" size="lg" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </Button>
              
              <div className="relative pt-2 pb-1">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-white/40 dark:bg-zinc-700/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/30 px-2 text-slate-500 backdrop-blur-sm rounded-sm dark:bg-zinc-900/80 dark:text-zinc-400">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div ref={googleButtonRef} className="w-full flex justify-center mb-2"></div>
            </CardContent>
          </form>
          <CardFooter className="flex justify-center p-6 bg-inherit border-t border-white/20 dark:border-zinc-700/50 rounded-b-xl">
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-purple-600 hover:text-purple-700 hover:underline dark:text-purple-400 dark:hover:text-purple-300">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
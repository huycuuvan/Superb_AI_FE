import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { registerWithEmail, verifyEmail } from "@/services/api";
import { ApiErrorException, isApiError } from "@/utils/errorHandler";
import gsap from 'gsap';
import { useTheme } from '@/hooks/useTheme';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import { cn } from '@/lib/utils';

// Simple Superb AI Logo Component
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

const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { googleLoading, error: googleError, handleGoogleLogin } = useGoogleLogin();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const registerCardRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if(registerCardRef.current){
      gsap.set(registerCardRef.current, { opacity: 0, y: 20 });
      gsap.to(registerCardRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.2 });
    }
  },[]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setShowVerify(true); // chuyển luôn sang màn nhập mã
    try {
      const res = await registerWithEmail({ email, password, name });
      if (res && res.tag === "REGISTER_VERIFICATION_SENT") {
        setSuccess("Đã gửi mã xác thực về email. Vui lòng kiểm tra email và nhập mã xác thực để hoàn tất đăng ký.");
      } else {
        setSuccess("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.");
      }
    } catch (err) {
      setShowVerify(false); // lỗi thì quay lại màn đăng ký
      if (isApiError(err)) {
        if (err.tag === "REGISTER_PASSWORD_TOO_SHORT") {
          setError("Mật khẩu phải có ít nhất 8 ký tự");
        } else if (err.tag === "REGISTER_EMAIL_ALREADY_EXISTS") {
          setError("Email đã được sử dụng");
        } else {
          setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
        }
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Thêm khai báo window.google nếu chưa có
  // declare global {
  //   interface Window {
  //     google: {
  //       accounts: {
  //         id: {
  //           initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
  //           renderButton: (element: HTMLElement, options: { theme: string; size: string; width: string }) => void;
  //         };
  //       };
  //     };
  //   }
  // }

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
        theme: theme === 'dark' ? "filled_black" : "outline",
        size: "large",
        width: "100%",
      });
    }
  }, [theme]);



  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    setVerifySuccess("");
    try {
      const res = await verifyEmail(email, verifyCode);
      if (res && res.code === 0) {
        setVerifySuccess("Xác thực email thành công! Bạn có thể đăng nhập.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setVerifyError("Mã xác thực không đúng hoặc đã hết hạn. Vui lòng thử lại.");
      }
    } catch (err) {
      setVerifyError("Mã xác thực không đúng hoặc đã hết hạn. Vui lòng thử lại.");
    }
  };

  const handleResendCode = async () => {
    setVerifyError("");
    setVerifySuccess("");
    setResendCooldown(60);
    try {
      const res = await registerWithEmail({ email, password, name });
      if (res && res.tag === "REGISTER_VERIFICATION_SENT") {
        setVerifySuccess("Đã gửi lại mã xác thực về email. Vui lòng kiểm tra email.");
      } else {
        setVerifySuccess("Đã gửi lại mã xác thực về email. Vui lòng kiểm tra email.");
      }
    } catch (err) {
      setVerifyError("Không thể gửi lại mã. Vui lòng thử lại sau.");
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  return (
    <div className={cn(
      'min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 antialiased selection:bg-pink-300 selection:text-pink-900 overflow-hidden relative',
      'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
      theme === 'dark' && 'dark bg-gradient-to-br from-zinc-900 via-zinc-950 to-black'
    )}>
      {/* Animated background shapes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-400/20 dark:bg-purple-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-80 sm:h-80 bg-pink-400/20 dark:bg-pink-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse-slower animation-delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-sky-400/20 dark:bg-sky-500/10 rounded-full filter blur-3xl opacity-40 animate-pulse-slow animation-delay-500"></div>
      </div>
      <div ref={registerCardRef} className="w-full max-w-sm sm:max-w-md relative z-10">
        <Card className={cn(
          "shadow-2xl rounded-xl backdrop-filter backdrop-blur-lg",
          "bg-white/40 border border-white/20",
          "dark:bg-zinc-900/60 dark:border-zinc-700/50"
        )}>
          <CardHeader className="space-y-1.5 p-4 sm:p-6 border-b border-white/20 dark:border-zinc-700/50">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-slate-800 dark:text-zinc-100">Create Account</CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-zinc-400 text-sm sm:text-base">
              Join Superb AI and start your journey
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} style={{ display: showVerify ? 'none' : undefined }}>
            <CardContent className="space-y-6 p-6 sm:p-8">
              {(error || googleError) && (
                <Alert variant="destructive" className="mb-4">
                  {error || googleError}
                </Alert>
              )}
              {success && (
                <Alert variant="success" className="mb-4">
                  {success}
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="font-medium text-sm text-slate-700">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  disabled={loading || googleLoading}
                  className={cn(
                    "border-white/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50",
                    "text-base py-2.5 px-3.5 bg-white/60 placeholder:text-slate-400",
                    "text-slate-800 rounded-md",
                    theme === 'dark' && 'dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-50 dark:placeholder:text-zinc-500'
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-medium text-sm text-slate-700">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  disabled={loading || googleLoading}
                  className={cn(
                    "border-white/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50",
                    "text-base py-2.5 px-3.5 bg-white/60 placeholder:text-slate-400",
                    "text-slate-800 rounded-md",
                    theme === 'dark' && 'dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-50 dark:placeholder:text-zinc-500'
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-medium text-sm text-slate-700">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  disabled={loading || googleLoading}
                  className={cn(
                    "border-white/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50",
                    "text-base py-2.5 px-3.5 bg-white/60 placeholder:text-slate-400",
                    "text-slate-800 rounded-md",
                    theme === 'dark' && 'dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-50 dark:placeholder:text-zinc-500'
                  )}
                />
              </div>
              <Button 
                type="submit" 
                className={cn(
                  "w-full bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-gray-500/40",
                  theme === 'dark' && 'dark:shadow-primary/80'
                )} 
                size="lg"
                disabled={loading || googleLoading}
              >
                {loading ? "Registering..." : "Register"}
              </Button>
              <div className="relative pt-2 pb-1">
                <div className="absolute inset-0 flex items-center">
                  <Separator className={cn(
                    "w-full bg-white/40",
                    theme === 'dark' && 'dark:bg-zinc-700/50'
                  )} />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/30 px-2 text-slate-500 backdrop-blur-sm rounded-sm">
                    Or continue with
                  </span>
                </div>
              </div>
              <div ref={googleButtonRef} className="w-full flex justify-center" />
            </CardContent>
          </form>
          {showVerify && (
            <form onSubmit={handleVerify} className="space-y-6 p-6 sm:p-8">
              <Alert variant="info" className="mb-4">
                Đã gửi mã xác thực về email <b>{email}</b>. Vui lòng kiểm tra email và nhập mã xác thực gồm 6 số để hoàn tất đăng ký.
              </Alert>
              {verifyError && <Alert variant="destructive">{verifyError}</Alert>}
              {verifySuccess && <Alert variant="success">{verifySuccess}</Alert>}
              <div className="space-y-1.5">
                <Label htmlFor="verifyCode" className="font-medium text-sm text-slate-700">Mã xác thực</Label>
                <Input
                  id="verifyCode"
                  type="text"
                  placeholder="Nhập mã xác thực 6 số"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
                  required
                  maxLength={6}
                  minLength={6}
                  pattern="[0-9]{6}"
                  className={cn(
                    "border-white/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50",
                    "text-base py-2.5 px-3.5 bg-white/60 placeholder:text-slate-400",
                    "text-slate-800 rounded-md",
                    theme === 'dark' && 'dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-50 dark:placeholder:text-zinc-500'
                  )}
                />
              </div>
              <Button type="submit" className={cn(
                "w-full bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-gray-500/40",
                theme === 'dark' && 'dark:shadow-primary/80'
              )} size="lg">
                Xác thực email
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Gửi lại mã (${resendCooldown}s)` : "Gửi lại mã"}
              </Button>
            </form>
          )}
          <CardFooter className="flex justify-center p-6 bg-inherit border-t border-white/20 rounded-b-xl">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className={cn(
                "font-medium text-purple-600 hover:text-purple-700 hover:underline",
                theme === 'dark' && 'dark:text-purple-400 dark:hover:text-purple-300'
              )}>
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register; 
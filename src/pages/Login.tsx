import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { getWorkspace, WorkspaceResponse } from "@/services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, user, hasWorkspace } = useAuth();

  // Lấy đường dẫn trước đó từ state (nếu có)
  const from = location.state?.from?.pathname || "/dashboard";

  // Nếu đã đăng nhập và đã có workspace, chuyển hướng về dashboard ngay lập tức
  if (user && hasWorkspace) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      // Sau khi đăng nhập thành công, kiểm tra lại trạng thái user và workspace
      // useAuth hook sẽ cập nhật user và hasWorkspace sau khi login thành công
      // Chuyển hướng dựa trên trạng thái workspace
      // Cần một chút delay hoặc đảm bảo user và hasWorkspace đã được cập nhật
      // Tuy nhiên, do await login đã hoàn thành, user state trong context thường đã cập nhật
      // Nếu user có workspace, chuyển hướng đến trang gốc (from) hoặc dashboard
      // Nếu user chưa có workspace, chuyển hướng đến trang workspace

      // Lấy user và hasWorkspace mới nhất sau khi login
      // Có thể cần một useEffect hoặc logic khác để đợi state cập nhật nếu cần
      // Tuy nhiên, dựa trên cách useAuth hoạt động, user state thường được cập nhật ngay sau await login
      if (user?.workspace?.id) { // Kiểm tra trực tiếp từ user object vừa cập nhật
          navigate(from, { replace: true });
      } else {
          navigate("/workspace", { replace: true });
      }

    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-teampal-500 text-white p-1.5 rounded">
              <span className="font-bold text-sm">TP</span>
            </div>
            <img src="/Superb-AI-Logo.svg" alt="Superb AI" className="w-6 h-6" />
          </Link>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Log in to your Superb AI account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-sm text-teampal-500 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full teampal-button" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Log in"}
              </Button>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>
            </CardContent>
          </form>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-teampal-500 hover:underline">
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

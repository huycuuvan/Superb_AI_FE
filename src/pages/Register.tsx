import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { registerWithEmail } from "@/services/api";
import { ApiErrorException, isApiError } from "@/utils/errorHandler";

const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await registerWithEmail({ email, password, name });
      setSuccess("Đăng ký thành công!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
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
            <span className="font-bold text-xl">Superb AI</span>
          </Link>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign up</CardTitle>
            <CardDescription className="text-center">
              Create your Superb AI account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" className="mb-4">
                  {success}
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Your name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full teampal-button" 
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Sign up"}
              </Button>
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
              <Button variant="outline" className="w-full" type="button" disabled>
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
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-teampal-500 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register; 
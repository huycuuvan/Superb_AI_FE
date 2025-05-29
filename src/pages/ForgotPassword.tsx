import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import gsap from 'gsap';

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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual password reset API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const forgotPasswordCardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if(forgotPasswordCardRef.current){
      gsap.from(forgotPasswordCardRef.current, {opacity: 0, y: 20, duration: 0.7, ease: 'power2.out', delay: 0.2});
    }
  },[]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 p-4 sm:p-6 antialiased selection:bg-pink-300 selection:text-pink-900 overflow-hidden relative`}>
      {/* Subtle animated background shapes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-300/40 rounded-full filter blur-3xl opacity-50 animate-pulse-slow animation-delay-200"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-80 sm:h-80 bg-pink-300/40 rounded-full filter blur-3xl opacity-50 animate-pulse-slower animation-delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-sky-300/30 rounded-full filter blur-3xl opacity-40 animate-pulse-slow animation-delay-500"></div>
      </div>

      <div ref={forgotPasswordCardRef} className="w-full max-w-md relative z-10">
        
        
        <Card className={`shadow-2xl rounded-xl backdrop-filter backdrop-blur-lg bg-white/40 border border-white/20`}>
          <CardHeader className={`space-y-1.5 p-6 sm:p-8 border-b border-white/20`}>
            <CardTitle className={`text-2xl sm:text-3xl font-bold text-center text-slate-800`}>Forgot Password</CardTitle>
            <CardDescription className={`text-center text-slate-600 text-sm sm:text-base`}>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="space-y-1.5">
                <Label htmlFor="email" className={`font-medium text-sm text-slate-700`}>Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={`border-white/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 text-base py-2.5 px-3.5 bg-white/60 placeholder:text-slate-400 text-slate-800 rounded-md`}
                />
              </div>
              {error && <div className="text-red-600 text-sm text-center pt-1 font-medium">{error}</div>}
              {success && (
                <div className="text-green-600 text-sm text-center pt-1 font-medium">
                  Password reset link has been sent to your email.
                </div>
              )}
              
              <Button type="submit" className={`w-full bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-gray-500/40`} size="lg" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </CardContent>
          </form>
          <CardFooter className={`flex justify-center p-6 bg-inherit border-t border-white/20 rounded-b-xl`}>
            <p className={`text-sm text-slate-600`}>
              Remember your password?{" "}
              <Link to="/login" className={`font-medium text-purple-600 hover:text-purple-700 hover:underline`}>
                Back to login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword; 
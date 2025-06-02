import { useParams } from "react-router-dom";
import { WorkspaceProfileForm } from "@/components/workspace/WorkspaceProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

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

export default function WorkspaceProfilePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const profileCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(profileCardRef.current){
      gsap.from(profileCardRef.current, {opacity: 0, y: 20, duration: 0.7, ease: 'power2.out', delay: 0.2});
    }
  },[]);

  if (!workspaceId) {
    return <div>Workspace ID not found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 p-4 sm:p-6 antialiased selection:bg-pink-300 selection:text-pink-900 overflow-hidden relative">
      {/* Subtle animated background shapes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-300/40 rounded-full filter blur-3xl opacity-50 animate-pulse-slow animation-delay-200"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-80 sm:h-80 bg-pink-300/40 rounded-full filter blur-3xl opacity-50 animate-pulse-slower animation-delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-sky-300/30 rounded-full filter blur-3xl opacity-40 animate-pulse-slow animation-delay-500"></div>
      </div>

      <div ref={profileCardRef} className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl rounded-xl backdrop-filter backdrop-blur-lg bg-white/40 border border-white/20">
          <CardHeader className="space-y-1.5 p-4 sm:p-6 border-b border-white/20">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-slate-800">Update Workspace Profile</CardTitle>
            <CardDescription className="text-center text-slate-600 text-sm sm:text-base">
              Please update your workspace information.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <WorkspaceProfileForm workspaceId={workspaceId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
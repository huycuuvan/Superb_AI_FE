import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/ProtectedRoute";

const DashboardLayout = () => {
  const location = useLocation();
  // Logic này để xác định khi nào có padding, khi nào không, rất tốt!
  const isAgentChatPage = location.pathname.includes('/agents/');

  return (
    <ProtectedRoute>
      <ThemeProvider>
        <LanguageProvider>
          {/* 1. Thay thế gradient bằng màu nền động */}
          <div className="flex h-screen bg-background">
            {/* 2. Gỡ bỏ các class dark:* thủ công */}
            <Sidebar className="hidden md:block" />
            <div className="flex flex-col flex-1 w-full overflow-hidden">
              <Header />
              {/* 3. Đảm bảo main content cũng dùng màu nền động */}
              <main className={`flex-1 overflow-y-auto bg-background ${!isAgentChatPage ? 'p-4 md:p-6' : 'p-0'} dark:bg-slate-900`}>
                <Outlet />
              </main>
            </div>
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
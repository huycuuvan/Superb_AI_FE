import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { Menu, ArrowLeft } from "lucide-react";;
import { useTranslation } from "react-i18next";

const DashboardLayout = () => {
  const location = useLocation();
  const { t } = useTranslation ();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  // Logic này để xác định khi nào có padding, khi nào không, rất tốt!
  const isAgentChatPage = location.pathname.includes('/agents/');
  const navigate = useNavigate();
  const isDashboardRoot = location.pathname === '/dashboard';
  const isAgentChat = location.pathname.startsWith('/dashboard/agents/');

  return (
    <ProtectedRoute>
      <ThemeProvider>
        {/* 1. Thay thế gradient bằng màu nền động */}
        <div className="flex h-screen bg-background background-gradient-white ">
          {/* Sidebar cố định cho desktop */}
          <Sidebar className="hidden md:flex" />
          {/* Nút mở sidebar mobile */}
          <button
            className="fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-white md:hidden"
            onClick={() => setShowMobileSidebar(true)}
            aria-label="Mở menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          {/* Sidebar dạng drawer cho mobile */}
          {showMobileSidebar && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setShowMobileSidebar(false)}
              />
              <aside
                className="fixed top-0 left-0 h-full w-64 bg-background z-50 shadow-lg animate-slide-in"
                style={{ animation: 'slide-in 0.3s ease' }}
              >
                <button
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 text-gray-700"
                  onClick={() => setShowMobileSidebar(false)}
                  aria-label="Đóng menu"
                >
                  ×
                </button>
                <Sidebar className="flex md:hidden h-full" isMobileDrawer />
              </aside>
              <style>{`
                @keyframes slide-in {
                  from { transform: translateX(-100%); }
                  to { transform: translateX(0); }
                }
              `}</style>
            </>
          )}
          <div className="flex flex-col flex-1 w-full overflow-hidden">
            <Header />
            {/* Nút back: chỉ hiển thị nếu không phải trang dashboard gốc và không phải màn chat */}
            {!isDashboardRoot && !isAgentChat && (
              <button
                className="flex items-center gap-2 mt-2 ml-4 w-fit text-muted-foreground hover:text-primary transition-colors"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{t('common.back')}</span>
              </button>
            )}
            {/* 3. Đảm bảo main content cũng dùng màu nền động */}
            <main className={`flex-1 overflow-y-auto bg-transparent no-scrollbar ${!isAgentChatPage ? 'p-4 md:p-6' : 'p-0'}`}>
              <Outlet />
            </main>
          </div>
        </div>
      </ThemeProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
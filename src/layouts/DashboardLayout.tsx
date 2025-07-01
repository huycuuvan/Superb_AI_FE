import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { Menu } from "lucide-react";

const DashboardLayout = () => {
  const location = useLocation();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  // Logic này để xác định khi nào có padding, khi nào không, rất tốt!
  const isAgentChatPage = location.pathname.includes('/agents/');

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
            {/* 3. Đảm bảo main content cũng dùng màu nền động */}
            <main className={`flex-1 overflow-y-auto bg-background no-scrollbar ${!isAgentChatPage ? 'p-4 md:p-6' : 'p-0'}`}>
              <Outlet />
            </main>
          </div>
        </div>
      </ThemeProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
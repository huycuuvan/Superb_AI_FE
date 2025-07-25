import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { Menu, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";

const DashboardLayout = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const isAgentChatPage = location.pathname.includes('/agents/');
  const navigate = useNavigate();
  const isDashboardRoot = location.pathname === '/dashboard';
  const isAgentChat = location.pathname.startsWith('/dashboard/agents/');
  const userRole = useWorkspaceRole();

  return (
    <ProtectedRoute>
      <ThemeProvider>
        <div className="flex h-screen bg-background background-gradient-white ">
          <Sidebar className="hidden md:flex" userRole={userRole} />
          {showMobileSidebar && (
            <>
              <Sidebar
                className="flex md:hidden h-full"
                isMobileDrawer
                userRole={userRole}
                onCloseSidebar={() => setShowMobileSidebar(false)}
              />
              <style>{`
                @keyframes slide-in {
                  from { transform: translateX(-100%); }
                  to { transform: translateX(0); }
                }
              `}</style>
            </>
          )}
          <div className="flex flex-col flex-1 w-full overflow-hidden">
            <Header onOpenSidebar={() => setShowMobileSidebar(true)} />
            {!isDashboardRoot && !isAgentChat && (
              <button
                className="flex items-center gap-2 mt-2 ml-4 w-fit text-muted-foreground hover:text-primary transition-colors"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{t('common.back')}</span>
              </button>
            )}
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
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/ProtectedRoute";

const DashboardLayout = () => {
  const location = useLocation();
  const isAgentChatPage = location.pathname.includes('/agents/');
  
  return (
    <ProtectedRoute>
      <ThemeProvider>
        <LanguageProvider>
          <div className="flex h-screen primary-gradient">
            <Sidebar className="hidden md:block" />
            <div className="flex flex-col flex-1 overflow-hidden w-full">
              <Header />
              <main className={`flex-1 overflow-y-auto bg-primary-gradient ${!isAgentChatPage ? 'p-4 md:p-6' : 'p-0'}`}>
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

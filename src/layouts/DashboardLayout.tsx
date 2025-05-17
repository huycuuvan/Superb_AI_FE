
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ThemeProvider } from "@/hooks/useTheme";

const DashboardLayout = () => {
  const location = useLocation();
  const isAgentChatPage = location.pathname.includes('/agents/');
  
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className={`flex-1 overflow-y-auto ${!isAgentChatPage ? 'p-6' : 'p-0'}`}>
              <Outlet />
            </main>
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default DashboardLayout;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { FolderProvider } from '@/contexts/FolderContext';
import { ThemeProvider } from "@/hooks/useTheme";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (user) {
      queryClient.invalidateQueries();
    }
  }, [user]);
  return (
    <FolderProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </FolderProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

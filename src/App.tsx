import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "@/hooks/useAuth";
import { FolderProvider } from '@/contexts/FolderContext';
import { ThemeProvider } from "@/hooks/useTheme";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <FolderProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <RouterProvider router={router} />
          </TooltipProvider>
        </FolderProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

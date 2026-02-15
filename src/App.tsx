import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ParticleBackground from "@/components/ui/particle-background";
import Index from "./pages/Index";
import Login from "./pages/Login";
import PatientIntake from "./pages/PatientIntake";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const InnerApp = () => {
    // We need useLocation, so this component must be inside BrowserRouter
    const { pathname } = useLocation();
    const isLoginPage = pathname === "/login";

    return (
        <>
            {!isLoginPage && (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="fixed inset-0 min-w-full min-h-full object-cover z-0 pointer-events-none"
                    style={{ filter: "brightness(0.6)" }} 
                >
                    <source src="/rest-site.mp4" type="video/mp4" />
                </video>
            )}
            <div style={{ position: 'relative', zIndex: 10 }}>
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/patient" element={<PatientIntake />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </>
    );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
            <InnerApp />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GameWrapper from "./components/GameWrapper";
import Profile from "./pages/Profile";
import Leaderboards from "./pages/Leaderboards";
import Achievements from "./pages/Achievements";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { GameProvider } from "./contexts/GameContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Listen for keyboard events for the 2048 game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        // Let the game handle arrow keys to avoid page scrolling
        if (window.location.pathname.includes("game2048")) {
          e.preventDefault();
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="game-hub-theme">
        <GameProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/game/:gameId" element={<GameWrapper />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboards" element={<Leaderboards />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </GameProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

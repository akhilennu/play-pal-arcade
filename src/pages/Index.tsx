
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import GameCard from "@/components/GameCard";
import { games } from "@/data/gamesData"; // Only 'games' is needed now
import { useGameContext } from "@/contexts/GameContext";
import { createNewProfile } from "@/utils/userUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react"; // For the static dropdown visual

const Index: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const [nameInput, setNameInput] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  // Get available games
  const availableGames = games.filter(game => game.isAvailable);
  const allGamesToDisplay = games; // For the "All Games" section if we want to show coming soon ones too

  // Handle profile creation
  const handleCreateProfile = () => {
    if (!nameInput.trim()) return;
    
    const newProfile = createNewProfile(nameInput, selectedAvatar);
    dispatch({ type: "ADD_PROFILE", payload: newProfile });
    dispatch({ type: "SET_ACTIVE_PROFILE", payload: newProfile.id });
    
    setNameInput("");
  };

  // Common render function for game lists
  const renderGameList = (gamesToRender: typeof games, title?: string) => (
    <section>
      {title && (
        <div className="flex items-center justify-between p-3 mb-4 bg-card border border-border rounded-lg shadow-sm cursor-default">
          <h2 className="text-lg font-semibold">{title}</h2>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-8">
        {gamesToRender.length > 0 ? gamesToRender.map(game => (
          <GameCard key={game.id} game={game} />
        )) : (
          <p className="col-span-full text-center text-muted-foreground py-8">No games available in this section.</p>
        )}
      </div>
    </section>
  );

  // Show profile creation if no active profile
  if (!state.activeProfileId) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 items-center justify-center p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)'}}>
          <Card className="w-full max-w-md animate-fade-in shadow-xl rounded-xl">
            <CardHeader className="text-center pt-8"> {/* More padding top */}
              <CardTitle className="text-3xl font-bold">Welcome to Game Hub!</CardTitle>
              <CardDescription className="mt-2 text-base">
                Create your profile to start playing.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8"> {/* More padding */}
              <div className="space-y-6"> {/* Increased spacing */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="py-3 px-4 rounded-lg text-base" // Larger input
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Choose an Avatar</Label>
                  <div className="grid grid-cols-5 gap-2 md:gap-3">
                    {["👾", "🎮", "🎯", "🎲", "🎪", "🎭", "🦄", "🐉", "🦊", "🐼"].map(
                      (emoji, index) => (
                        <Button
                          key={index}
                          variant={selectedAvatar === index ? "default" : "outline"}
                          className="h-14 w-14 text-2xl p-0 rounded-lg transition-all active:scale-90" // Larger avatar buttons
                          onClick={() => setSelectedAvatar(index)}
                        >
                          {emoji}
                        </Button>
                      )
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full py-3.5 text-base font-semibold rounded-lg transition-transform active:scale-95" // Prominent button
                  onClick={handleCreateProfile}
                  disabled={!nameInput.trim()}
                  size="lg"
                >
                  Create Profile & Play
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar />
      <main 
        className="flex-1 p-4 md:p-6 flex flex-col container mx-auto"
        style={{ 
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)', // Ensure bottom safe area + some padding
          paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 1rem)', // Responsive padding for smaller screens
          paddingRight: 'calc(env(safe-area-inset-right, 0px) + 1rem)'
        }}
      >
        <div className="mb-6 md:mb-8 flex-shrink-0 pt-4"> {/* Added pt-4 for spacing below navbar */}
          <h1 className="text-3xl md:text-4xl font-bold mb-2 animate-fade-in">Game Collection</h1>
          <p className="text-muted-foreground animate-fade-in delay-100 text-sm md:text-base">
            Explore our hand-picked selection of fun games.
          </p>
        </div>
        
        <ScrollArea className="flex-grow -mx-4 md:-mx-6 px-4 md:px-6"> {/* ScrollArea covers padding */}
          {/* Render available games first */}
          {renderGameList(availableGames, "Available Games")}
          
          {/* Optionally, show "Coming Soon" games if any exist and are not in availableGames */}
          { (() => {
              const comingSoonGames = allGamesToDisplay.filter(g => !g.isAvailable);
              if (comingSoonGames.length > 0) {
                return renderGameList(comingSoonGames, "Coming Soon");
              }
              return null;
            })()
          }
        </ScrollArea>
      </main>
    </div>
  );
};

export default Index;


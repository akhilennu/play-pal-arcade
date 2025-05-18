import React, { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import GameCard from "@/components/GameCard";
import { games, getAvailableGames } from "@/data/gamesData";
import { useGameContext } from "@/contexts/GameContext";
import { createNewProfile } from "@/utils/userUtils";
import { ScrollArea } from "@/components/ui/scroll-area";

const Index: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const [nameInput, setNameInput] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "available" | "multiplayer">("available");

  // Get available games based on filter
  const getFilteredGames = () => {
    switch (filter) {
      case "available":
        return games.filter(game => game.isAvailable);
      case "multiplayer":
        return games.filter(game => game.supportsMultiplayer && game.isAvailable); // Show available multiplayer games
      case "all":
      default:
        return games; // Show all games, including not available ones if filter is "all"
    }
  };
  
  const displayedGames = getFilteredGames();

  // Filter games by category from the displayedGames list
  const getGamesForCategory = (category: string) => {
    return displayedGames.filter(game => game.category === category);
  };
  
  const puzzleGames = getGamesForCategory("puzzle");
  const classicGames = getGamesForCategory("classic");
  const casualGames = getGamesForCategory("casual");
  const strategyGames = getGamesForCategory("strategy");
  
  // Handle profile creation
  const handleCreateProfile = () => {
    if (!nameInput.trim()) return;
    
    const newProfile = createNewProfile(nameInput, selectedAvatar);
    dispatch({ type: "ADD_PROFILE", payload: newProfile });
    dispatch({ type: "SET_ACTIVE_PROFILE", payload: newProfile.id });
    
    setNameInput("");
  };

  // Common render function for game lists to avoid repetition
  const renderGameList = (gamesToRender: typeof games) => (
    <div className={`pb-8 ${viewMode === "grid" ? 
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" : 
      "flex flex-col gap-4"}`}>
      {gamesToRender.length > 0 ? gamesToRender.map(game => (
        <GameCard key={game.id} game={game} />
      )) : (
        <p className="col-span-full text-center text-muted-foreground py-8">No games match your current filters in this category.</p>
      )}
    </div>
  );

  // Show profile creation if no active profile
  if (!state.activeProfileId) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Welcome to Game Hub!</CardTitle>
              <CardDescription>
                Create a profile to start playing games and track your scores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Choose an Avatar</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {["👾", "🎮", "🎯", "🎲", "🎪", "🎭", "🦄", "🐉", "🦊", "🐼"].map(
                      (emoji, index) => (
                        <Button
                          key={index}
                          variant={selectedAvatar === index ? "default" : "outline"}
                          className="h-12 w-12 text-xl p-0"
                          onClick={() => setSelectedAvatar(index)}
                        >
                          {emoji}
                        </Button>
                      )
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleCreateProfile}
                  disabled={!nameInput.trim()}
                >
                  Create Profile & Start Playing
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
      <main className="flex-1 p-4 md:p-6 flex flex-col container mx-auto pb-8 md:pb-12"> {/* Added bottom padding */}
        <div className="mb-6 md:mb-8 flex-shrink-0">
          <h1 className="text-3xl md:text-4xl font-bold mb-1 md:mb-2 animate-fade-in">Game Collection</h1>
          <p className="text-muted-foreground animate-fade-in delay-100 text-sm md:text-base">
            Select a game to play or browse by category.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 flex-shrink-0 gap-4">
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="w-24"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="w-24"
            >
              List
            </Button>
          </div>
          
          <div className="w-full sm:w-[200px]">
            <Select 
              defaultValue="available" 
              value={filter}
              onValueChange={(value) => setFilter(value as "all" | "available" | "multiplayer")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter Games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available Games</SelectItem>
                <SelectItem value="multiplayer">Multiplayer Games</SelectItem>
                <SelectItem value="all">All Games</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="animate-fade-in flex flex-col flex-grow min-h-0"> {/* Added min-h-0 for flex child */}
          <TabsList className="mb-4 md:mb-6 flex-shrink-0 grid grid-cols-3 sm:flex sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">All</TabsTrigger>
            <TabsTrigger value="puzzle" className="flex-1 sm:flex-none">Puzzle</TabsTrigger>
            <TabsTrigger value="classic" className="flex-1 sm:flex-none">Classic</TabsTrigger>
            <TabsTrigger value="strategy" className="flex-1 sm:flex-none">Strategy</TabsTrigger>
            <TabsTrigger value="casual" className="flex-1 sm:flex-none">Casual</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-grow"> {/* flex-grow takes available space */}
            <TabsContent value="all" className="mt-0">
              {renderGameList(displayedGames)}
            </TabsContent>
            <TabsContent value="puzzle" className="mt-0">
              {renderGameList(puzzleGames)}
            </TabsContent>
            <TabsContent value="classic" className="mt-0">
              {renderGameList(classicGames)}
            </TabsContent>
            <TabsContent value="strategy" className="mt-0">
              {renderGameList(strategyGames)}
            </TabsContent>
            <TabsContent value="casual" className="mt-0">
              {renderGameList(casualGames)}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

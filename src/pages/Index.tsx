
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

  // Get available games
  const availableGames = getAvailableGames();
  const multiplayerGames = games.filter(game => game.supportsMultiplayer);
  
  // Filter games by category
  const getFilteredGamesByCategory = (category: string) => {
    const gamesToFilter = filter === "all" ? games : 
                         filter === "available" ? availableGames : 
                         multiplayerGames;
    
    return gamesToFilter.filter(game => game.category === category);
  };
  
  const puzzleGames = getFilteredGamesByCategory("puzzle");
  const classicGames = getFilteredGamesByCategory("classic");
  const casualGames = getFilteredGamesByCategory("casual");
  const strategyGames = getFilteredGamesByCategory("strategy");
  
  // Handle profile creation
  const handleCreateProfile = () => {
    if (!nameInput.trim()) return;
    
    const newProfile = createNewProfile(nameInput, selectedAvatar);
    dispatch({ type: "ADD_PROFILE", payload: newProfile });
    dispatch({ type: "SET_ACTIVE_PROFILE", payload: newProfile.id });
    
    setNameInput("");
  };

  // Show profile creation if no active profile
  if (!state.activeProfileId) {
    return (
      <div className="flex min-h-screen flex-col">
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
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 p-4 md:p-6 flex flex-col"> {/* Added flex flex-col */}
        <div className="mb-8 flex-shrink-0"> {/* Added flex-shrink-0 */}
          <h1 className="text-3xl font-bold mb-2 animate-fade-in">Game Collection</h1>
          <p className="text-muted-foreground animate-fade-in delay-100">
            Select a game to play or browse by category.
          </p>
        </div>

        <div className="flex justify-between items-center mb-6 flex-shrink-0"> {/* Added flex-shrink-0 */}
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="w-24"
            >
              Grid View
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="w-24"
            >
              List View
            </Button>
          </div>
          
          <div className="w-[180px]">
            <Select 
              defaultValue="available" 
              value={filter}
              onValueChange={(value) => setFilter(value as "all" | "available" | "multiplayer")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter Games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="available">Available Only</SelectItem>
                <SelectItem value="multiplayer">Multiplayer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="animate-fade-in flex flex-col flex-grow"> {/* Added flex flex-col flex-grow */}
          <TabsList className="mb-6 flex-shrink-0"> {/* Added flex-shrink-0 */}
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="puzzle">Puzzle</TabsTrigger>
            <TabsTrigger value="classic">Classic</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="casual">Casual</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-grow"> {/* Removed fixed height, added flex-grow */}
            <TabsContent value="all" className="mt-0">
              <div className={viewMode === "grid" ? 
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
                "flex flex-col gap-4"}>
                {(filter === "all" ? games : 
                  filter === "available" ? availableGames : 
                  multiplayerGames).map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="puzzle" className="mt-0">
              <div className={viewMode === "grid" ? 
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
                "flex flex-col gap-4"}>
                {puzzleGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="classic" className="mt-0">
              <div className={viewMode === "grid" ? 
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
                "flex flex-col gap-4"}>
                {classicGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="strategy" className="mt-0">
              <div className={viewMode === "grid" ? 
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
                "flex flex-col gap-4"}>
                {strategyGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="casual" className="mt-0">
              <div className={viewMode === "grid" ? 
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
                "flex flex-col gap-4"}>
                {casualGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;


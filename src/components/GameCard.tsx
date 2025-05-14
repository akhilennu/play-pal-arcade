import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Grid2X2, ListCheck, Plus, HelpCircle, User, Users } from 'lucide-react';
import { Game } from '@/types';
import { useGameContext } from '@/contexts/GameContext';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const navigate = useNavigate();
  const { dispatch } = useGameContext();
  const isMobile = useIsMobile();
  
  const handlePlayClick = () => {
    if (!game.isAvailable) {
      toast({
        title: "Coming Soon!",
        description: "This game is currently in development and will be available soon.",
      });
      return;
    }
    
    dispatch({ type: "SET_CURRENT_GAME", payload: game.id });
    navigate(`/game/${game.id}`);
  };
  
  const getGameIcon = () => {
    switch (game.icon) {
      case 'grid-2x2': return <Grid2X2 className="h-6 w-6" />;
      case 'square-check': return <ListCheck className="h-6 w-6" />;
      case 'plus': return <Plus className="h-6 w-6" />;
      default: return <HelpCircle className="h-6 w-6" />;
    }
  };
  
  const isComingSoon = !game.isAvailable;
  
  return (
    <Card className={`overflow-hidden transition-shadow duration-300 ${
      isComingSoon ? 'opacity-70' : 'hover:shadow-md'
    }`}>
      <CardHeader className={`bg-${game.id === "tictactoe" ? "tictactoe-primary/10" : 
                             game.id === "memorymatch" ? "memory-primary/10" : 
                             game.id === "game2048" ? "game2048-primary/10" : 
                             "primary/10"}`}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="p-2 rounded-full bg-background">
              {getGameIcon()}
            </span>
            {game.name}
            {isComingSoon && (
              <Badge variant="outline" className="ml-2">
                Coming Soon
              </Badge>
            )}
          </CardTitle>
          <Badge variant="outline">
            {game.category}
          </Badge>
        </div>
        <CardDescription>{game.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {game.supportsMultiplayer ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Multiplayer
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Single Player
            </Badge>
          )}
          <Badge variant="outline">
            {game.availableDifficulties.length} {game.availableDifficulties.length === 1 ? 'difficulty' : 'difficulties'}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 flex justify-between">
        <Button 
          variant={isComingSoon ? "outline" : "default"}
          className={`w-full ${isComingSoon ? "" : "bg-primary/80 hover:bg-primary"}`}
          onClick={handlePlayClick}
        >
          {isComingSoon ? "Coming Soon" : "Play Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;

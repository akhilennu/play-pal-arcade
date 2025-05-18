import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getAvatarEmoji } from '@/utils/userUtils';
import { useGameContext } from '@/contexts/GameContext';
import { ModeToggle } from './ModeToggle';
import { Settings, User, Trophy, List, Music, Bell, BellOff, Info } from 'lucide-react';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useGameContext();
  const { activeProfileId, profiles } = state;
  
  const activeProfile = profiles.find(profile => profile.id === activeProfileId);
  const avatarEmoji = activeProfile ? getAvatarEmoji(activeProfile.avatarId) : '👤';

  return (
    <header 
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md" // Added -md to backdrop-blur for more pronounced effect
      style={{ 
        paddingTop: 'env(safe-area-inset-top)', 
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)' 
      }}
    >
      <div className="container flex h-14 items-center">
        <Button variant="ghost" className="mr-auto flex items-center" onClick={() => navigate('/')}> {/* Changed mr-4 to mr-auto to push other items to the right */}
          <span className="mr-2 text-xl">🎮</span>
          <span className="font-bold text-lg">Game Hub</span> {/* Increased font size slightly */}
        </Button>
        
        <nav className="flex items-center space-x-1 md:space-x-2"> {/* Added space-x for consistent spacing */}
          {location.pathname !== '/' && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => navigate('/')}> {/* Icon only on mobile */}
              <List className="h-5 w-5" />
              <span className="sr-only">Games</span>
            </Button>
          )}
          {location.pathname !== '/' && (
             <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => navigate('/')}> {/* Text on larger screens */}
              <List className="h-5 w-5" />
              <span className="ml-2">Games</span>
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => navigate('/leaderboards')}> {/* Icon only on mobile */}
            <Trophy className="h-5 w-5" />
            <span className="sr-only">Leaderboards</span>
          </Button>
           <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => navigate('/leaderboards')}> {/* Text on larger screens */}
            <Trophy className="h-5 w-5" />
            <span className="ml-2">Leaderboards</span>
          </Button>
          
          <ModeToggle />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"> {/* Consistent icon size */}
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              style={{ 
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingRight: 'env(safe-area-inset-right)'
              }}
            >
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 items-center gap-4">
                  <span>Sound</span>
                  <Button variant="outline" className="justify-start">
                    {state.soundEnabled ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
                    {state.soundEnabled ? "On" : "Off"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <span>Music</span>
                  <Button variant="outline" className="justify-start">
                    <Music className="mr-2 h-4 w-4" />
                    {state.musicEnabled ? "On" : "Off"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <span>About</span>
                  <Button variant="outline" className="justify-start" onClick={() => navigate('/about')}>
                    <Info className="mr-2 h-4 w-4" />
                    About
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center p-1.5 md:p-2 rounded-full md:rounded-md"> {/* Make avatar button look more like an icon button */}
                <Avatar className="h-8 w-8 bg-primary/10">
                  <AvatarFallback className="text-lg">{avatarEmoji}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block md:ml-2 text-sm">
                  {activeProfile?.name || "Profile"}
                </span>
                <span className="sr-only md:hidden">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              style={{
                marginRight: 'env(safe-area-inset-right)' 
              }}
            >
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/achievements')}>
                <Trophy className="mr-2 h-4 w-4" />
                <span>Achievements</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;

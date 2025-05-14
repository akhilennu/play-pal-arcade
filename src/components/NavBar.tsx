
import React, { useState } from 'react';
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
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <Button variant="ghost" className="mr-4 flex" onClick={() => navigate('/')}>
          <span className="mr-2 text-xl">🎮</span>
          <span className="font-bold">Game Hub</span>
        </Button>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {location.pathname !== '/' && (
              <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate('/')}>
                <List className="h-5 w-5" />
                <span className="sr-only md:not-sr-only md:ml-2">Games</span>
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate('/leaderboards')}>
              <Trophy className="h-5 w-5" />
              <span className="sr-only md:not-sr-only md:ml-2">Leaderboards</span>
            </Button>
            
            <ModeToggle />
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="mr-2">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only md:not-sr-only md:ml-2">Settings</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
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
                <Button variant="ghost" size="sm" className="ml-2">
                  <Avatar className="h-8 w-8 bg-primary/10">
                    <AvatarFallback className="text-lg">{avatarEmoji}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only md:not-sr-only md:ml-2">
                    {activeProfile?.name || "Profile"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
      </div>
    </header>
  );
};

export default NavBar;

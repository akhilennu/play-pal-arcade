
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import NavBar from '@/components/NavBar';
import { getAvatarEmoji, getDefaultAvatars, formatDate } from '@/utils/userUtils';
import { useGameContext } from '@/contexts/GameContext';
import { ModeToggle } from '@/components/ModeToggle';
import { ArrowLeft, Bell, Music, Star } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGameContext();
  const { profiles, activeProfileId, soundEnabled, musicEnabled, scores } = state;
  
  const activeProfile = profiles.find(profile => profile.id === activeProfileId);
  const [nameInput, setNameInput] = useState(activeProfile?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(activeProfile?.avatarId || 0);
  
  // If no active profile, redirect to home
  if (!activeProfile) {
    navigate('/');
    return null;
  }
  
  // Get user's scores
  const userScores = scores.filter(score => score.userId === activeProfileId);
  
  // Update profile
  const handleUpdateProfile = () => {
    if (!nameInput.trim()) return;
    
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        id: activeProfileId,
        name: nameInput,
        avatarId: selectedAvatar
      }
    });
  };
  
  // Toggle sound
  const handleToggleSound = (enabled: boolean) => {
    dispatch({ type: 'TOGGLE_SOUND', payload: enabled });
  };
  
  // Toggle music
  const handleToggleMusic = (enabled: boolean) => {
    dispatch({ type: 'TOGGLE_MUSIC', payload: enabled });
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 container p-4 md:p-6">
        <div className="mb-6 flex items-center">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Your Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-4xl mb-2">
                    {getAvatarEmoji(activeProfile.avatarId)}
                  </div>
                  <p className="text-lg font-medium">{activeProfile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(activeProfile.createdAt)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Select Avatar</Label>
                  <div className="grid grid-cols-5 gap-2 mt-1">
                    {getDefaultAvatars().slice(0, 10).map((emoji, index) => (
                      <Button
                        key={index}
                        variant={selectedAvatar === index ? "default" : "outline"}
                        className="h-10 w-10 p-0 text-lg"
                        onClick={() => setSelectedAvatar(index)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full" onClick={handleUpdateProfile}>
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="scores" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="scores">Your Scores</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scores" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="mr-2 h-5 w-5" />
                      Recent Scores
                    </CardTitle>
                    <CardDescription>Your game performance history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userScores.length > 0 ? (
                      <div className="space-y-4">
                        <div className="rounded-md border">
                          <div className="grid grid-cols-4 p-3 bg-muted/50">
                            <div className="font-medium">Game</div>
                            <div className="font-medium">Difficulty</div>
                            <div className="font-medium text-right">Score</div>
                            <div className="font-medium text-right">Date</div>
                          </div>
                          {userScores
                            .sort((a, b) => b.date.getTime() - a.date.getTime())
                            .slice(0, 10)
                            .map((score, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-4 p-3 border-t"
                              >
                                <div className="capitalize">
                                  {score.gameId === 'tictactoe'
                                    ? 'Tic-Tac-Toe'
                                    : score.gameId === 'memorymatch'
                                    ? 'Memory Match'
                                    : score.gameId === 'game2048'
                                    ? '2048'
                                    : score.gameId}
                                </div>
                                <div className="capitalize">{score.difficulty}</div>
                                <div className="text-right font-semibold">{score.score}</div>
                                <div className="text-right text-muted-foreground">
                                  {formatDate(score.date)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>You haven't played any games yet.</p>
                        <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
                          Play Games
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Game Settings</CardTitle>
                    <CardDescription>Configure your game preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Theme</Label>
                        <p className="text-sm text-muted-foreground">
                          Choose between light and dark mode
                        </p>
                      </div>
                      <ModeToggle />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sound" className="text-base">
                          <div className="flex items-center">
                            <Bell className="mr-2 h-4 w-4" />
                            Sound Effects
                          </div>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable game sound effects
                        </p>
                      </div>
                      <Switch
                        id="sound"
                        checked={soundEnabled}
                        onCheckedChange={handleToggleSound}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="music" className="text-base">
                          <div className="flex items-center">
                            <Music className="mr-2 h-4 w-4" />
                            Background Music
                          </div>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable game background music
                        </p>
                      </div>
                      <Switch
                        id="music"
                        checked={musicEnabled}
                        onCheckedChange={handleToggleMusic}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

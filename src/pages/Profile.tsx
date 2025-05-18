import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import NavBar from '@/components/NavBar';
import { getAvatarEmoji, getDefaultAvatars, formatDate } from '@/utils/userUtils';
import { useGameContext } from '@/contexts/GameContext';
import { ModeToggle } from '@/components/ModeToggle';
import { ArrowLeft, Bell, Music, Star, Trash2, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGameContext();
  const { profiles, activeProfileId, soundEnabled, musicEnabled, scores } = state;
  const { toast } = useToast();
  
  const activeProfile = profiles.find(profile => profile.id === activeProfileId);
  const [nameInput, setNameInput] = useState(activeProfile?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(activeProfile?.avatarId || 0);
  
  React.useEffect(() => {
    if (activeProfile) {
      setNameInput(activeProfile.name);
      setSelectedAvatar(activeProfile.avatarId);
    }
  }, [activeProfile]);

  if (!activeProfile) {
    navigate('/');
    return null;
  }
  
  const userScores = scores.filter(score => score.userId === activeProfileId);
  
  const handleUpdateProfile = () => {
    if (!nameInput.trim()) {
      toast({ title: "Validation Error", description: "Display name cannot be empty.", variant: "destructive" });
      return;
    }
    
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        id: activeProfileId!, // activeProfileId is checked, so it's not null here
        name: nameInput,
        avatarId: selectedAvatar
      }
    });
    toast({ title: "Profile Updated", description: "Your profile details have been saved." });
  };
  
  const handleToggleSound = (enabled: boolean) => {
    dispatch({ type: 'TOGGLE_SOUND', payload: enabled });
  };
  
  const handleToggleMusic = (enabled: boolean) => {
    dispatch({ type: 'TOGGLE_MUSIC', payload: enabled });
  };

  const handleResetProfile = () => {
    dispatch({ type: 'RESET_USER_DATA' });
    toast({ title: "Profile Reset", description: "Your profile and game data have been cleared." });
    navigate('/');
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 container p-4 md:p-6 pb-8 md:pb-12">
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
                          <div className="grid grid-cols-4 p-3 bg-muted/50 text-sm">
                            <div className="font-medium">Game</div>
                            <div className="font-medium">Difficulty</div>
                            <div className="font-medium text-right">Score</div>
                            <div className="font-medium text-right">Date</div>
                          </div>
                          {userScores
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 10)
                            .map((score, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-4 p-3 border-t text-sm"
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
                                  {formatDate(new Date(score.date))}
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
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Configure your app and game preferences</CardDescription>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                    <CardDescription>Manage your profile data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="mr-2 h-4 w-4" /> Reset Profile
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your
                            profile data, including scores and achievements.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResetProfile}>
                            Yes, reset profile
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

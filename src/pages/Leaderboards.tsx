
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NavBar from '@/components/NavBar';
import { useGameContext } from '@/contexts/GameContext';
import { getAvatarEmoji, formatDate } from '@/utils/userUtils';
import { getGameById } from '@/data/gamesData';
import { ArrowLeft, Medal, Trophy } from 'lucide-react';
import { GameDifficulty } from '@/types';

const Leaderboards: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameContext();
  const { scores, profiles } = state;
  
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  
  // Filter scores based on selected game and difficulty
  const filteredScores = scores.filter(score => {
    const gameMatch = selectedGame === 'all' || score.gameId === selectedGame;
    const difficultyMatch = selectedDifficulty === 'all' || score.difficulty === selectedDifficulty;
    return gameMatch && difficultyMatch;
  });
  
  // Group scores by user
  const scoresByUser = filteredScores.reduce((acc, score) => {
    if (!acc[score.userId]) {
      acc[score.userId] = [];
    }
    acc[score.userId].push(score);
    return acc;
  }, {} as Record<string, typeof scores>);
  
  // Calculate total score and best score for each user
  const userLeaderboard = Object.entries(scoresByUser).map(([userId, userScores]) => {
    const totalScore = userScores.reduce((sum, score) => sum + score.score, 0);
    const bestScore = Math.max(...userScores.map(score => score.score));
    const gamesPlayed = userScores.length;
    const profile = profiles.find(p => p.id === userId);
    
    return {
      userId,
      name: profile?.name || 'Unknown Player',
      avatarId: profile?.avatarId || 0,
      totalScore,
      bestScore,
      gamesPlayed,
      lastPlayed: new Date(Math.max(...userScores.map(s => s.date.getTime())))
    };
  });
  
  // Sort leaderboard by total score
  const sortedLeaderboard = userLeaderboard.sort((a, b) => b.totalScore - a.totalScore);
  
  // Get game-specific leaderboards
  const getGameHighScores = (gameId: string) => {
    return scores
      .filter(score => score.gameId === gameId)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(score => {
        const profile = profiles.find(p => p.id === score.userId);
        return {
          ...score,
          playerName: profile?.name || 'Unknown Player',
          avatarId: profile?.avatarId || 0
        };
      });
  };
  
  const ticTacToeHighScores = getGameHighScores('tictactoe');
  const memoryMatchHighScores = getGameHighScores('memorymatch');
  const game2048HighScores = getGameHighScores('game2048');
  
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 container p-4 md:p-6">
        <div className="mb-6 flex items-center">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Leaderboards</h1>
        </div>
        
        <Tabs defaultValue="global" className="w-full animate-fade-in">
          <TabsList className="mb-6">
            <TabsTrigger value="global">Global Leaderboard</TabsTrigger>
            <TabsTrigger value="games">Game Leaderboards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="global" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="flex-1">
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Game" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    <SelectItem value="tictactoe">Tic-Tac-Toe</SelectItem>
                    <SelectItem value="memorymatch">Memory Match</SelectItem>
                    <SelectItem value="game2048">2048</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value={GameDifficulty.EASY}>Easy</SelectItem>
                    <SelectItem value={GameDifficulty.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={GameDifficulty.HARD}>Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  Global Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedLeaderboard.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-7 p-3 bg-muted/50">
                      <div className="font-medium">Rank</div>
                      <div className="font-medium col-span-2">Player</div>
                      <div className="font-medium text-right">Games</div>
                      <div className="font-medium text-right">Best Score</div>
                      <div className="font-medium text-right">Total Score</div>
                      <div className="font-medium text-right">Last Played</div>
                    </div>
                    {sortedLeaderboard.map((entry, index) => (
                      <div key={entry.userId} className="grid grid-cols-7 p-3 border-t">
                        <div className="flex items-center">
                          {index === 0 ? (
                            <Medal className="h-5 w-5 text-yellow-500" />
                          ) : index === 1 ? (
                            <Medal className="h-5 w-5 text-gray-400" />
                          ) : index === 2 ? (
                            <Medal className="h-5 w-5 text-amber-700" />
                          ) : (
                            `${index + 1}`
                          )}
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                            {getAvatarEmoji(entry.avatarId)}
                          </span>
                          {entry.name}
                        </div>
                        <div className="text-right">{entry.gamesPlayed}</div>
                        <div className="text-right font-semibold">{entry.bestScore}</div>
                        <div className="text-right font-bold">{entry.totalScore}</div>
                        <div className="text-right text-muted-foreground">
                          {formatDate(entry.lastPlayed)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No scores recorded yet.</p>
                    <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
                      Play Games
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="games" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tic-Tac-Toe</CardTitle>
                </CardHeader>
                <CardContent>
                  {ticTacToeHighScores.length > 0 ? (
                    <div className="space-y-2">
                      {ticTacToeHighScores.map((score, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                        >
                          <div className="flex items-center">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-sm">
                              {getAvatarEmoji(score.avatarId)}
                            </span>
                            <span className="font-medium">{score.playerName}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground mr-2 capitalize">
                              {score.difficulty}
                            </span>
                            <span className="font-bold">{score.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No scores yet
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Memory Match</CardTitle>
                </CardHeader>
                <CardContent>
                  {memoryMatchHighScores.length > 0 ? (
                    <div className="space-y-2">
                      {memoryMatchHighScores.map((score, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                        >
                          <div className="flex items-center">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-sm">
                              {getAvatarEmoji(score.avatarId)}
                            </span>
                            <span className="font-medium">{score.playerName}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground mr-2 capitalize">
                              {score.difficulty}
                            </span>
                            <span className="font-bold">{score.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No scores yet
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>2048</CardTitle>
                </CardHeader>
                <CardContent>
                  {game2048HighScores.length > 0 ? (
                    <div className="space-y-2">
                      {game2048HighScores.map((score, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                        >
                          <div className="flex items-center">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-sm">
                              {getAvatarEmoji(score.avatarId)}
                            </span>
                            <span className="font-medium">{score.playerName}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground mr-2 capitalize">
                              {score.difficulty}
                            </span>
                            <span className="font-bold">{score.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No scores yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Leaderboards;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavBar from '@/components/NavBar';
import { useGameContext } from '@/contexts/GameContext';
import { formatDate } from '@/utils/userUtils';
import { ArrowLeft, Trophy, Star } from 'lucide-react';

const achievements = [
  {
    id: 'first_game',
    name: 'First Steps',
    description: 'Play your first game',
    icon: '🎮',
    category: 'general'
  },
  {
    id: 'tictactoe_master',
    name: 'Tic-Tac-Toe Master',
    description: 'Win 5 games of Tic-Tac-Toe',
    icon: '❌',
    category: 'tictactoe'
  },
  {
    id: 'memory_perfect',
    name: 'Perfect Memory',
    description: 'Complete Memory Match with no mistakes',
    icon: '🧠',
    category: 'memorymatch'
  },
  {
    id: 'reach_1024',
    name: 'Half Way There',
    description: 'Reach the 1024 tile in 2048',
    icon: '🧩',
    category: 'game2048'
  },
  {
    id: 'reach_2048',
    name: '2048 Champion',
    description: 'Reach the 2048 tile',
    icon: '🏆',
    category: 'game2048'
  },
  {
    id: 'play_all_games',
    name: 'Game Explorer',
    description: 'Play all available games at least once',
    icon: '🔍',
    category: 'general'
  },
  {
    id: 'score_10000',
    name: 'Score Hunter',
    description: 'Accumulate a total score of 10,000 points',
    icon: '💯',
    category: 'general'
  },
  {
    id: 'hard_mode',
    name: 'Challenge Seeker',
    description: 'Win a game on Hard difficulty',
    icon: '🔥',
    category: 'general'
  }
];

const Achievements: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useGameContext();
  const { profiles, activeProfileId, scores } = state;
  
  const activeProfile = profiles.find(profile => profile.id === activeProfileId);
  
  // If no active profile, redirect to home
  if (!activeProfile) {
    navigate('/');
    return null;
  }
  
  // Check if achievements should be unlocked
  const userScores = scores.filter(score => score.userId === activeProfileId);
  const gamesCounts = userScores.reduce((acc, score) => {
    acc[score.gameId] = (acc[score.gameId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalScore = userScores.reduce((sum, score) => sum + score.score, 0);
  const uniqueGames = new Set(userScores.map(score => score.gameId)).size;
  const hardModeWins = userScores.some(score => score.difficulty === 'hard');
  
  // Get user's unlocked achievements (mocked for now)
  const unlockedAchievements = new Set([
    'first_game', // Always unlocked if they have scores
    ...(gamesCounts['tictactoe'] && gamesCounts['tictactoe'] >= 5 ? ['tictactoe_master'] : []),
    ...(uniqueGames >= 3 ? ['play_all_games'] : []),
    ...(totalScore >= 10000 ? ['score_10000'] : []),
    ...(hardModeWins ? ['hard_mode'] : [])
  ]);
  
  // Group achievements by category
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);
  
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 container p-4 md:p-6">
        <div className="mb-6 flex items-center">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Achievements</h1>
            <p className="text-muted-foreground">
              Track your progress and unlock rewards
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                Your Progress
              </CardTitle>
              <CardDescription>
                You've unlocked {unlockedAchievements.size} out of {achievements.length} achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${(unlockedAchievements.size / achievements.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-lg mb-3 capitalize">
                      {category === 'general' ? 'General Achievements' : `${category} Achievements`}
                    </h3>
                    <div className="space-y-3">
                      {categoryAchievements.map(achievement => {
                        const isUnlocked = unlockedAchievements.has(achievement.id);
                        return (
                          <div
                            key={achievement.id}
                            className={`flex items-center p-3 rounded-lg border
                              ${isUnlocked
                                ? 'bg-primary/10 border-primary/20'
                                : 'bg-muted/30 border-muted'
                              }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-xl mr-3">
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className="font-medium">{achievement.name}</h4>
                                {isUnlocked && (
                                  <Badge className="ml-2" variant="default">
                                    Unlocked
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {achievement.description}
                              </p>
                            </div>
                            {isUnlocked && (
                              <Star className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Achievements;

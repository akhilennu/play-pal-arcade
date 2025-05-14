
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import NavBar from '@/components/NavBar';
import { ArrowLeft, Info, GameController, Trophy, Settings } from 'lucide-react';

const About: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 container p-4 md:p-6">
        <div className="mb-6 flex items-center">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">About Game Hub</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                About the App
              </CardTitle>
              <CardDescription>
                A collection of classic and casual games for all ages
              </CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Game Hub is a mobile game collection that brings together timeless classics and casual games
                in one beautifully designed application. Built with React and designed with Material Design 3
                principles, Game Hub offers a seamless gaming experience for players of all ages.
              </p>
              <p>
                Each game features multiple difficulty levels, customizable settings, and progress tracking
                to keep you challenged and engaged. Whether you're looking for a quick game during your
                commute or a longer session to train your brain, Game Hub has something for everyone.
              </p>
              <h3 className="flex items-center mt-6 mb-3">
                <GameController className="mr-2 h-5 w-5" />
                Features
              </h3>
              <ul>
                <li>Collection of classic games including Tic-Tac-Toe, Memory Match, and 2048</li>
                <li>Multiple difficulty levels for varied challenges</li>
                <li>User profiles with avatars and customizable settings</li>
                <li>Score tracking and leaderboards</li>
                <li>Achievements system to track your progress</li>
                <li>Both single-player and multiplayer modes</li>
                <li>Clean, modern UI with light and dark mode support</li>
                <li>Offline play for gaming anywhere</li>
              </ul>
              <h3 className="flex items-center mt-6 mb-3">
                <Trophy className="mr-2 h-5 w-5" />
                Coming Soon
              </h3>
              <p>
                We're constantly working to expand our collection with new games and features.
                Here's what you can look forward to in future updates:
              </p>
              <ul>
                <li>Additional games: Sudoku, Hangman, Connect Four, and Nim</li>
                <li>Online multiplayer functionality</li>
                <li>More challenging achievements</li>
                <li>Additional customization options</li>
                <li>Game tutorials and strategy guides</li>
              </ul>
              <h3 className="flex items-center mt-6 mb-3">
                <Settings className="mr-2 h-5 w-5" />
                Settings and Customization
              </h3>
              <p>
                Game Hub offers various customization options to enhance your gaming experience:
              </p>
              <ul>
                <li>Dark/light mode toggle to match your preference or system settings</li>
                <li>Sound and music controls</li>
                <li>Difficulty settings for each game</li>
                <li>Profile customization with avatars</li>
              </ul>
              <p className="text-center mt-8 text-muted-foreground">
                Game Hub v1.0.0 • Copyright © 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;

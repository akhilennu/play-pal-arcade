
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import NavBar from "@/components/NavBar";
import { ArrowLeft, Gamepad2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
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
          <h1 className="text-2xl font-bold">About Play Pal Arcade</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Our Story
                </CardTitle>
                <CardDescription>
                  How Play Pal Arcade came to be
                </CardDescription>
              </CardHeader>
              <CardContent className="prose dark:prose-invert">
                <p>
                  Play Pal Arcade was created with a simple mission: to bring joy through classic games that everyone can enjoy. We believe that games are not just about entertainment—they're about bringing people together, challenging our minds, and creating memorable moments.
                </p>
                
                <p>
                  Our collection features timeless classics that have been loved by generations, reimagined for the modern digital experience. From the strategic thinking of Tic-Tac-Toe to the pattern recognition of Memory Match to the addictive number-sliding of 2048, these games offer something for everyone.
                </p>
                
                <h3>Our Values</h3>
                
                <ul>
                  <li><strong>Accessibility:</strong> Games should be for everyone, regardless of age or gaming experience.</li>
                  <li><strong>Quality:</strong> We believe in delivering a polished, bug-free gaming experience.</li>
                  <li><strong>Community:</strong> Gaming is better together—whether competing or collaborating.</li>
                  <li><strong>Nostalgia:</strong> We celebrate the timeless joy of classic games that have stood the test of time.</li>
                </ul>
                
                <p>
                  Thank you for playing with us. We're constantly working to add new games and features to enhance your experience.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Version Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">App Version</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">May 14, 2023</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Games Available</span>
                    <span className="font-medium">6</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Connect With Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Have feedback or suggestions? We'd love to hear from you!
                  </p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full">
                    Report a Bug
                  </Button>
                  <Button variant="outline" className="w-full">
                    Request a Feature
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Made with <Heart className="inline h-4 w-4 text-red-500" /> by Game Hub Team</p>
              <p>© 2023 Play Pal Arcade. All rights reserved.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;

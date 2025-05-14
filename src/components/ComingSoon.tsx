
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="text-6xl mb-6">🚧</div>
      <h1 className="text-3xl font-bold mb-4">Coming Soon!</h1>
      <p className="text-lg text-center text-muted-foreground mb-8">
        This game is currently in development and will be available soon.
      </p>
      <Button onClick={() => navigate('/')} variant="default">
        Back to Home
      </Button>
    </div>
  );
};

export default ComingSoon;

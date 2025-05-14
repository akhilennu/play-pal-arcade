
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty, MemoryCard } from '@/types';

const MemoryMatch: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const { difficulty } = state.gameSettings;
  const { activeProfileId } = state;
  
  // Game state
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  
  // Determine board size based on difficulty
  const getBoardConfig = () => {
    switch (difficulty) {
      case GameDifficulty.EASY:
        return { rows: 3, cols: 4 }; // 12 cards, 6 pairs
      case GameDifficulty.HARD:
        return { rows: 4, cols: 6 }; // 24 cards, 12 pairs
      case GameDifficulty.MEDIUM:
      default:
        return { rows: 4, cols: 4 }; // 16 cards, 8 pairs
    }
  };
  
  const { rows, cols } = getBoardConfig();
  const totalPairs = (rows * cols) / 2;
  
  // Initialize game
  const initializeGame = () => {
    // Create pairs of cards
    const cardValues = Array.from({ length: totalPairs }, (_, i) => i + 1);
    // Create pairs
    const cardPairs = [...cardValues, ...cardValues];
    // Shuffle cards
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setIsChecking(false);
    setGameFinished(false);
    setStartTime(new Date());
    setEndTime(null);
  };
  
  // Initialize on mount and when difficulty changes
  useEffect(() => {
    initializeGame();
  }, [difficulty]);
  
  // Check for game completion
  useEffect(() => {
    if (matchedPairs.length === totalPairs && !gameFinished) {
      const endTimeVal = new Date();
      setEndTime(endTimeVal);
      setGameFinished(true);
      
      // Calculate score based on moves and difficulty
      const timeElapsed = endTimeVal.getTime() - (startTime?.getTime() || 0);
      const secondsElapsed = Math.floor(timeElapsed / 1000);
      
      let baseScore = 1000;
      const difficultyMultiplier = 
        difficulty === GameDifficulty.EASY ? 1 :
        difficulty === GameDifficulty.MEDIUM ? 1.5 : 2;
      
      // Score formula: base score * difficulty - (moves penalty) - (time penalty)
      const movesPenalty = moves * 10;
      const timePenalty = secondsElapsed * 2;
      const finalScore = Math.max(
        Math.floor((baseScore * difficultyMultiplier) - movesPenalty - timePenalty), 
        50
      );
      
      if (activeProfileId) {
        dispatch({
          type: 'ADD_SCORE',
          payload: {
            userId: activeProfileId,
            gameId: 'memorymatch',
            score: finalScore,
            difficulty: difficulty as GameDifficulty,
            date: new Date(),
          },
        });
      }
      
      toast({
        title: "Game Complete!",
        description: `You completed the game in ${moves} moves and ${secondsElapsed} seconds. Score: ${finalScore}`,
      });
    }
  }, [matchedPairs, totalPairs, gameFinished, moves]);
  
  // Handle card click
  const handleCardClick = (index: number) => {
    // Ignore clicks if already checking a pair or card is already flipped or matched
    if (
      isChecking || 
      flippedIndices.includes(index) || 
      cards[index].isMatched ||
      flippedIndices.length >= 2
    ) {
      return;
    }
    
    // Flip the card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);
    
    // If two cards are flipped, check for match
    if (newFlippedIndices.length === 2) {
      setIsChecking(true);
      setMoves(moves + 1);
      
      const [firstIndex, secondIndex] = newFlippedIndices;
      
      if (cards[firstIndex].value === cards[secondIndex].value) {
        // Match found
        setTimeout(() => {
          const newCards = [...cards];
          newCards[firstIndex].isMatched = true;
          newCards[secondIndex].isMatched = true;
          setCards(newCards);
          setMatchedPairs([...matchedPairs, cards[firstIndex].value]);
          setFlippedIndices([]);
          setIsChecking(false);
        }, 500);
      } else {
        // No match, flip back
        setTimeout(() => {
          const newCards = [...cards];
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards(newCards);
          setFlippedIndices([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };
  
  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-xl font-bold mb-4 flex justify-between items-center">
        <span>Moves: {moves}</span>
        <Button onClick={initializeGame}>New Game</Button>
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <div 
            className="grid gap-2" 
            style={{ 
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
            }}
          >
            {cards.map((card, index) => (
              <Card
                key={card.id}
                className={`
                  aspect-square flex items-center justify-center p-0 cursor-pointer
                  ${card.isFlipped || card.isMatched ? '' : 'bg-memory-primary hover:bg-memory-primary/90'}
                  transition-transform duration-300 transform
                  ${card.isFlipped || card.isMatched ? 'scale-100 rotate-y-180' : 'scale-95'}
                `}
                onClick={() => handleCardClick(index)}
              >
                {(card.isFlipped || card.isMatched) ? (
                  <div className={`
                    w-full h-full flex items-center justify-center text-3xl font-bold
                    ${card.isMatched ? 'bg-memory-accent/20' : 'bg-memory-secondary/30'}
                  `}>
                    {card.value}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                    ?
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {gameFinished && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-md text-center">
          <h3 className="text-lg font-semibold mb-2">Congratulations!</h3>
          <p>You matched all pairs in {moves} moves.</p>
          <p>Time: {endTime && startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0} seconds</p>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;

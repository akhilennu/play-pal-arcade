import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty, MemoryCard } from '@/types';
import { getBoardConfig, generateNewBoard, calculateMemoryMatchScore } from './memorymatch/memoryMatchLogic';

const MemoryMatch: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const { difficulty } = state.gameSettings;
  const { activeProfileId } = state;
  
  // Game state
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairsValues, setMatchedPairsValues] = useState<number[]>([]); // Store matched values
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  
  // Determine board size based on difficulty
  const boardConfig = getBoardConfig(difficulty);
  const { rows, cols, totalPairs } = boardConfig;
  
  // Initialize game
  const initializeGame = () => {
    const newCards = generateNewBoard(rows, cols);
    setCards(newCards);
    setFlippedIndices([]);
    setMatchedPairsValues([]);
    setMoves(0);
    setIsChecking(false);
    setGameFinished(false);
    setStartTime(new Date());
    setEndTime(null);
  };
  
  // Initialize on mount and when difficulty changes
  useEffect(() => {
    initializeGame();
  }, [difficulty, rows, cols]); // Depend on rows/cols in case boardConfig changes more dynamically
  
  // Check for game completion
  useEffect(() => {
    if (matchedPairsValues.length === totalPairs && cards.length > 0 && !gameFinished) {
      const endTimeVal = new Date();
      setEndTime(endTimeVal);
      setGameFinished(true);
      
      const finalScore = calculateMemoryMatchScore(moves, startTime, endTimeVal, difficulty);
      
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
        description: `You completed the game in ${moves} moves and ${Math.floor((endTimeVal.getTime() - (startTime?.getTime() || 0)) / 1000)} seconds. Score: ${finalScore}`,
      });
    }
  }, [matchedPairsValues, totalPairs, cards, gameFinished, moves, startTime, difficulty, activeProfileId, dispatch]);
  
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
    const newCards = cards.map((card, i) => 
      i === index ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);
    
    // If two cards are flipped, check for match
    if (newFlippedIndices.length === 2) {
      setIsChecking(true);
      setMoves(moves + 1);
      
      const [firstIndex, secondIndex] = newFlippedIndices;
      
      if (newCards[firstIndex].value === newCards[secondIndex].value) {
        // Match found
        setTimeout(() => {
          setCards(prevCards => prevCards.map(card => 
            card.value === newCards[firstIndex].value ? { ...card, isMatched: true, isFlipped: true } : card
          ));
          setMatchedPairsValues(prev => [...prev, newCards[firstIndex].value]);
          setFlippedIndices([]);
          setIsChecking(false);
        }, 500);
      } else {
        // No match, flip back
        setTimeout(() => {
          setCards(prevCards => prevCards.map((card, i) => 
            i === firstIndex || i === secondIndex ? { ...card, isFlipped: false } : card
          ));
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
        <div className="w-full max-w-2xl">
          <div 
            className="grid gap-2" 
            style={{ 
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              // gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` // Aspect square handles row height
            }}
          >
            {cards.map((card, index) => (
              <Card
                key={card.id}
                className={`
                  aspect-square flex items-center justify-center p-0 cursor-pointer
                  ${card.isFlipped || card.isMatched ? '' : 'bg-memory-primary hover:bg-memory-primary/90'}
                  transition-all duration-300 transform-style-preserve-3d 
                  ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
                `}
                onClick={() => handleCardClick(index)}
              >
                <div className={`w-full h-full flex items-center justify-center text-3xl font-bold backface-hidden ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
                  ?
                </div>
                <div className={`
                    w-full h-full flex items-center justify-center text-3xl font-bold absolute top-0 left-0 rotate-y-180 backface-hidden
                    ${card.isMatched ? 'bg-memory-accent/20' : 'bg-memory-secondary/30'}
                  `}>
                    {card.value}
                  </div>
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

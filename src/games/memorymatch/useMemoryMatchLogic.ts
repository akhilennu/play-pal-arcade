
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty, MemoryCard } from '@/types';
import { getBoardConfig, generateNewBoard, calculateMemoryMatchScore } from './memoryMatchLogic';

export const useMemoryMatchLogic = () => {
  const { state, dispatch } = useGameContext();
  const { difficulty } = state.gameSettings;
  const { activeProfileId } = state;

  const boardConfig = getBoardConfig(difficulty);
  const { rows, cols, totalPairs } = boardConfig;

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairsValues, setMatchedPairsValues] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const initializeGame = useCallback(() => {
    const newCards = generateNewBoard(rows, cols);
    setCards(newCards);
    setFlippedIndices([]);
    setMatchedPairsValues([]);
    setMoves(0);
    setIsChecking(false);
    setGameFinished(false);
    setStartTime(new Date());
    setEndTime(null);
  }, [rows, cols]);

  useEffect(() => {
    initializeGame();
  }, [difficulty, initializeGame]); // initializeGame depends on rows/cols which depend on difficulty

  useEffect(() => {
    if (matchedPairsValues.length === totalPairs && cards.length > 0 && !gameFinished && totalPairs > 0) {
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

  const handleCardClick = (index: number) => {
    if (isChecking || flippedIndices.includes(index) || cards[index].isMatched || flippedIndices.length >= 2) {
      return;
    }

    const newCards = cards.map((card, i) =>
      i === index ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsChecking(true);
      setMoves(prevMoves => prevMoves + 1);

      const [firstIndex, secondIndex] = newFlippedIndices;

      if (newCards[firstIndex].value === newCards[secondIndex].value) {
        setTimeout(() => {
          setCards(prevCards => prevCards.map(card =>
            card.value === newCards[firstIndex].value ? { ...card, isMatched: true, isFlipped: true } : card
          ));
          setMatchedPairsValues(prev => [...prev, newCards[firstIndex].value]);
          setFlippedIndices([]);
          setIsChecking(false);
        }, 500);
      } else {
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

  return {
    cards,
    moves,
    gameFinished,
    startTime,
    endTime,
    initializeGame,
    handleCardClick,
    boardConfig,
    isChecking, // Make sure to return isChecking if MemoryMatchCard needs it for disabling clicks
    flippedIndices // For card state
  };
};


import React from 'react';
import { MemoryCard as MemoryCardType } from '@/types';
import MemoryMatchCard from './MemoryMatchCard';

interface MemoryMatchBoardProps {
  cards: MemoryCardType[];
  onCardClick: (index: number) => void;
  columns: number;
  // rows: number; // Not strictly needed if aspect-square handles height
}

const MemoryMatchBoard: React.FC<MemoryMatchBoardProps> = ({ cards, onCardClick, columns }) => {
  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {cards.map((card, index) => (
            <MemoryMatchCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemoryMatchBoard;

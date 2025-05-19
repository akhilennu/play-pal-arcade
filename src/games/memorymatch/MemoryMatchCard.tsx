
import React from 'react';
import { Card } from '@/components/ui/card'; // Shadcn Card
import { MemoryCard as MemoryCardType } from '@/types';

interface MemoryMatchCardProps {
  card: MemoryCardType;
  onClick: () => void;
  // isFlipped and isMatched are part of card object, no need to pass separately if card is up-to-date
}

const MemoryMatchCard: React.FC<MemoryMatchCardProps> = ({ card, onClick }) => {
  return (
    <Card
      className={`
        aspect-square flex items-center justify-center p-0 cursor-pointer
        select-none
        ${card.isFlipped || card.isMatched ? '' : 'bg-memory-primary hover:bg-memory-primary/90'}
        transition-all duration-300 transform-style-preserve-3d
        ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
      `}
      onClick={onClick}
      role="button"
      aria-pressed={card.isFlipped}
      aria-label={card.isFlipped || card.isMatched ? `Card value ${card.value}` : "Hidden card"}
    >
      {/* Front of the card (visible when not flipped) */}
      <div className={`
        w-full h-full flex items-center justify-center text-3xl font-bold backface-hidden
        ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''} 
      `}>
        ?
      </div>
      {/* Back of the card (visible when flipped) */}
      <div className={`
        w-full h-full flex items-center justify-center text-3xl font-bold 
        absolute top-0 left-0 rotate-y-180 backface-hidden
        ${card.isMatched ? 'bg-memory-accent/20' : 'bg-memory-secondary/30'}
      `}>
        {card.value}
      </div>
    </Card>
  );
};

export default MemoryMatchCard;

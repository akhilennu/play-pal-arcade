
import { v4 as uuidv4 } from 'uuid';
import { UserProfile } from '@/types';

const DEFAULT_AVATARS = [
  "👾", "🎮", "🎯", "🎲", "🎪", "🎭", "🦄", "🐉", "🦊", "🐼",
  "🐱", "🐶", "🦁", "🐯", "🐻", "🐨", "🐹", "🐰", "🦔", "🐢"
];

export const createNewProfile = (name: string, avatarId: number): UserProfile => {
  return {
    id: uuidv4(),
    name,
    avatarId,
    createdAt: new Date(),
    theme: "system",
    soundEnabled: true,
    musicEnabled: true,
    achievements: []
  };
};

export const getAvatarEmoji = (avatarId: number): string => {
  return DEFAULT_AVATARS[avatarId % DEFAULT_AVATARS.length];
};

export const getDefaultAvatars = () => DEFAULT_AVATARS;

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Player } from '@/types/nba';
import { cn } from '@/lib/utils';

// Create a type with only the properties we need
type MinimalPlayer = {
  playerID: string;
  shortName: string;
  longName: string;
  headshotUrl?: string;
  nbaComHeadshot?: string;
  espnHeadshot?: string;
};

interface PlayerAvatarProps {
  player: MinimalPlayer;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16'
};

export function PlayerAvatar({ player, className, size = 'md' }: PlayerAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  // Create an array of available headshot URLs
  const availableUrls = [
    player.headshotUrl,
    player.nbaComHeadshot,
    player.espnHeadshot
  ].filter(Boolean) as string[];

  // Use the first letter of each part of the shortName
  const initials = player.shortName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();

  const handleImageError = () => {
    if (currentUrlIndex < availableUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      setImgError(true);
    }
  };

  // Reset error state when player changes
  useEffect(() => {
    setImgError(false);
    setCurrentUrlIndex(0);
  }, [player.playerID, player.longName]);

  const currentUrl = !imgError && availableUrls[currentUrlIndex];

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {currentUrl && (
        <AvatarImage
          src={currentUrl}
          alt={player.longName}
          onError={handleImageError}
          className="object-cover object-top"
        />
      )}
      <AvatarFallback className="bg-gray-800 text-white/80">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

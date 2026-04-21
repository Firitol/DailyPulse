"use client"

import React from 'react';
import { MOODS, MoodType } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MoodSelectorProps {
  onSelect: (mood: MoodType) => void;
  selectedMood?: MoodType;
  disabled?: boolean;
}

export function MoodSelector({ onSelect, selectedMood, disabled }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 w-full">
      {MOODS.map((m) => {
        const isSelected = selectedMood === m.label;
        return (
          <button
            key={m.label}
            onClick={() => onSelect(m.label)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 border-2",
              isSelected 
                ? "border-primary bg-primary/5 scale-105 shadow-md" 
                : "border-transparent bg-white hover:border-accent hover:bg-accent/5",
              disabled && !isSelected && "opacity-50 grayscale"
            )}
          >
            <span className="text-4xl mb-2">{m.emoji}</span>
            <span className="text-sm font-medium">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
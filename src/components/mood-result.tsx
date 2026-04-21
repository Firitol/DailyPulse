"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Lightbulb, Heart } from 'lucide-react';
import { GenerateMoodGuideOutput } from '@/ai/flows/generate-mood-guide';

interface MoodResultProps {
  result: GenerateMoodGuideOutput;
  mood: string;
}

export function MoodResult({ result, mood }: MoodResultProps) {
  return (
    <Card className="border-none shadow-lg bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Sparkles className="h-4 w-4" />
          <span>Daily Guide for feeling {mood}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="flex gap-3">
          <div className="shrink-0 mt-1">
            <Heart className="h-5 w-5 text-red-400 fill-red-400/10" />
          </div>
          <div>
            <p className="text-lg font-medium leading-relaxed">
              "{result.supportiveMessage}"
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <Lightbulb className="h-4 w-4 text-secondary" />
            <span>Practical Suggestions</span>
          </div>
          <ul className="grid gap-2">
            {result.suggestions.map((suggestion, idx) => (
              <li key={idx} className="bg-accent/30 p-4 rounded-xl text-sm border border-accent/20">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
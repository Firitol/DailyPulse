"use client"

import React from 'react';
import { MoodEntry, MOODS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isToday } from 'date-fns';
import { History } from 'lucide-react';

interface MoodHistoryProps {
  entries: MoodEntry[];
}

export function MoodHistory({ entries }: MoodHistoryProps) {
  if (entries.length === 0) {
    return (
      <Card className="bg-white/50 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <History className="h-8 w-8 mb-2 opacity-20" />
          <p>Your mood history will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <History className="h-5 w-5" />
        History
      </h3>
      <div className="grid gap-3">
        {sortedEntries.map((entry) => {
          const moodInfo = MOODS.find(m => m.label === entry.mood);
          return (
            <Card key={entry.id} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl" role="img" aria-label={entry.mood}>
                    {moodInfo?.emoji}
                  </span>
                  <div>
                    <p className="font-semibold">{entry.mood}</p>
                    <p className="text-xs text-muted-foreground">
                      {isToday(new Date(entry.date)) ? 'Today' : format(new Date(entry.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {entry.message && (
                  <div className="hidden md:block max-w-md text-right">
                    <p className="text-sm text-muted-foreground italic truncate">
                      "{entry.message}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
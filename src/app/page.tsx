"use client"

import React, { useState, useEffect } from 'react';
import { MoodType, MoodEntry } from '@/lib/types';
import { MoodSelector } from '@/components/mood-selector';
import { MoodResult } from '@/components/mood-result';
import { MoodHistory } from '@/components/mood-history';
import { ReminderBanner } from '@/components/reminder-banner';
import { generateMoodGuide, GenerateMoodGuideOutput } from '@/ai/flows/generate-mood-guide';
import { format, isToday } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

export default function DailyPulse() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<MoodEntry | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load local data (simulating DB persistency)
    const stored = localStorage.getItem('dailypulse_moods');
    if (stored) {
      const parsed: MoodEntry[] = JSON.parse(stored);
      setEntries(parsed);
      
      const todayEntry = parsed.find(e => isToday(new Date(e.date)));
      if (todayEntry) {
        setCurrentEntry(todayEntry);
      } else {
        setShowReminder(true);
      }
    } else {
      setShowReminder(true);
    }
    setIsLoading(false);
  }, []);

  const handleMoodSelect = async (mood: MoodType) => {
    setIsCheckingIn(true);
    try {
      // Use the GenAI flow
      const guide = await generateMoodGuide({ mood });
      
      const newEntry: MoodEntry = {
        id: crypto.randomUUID(),
        mood,
        date: new Date().toISOString(),
        message: guide.supportiveMessage,
        suggestions: guide.suggestions
      };

      // Filter out any existing entries for today (allow edit/overwrite)
      const updatedEntries = entries.filter(e => !isToday(new Date(e.date)));
      const finalEntries = [newEntry, ...updatedEntries];
      
      setEntries(finalEntries);
      setCurrentEntry(newEntry);
      localStorage.setItem('dailypulse_moods', JSON.stringify(finalEntries));
      setShowReminder(false);
      
      toast({
        title: "Checked in!",
        description: "Your mood has been recorded for today.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate your mood guide. Please try again.",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-12 w-48 mx-auto" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 md:py-16 space-y-10">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-primary">DailyPulse</h1>
        <p className="text-muted-foreground font-medium">Your companion for emotional clarity and growth.</p>
      </header>

      {/* Reminder */}
      {showReminder && !currentEntry && (
        <ReminderBanner onDismiss={() => setShowReminder(false)} />
      )}

      {/* Check-in Section */}
      <section className="space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-semibold">How are you feeling today?</h2>
          <p className="text-muted-foreground">Check in once a day to track your emotional journey.</p>
        </div>

        <MoodSelector 
          onSelect={handleMoodSelect} 
          selectedMood={currentEntry?.mood}
          disabled={isCheckingIn}
        />

        {isCheckingIn && (
          <div className="space-y-4 animate-pulse">
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {currentEntry && !isCheckingIn && (
          <MoodResult 
            mood={currentEntry.mood}
            result={{
              supportiveMessage: currentEntry.message || "Thinking of you.",
              suggestions: currentEntry.suggestions || []
            }} 
          />
        )}
      </section>

      {/* History Section */}
      <section className="pt-8 border-t border-muted">
        <MoodHistory entries={entries} />
      </section>

      <Toaster />
    </main>
  );
}
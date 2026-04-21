"use client"

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { isToday } from 'date-fns';
import { MoodType, MoodEntry, UserProfile } from '@/lib/types';
import { MoodSelector } from '@/components/mood-selector';
import { MoodResult } from '@/components/mood-result';
import { MoodHistory } from '@/components/mood-history';
import { ReminderBanner } from '@/components/reminder-banner';
import { AuthForm } from '@/components/auth-form';
import { OnboardingTour } from '@/components/onboarding-tour';
import { SocialFeed } from '@/components/social-feed';
import { CreatePost } from '@/components/create-post';
import { MoodInsights } from '@/components/mood-insights';
import { generateMoodGuide } from '@/ai/flows/generate-mood-guide';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { useMemoFirebase } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings, LayoutDashboard, MessageSquare, History as HistoryIcon } from 'lucide-react';

export default function DailyPulse() {
  const { user, isUserLoading } = useUser();
  const { t, language } = useLanguage();
  const db = useFirestore();
  const { toast } = useToast();

  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Fetch user profile
  const userDocRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc<UserProfile>(userDocRef);

  // Fetch mood history
  const moodsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'moodEntries'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
  }, [db, user]);
  const { data: entries, isLoading: isEntriesLoading } = useCollection<MoodEntry>(moodsQuery);

  const todayEntry = entries?.find(e => isToday(new Date(e.date)));

  useEffect(() => {
    if (profile && !profile.onboardingCompleted) {
      setShowTour(true);
    }
  }, [profile]);

  const handleMoodSelect = async (mood: MoodType) => {
    if (!user) return;
    setIsCheckingIn(true);
    try {
      const languageMap = { en: 'English', om: 'Afan Oromo', am: 'Amharic' };
      const guide = await generateMoodGuide({ 
        mood, 
        language: (languageMap[language] || 'English') as any
      });
      
      const moodEntryId = crypto.randomUUID();
      const newEntryRef = doc(db, 'users', user.uid, 'moodEntries', moodEntryId);
      
      await setDoc(newEntryRef, {
        id: moodEntryId,
        userId: user.uid,
        mood,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        message: guide.supportiveMessage,
        suggestions: guide.suggestions,
        moodGuideMessageId: 'generated-via-ai'
      });
      
      toast({
        title: t.toastCheckedIn,
        description: t.toastCheckedInDesc,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t.toastError,
        description: t.toastErrorDesc,
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-12 w-48 mx-auto" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight text-primary">{t.appTitle}</h1>
            <p className="text-muted-foreground">{t.tagline}</p>
          </div>
          <AuthForm />
        </div>
        <Toaster />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">{t.appTitle}</h1>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button variant="ghost" size="icon" onClick={() => setShowTour(true)} title={t.replayTour}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => useAuth().signOut()} title={t.logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
        {profile && <OnboardingTour userId={user.uid} isOpen={showTour} onClose={() => setShowTour(false)} />}

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12 rounded-full p-1 bg-muted/50">
            <TabsTrigger value="dashboard" className="rounded-full gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-full gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{t.community}</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-full gap-2">
              <HistoryIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.history}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-10 outline-none">
            <header className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight">
                {t.welcome}, {user.displayName?.split(' ')[0]}!
              </h2>
              <p className="text-muted-foreground">{t.tagline}</p>
            </header>

            {!todayEntry && <ReminderBanner onDismiss={() => {}} />}

            <section className="space-y-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold">{t.howFeeling}</h3>
                <p className="text-sm text-muted-foreground">{t.checkInDesc}</p>
              </div>

              <MoodSelector 
                onSelect={handleMoodSelect} 
                selectedMood={todayEntry?.mood}
                disabled={isCheckingIn}
              />

              {isCheckingIn && (
                <div className="space-y-4 animate-pulse">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
              )}

              {todayEntry && !isCheckingIn && (
                <MoodResult 
                  mood={todayEntry.mood}
                  result={{
                    supportiveMessage: todayEntry.message || "Thinking of you.",
                    suggestions: todayEntry.suggestions || []
                  }} 
                />
              )}
            </section>

            <section className="pt-4">
              <h3 className="text-xl font-semibold mb-6">{t.insights}</h3>
              <MoodInsights entries={entries || []} />
            </section>
          </TabsContent>

          <TabsContent value="community" className="space-y-6 outline-none">
            <header>
              <h2 className="text-2xl font-bold">{t.community}</h2>
              <p className="text-muted-foreground">Stay inspired by others.</p>
            </header>
            <CreatePost />
            <SocialFeed />
          </TabsContent>

          <TabsContent value="history" className="outline-none">
            <MoodHistory entries={entries || []} />
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </main>
  );
}

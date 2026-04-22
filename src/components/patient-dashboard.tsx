
"use client"

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useAuth, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { MoodType, MoodEntry, UserProfile, Assignment, DoctorProfile, DoctorNote } from '@/lib/types';
import { MoodSelector } from '@/components/mood-selector';
import { MoodResult } from '@/components/mood-result';
import { MoodHistory } from '@/components/mood-history';
import { ReminderBanner } from '@/components/reminder-banner';
import { OnboardingTour } from '@/components/onboarding-tour';
import { SocialFeed } from '@/components/social-feed';
import { CreatePost } from '@/components/create-post';
import { MoodInsights } from '@/components/mood-insights';
import { generateMoodGuide } from '@/ai/flows/generate-mood-guide';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings, LayoutDashboard, MessageSquare, History as HistoryIcon, Stethoscope, Search, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SupportChat } from '@/components/support-chat';

export function PatientDashboard({ profile }: { profile: UserProfile }) {
  const { user } = useUser();
  const { t, language } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [todayStr, setTodayStr] = useState<string | null>(null);

  // Set today's date string on the client only to avoid hydration mismatch
  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  const moodsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'users', user.uid, 'moodEntries'), orderBy('createdAt', 'desc'), limit(30));
  }, [db, user]);
  const { data: entries, isLoading: isMoodsLoading } = useCollection<MoodEntry>(moodsQuery);

  const assignmentsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return collection(db, 'assignments');
  }, [db, user]);
  const { data: rawAssignments } = useCollection<Assignment>(assignmentsQuery);

  const doctorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'doctorProfiles');
  }, [db]);
  const { data: allDoctors } = useCollection<DoctorProfile>(doctorsQuery);

  const notesQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'doctorNotes'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: rawDoctorNotes } = useCollection<DoctorNote>(notesQuery);

  const todayEntry = todayStr ? entries?.find(e => e.date === todayStr) : null;
  
  const assignments = rawAssignments?.filter(a => a.patientId === user?.uid);
  const myAssignment = assignments?.find(a => a.status === 'accepted');
  const myDoctor = allDoctors?.find(d => d.userId === myAssignment?.doctorId);
  const doctorNotes = rawDoctorNotes?.filter(n => n.patientId === user?.uid);

  useEffect(() => {
    if (profile && !profile.onboardingCompleted) {
      setShowTour(true);
    }
  }, [profile]);

  const handleMoodSelect = async (mood: MoodType) => {
    if (!user || !db || isCheckingIn || !todayStr) return;
    
    setIsCheckingIn(true);
    try {
      const languageMap = { en: 'English', om: 'Afan Oromo', am: 'Amharic' };
      
      let supportiveMessage = "Thinking of you. Take it one step at a time.";
      let suggestions = ["Take a deep breath", "Stay hydrated"];

      try {
        const guide = await generateMoodGuide({ 
          mood, 
          language: (languageMap[language] || 'English') as any
        });
        supportiveMessage = guide.supportiveMessage;
        suggestions = guide.suggestions;
      } catch (aiError) {
        console.warn("AI Guide generation failed, using fallback:", aiError);
      }
      
      const moodEntryId = crypto.randomUUID();
      const docRef = doc(db, 'users', user.uid, 'moodEntries', moodEntryId);
      
      setDocumentNonBlocking(docRef, {
        id: moodEntryId,
        userId: user.uid,
        mood,
        date: todayStr,
        createdAt: new Date().toISOString(),
        message: supportiveMessage,
        suggestions: suggestions,
        moodGuideMessageId: 'generated-via-ai'
      }, { merge: true });
      
      toast({ title: t.toastCheckedIn });
    } catch (error: any) {
      console.error("Check-in failed:", error);
      toast({ variant: "destructive", title: t.toastError, description: error.message });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleRequestDoctor = (doctorId: string) => {
    if (!user || !db) return;
    const assignmentId = `${user.uid}_${doctorId}`;
    setDocumentNonBlocking(doc(db, 'assignments', assignmentId), {
      id: assignmentId,
      patientId: user.uid,
      doctorId: doctorId,
      status: 'pending',
      createdAt: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Request Sent", description: "The doctor will review your request soon." });
  };

  return (
    <main className="min-h-screen bg-background relative">
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="bg-primary text-white p-1 rounded-lg">DP</span> {t.appTitle}
          </h1>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button variant="ghost" size="icon" onClick={() => setShowTour(true)} className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => auth.signOut()} className="rounded-full">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">
        {profile && user && <OnboardingTour userId={user.uid} isOpen={showTour} onClose={() => setShowTour(false)} />}

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 rounded-full p-1 h-12">
            <TabsTrigger value="dashboard" className="rounded-full gap-2"><LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">Dashboard</span></TabsTrigger>
            <TabsTrigger value="doctor" className="rounded-full gap-2"><Stethoscope className="h-4 w-4" /> <span className="hidden sm:inline">Doctor</span></TabsTrigger>
            <TabsTrigger value="community" className="rounded-full gap-2"><MessageSquare className="h-4 w-4" /> <span className="hidden sm:inline">{t.community}</span></TabsTrigger>
            <TabsTrigger value="history" className="rounded-full gap-2"><HistoryIcon className="h-4 w-4" /> <span className="hidden sm:inline">{t.history}</span></TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-10">
            <header className="space-y-2">
              <h2 className="text-3xl font-bold">Hello, {user?.displayName?.split(' ')[0] || 'User'}</h2>
              <p className="text-muted-foreground">{t.tagline}</p>
            </header>

            {!todayEntry && !isMoodsLoading && <ReminderBanner onDismiss={() => {}} />}

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{t.howFeeling}</h3>
                {isCheckingIn && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>
              
              <MoodSelector 
                onSelect={handleMoodSelect} 
                selectedMood={todayEntry?.mood} 
                disabled={isCheckingIn || !db} 
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
                    supportiveMessage: todayEntry.message || "", 
                    suggestions: todayEntry.suggestions || [] 
                  }} 
                />
              )}
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-6">{t.insights}</h3>
              {isMoodsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-32 rounded-2xl" />
                  <Skeleton className="h-32 rounded-2xl" />
                </div>
              ) : (
                <MoodInsights entries={entries || []} />
              )}
            </section>
          </TabsContent>

          <TabsContent value="doctor" className="space-y-6">
            <header>
              <h2 className="text-2xl font-bold">Your Doctor</h2>
              <p className="text-muted-foreground">Manage your clinical support.</p>
            </header>

            {myDoctor ? (
              <div className="space-y-6">
                <Card className="border-none shadow-md bg-white">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary/10 p-4 rounded-full"><Stethoscope className="h-8 w-8 text-primary" /></div>
                    <div>
                      <CardTitle>{myDoctor.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{myDoctor.specialization}</p>
                    </div>
                  </CardHeader>
                  <CardContent><p>{myDoctor.bio}</p></CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Messages from your doctor</h3>
                  {doctorNotes?.map(note => (
                    <Card key={note.id} className="border-none shadow-sm bg-accent/20">
                      <CardContent className="p-4">
                        <p className="text-sm italic">"{note.content}"</p>
                        <p className="text-[10px] text-muted-foreground mt-2">{new Date(note.createdAt).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {doctorNotes?.length === 0 && <p className="text-center text-muted-foreground py-10">No messages yet.</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search for a doctor..." className="pl-10" value={searchDoctor} onChange={(e) => setSearchDoctor(e.target.value)} />
                </div>
                <div className="grid gap-4">
                  {allDoctors?.filter(d => d.name.toLowerCase().includes(searchDoctor.toLowerCase())).map(docItem => {
                    const status = assignments?.find(a => a.doctorId === docItem.userId)?.status;
                    return (
                      <Card key={docItem.id} className="border-none shadow-sm bg-white">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{docItem.name}</p>
                            <p className="text-xs text-muted-foreground">{docItem.specialization}</p>
                          </div>
                          <Button 
                            onClick={() => handleRequestDoctor(docItem.userId)} 
                            disabled={!!status}
                            variant={status === 'pending' ? 'secondary' : 'default'}
                          >
                            {status === 'pending' ? 'Pending' : status === 'rejected' ? 'Rejected' : 'Request Consultation'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {allDoctors?.length === 0 && <p className="text-center py-12 text-muted-foreground">No doctors available yet.</p>}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CreatePost />
            <SocialFeed />
          </TabsContent>

          <TabsContent value="history">
            <MoodHistory entries={entries || []} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Support Chat Component */}
      <SupportChat />
    </main>
  );
}

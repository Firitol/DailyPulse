"use client"

import React, { useState } from 'react';
import { useUser, useFirestore, useCollection, useAuth, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, where } from 'firebase/firestore';
import { UserProfile, Assignment, MoodEntry, DoctorNote } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/context';
import { LogOut, Users, FileText, Check, X, History as HistoryIcon, MessageSquare, BadgeCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MoodInsights } from '@/components/mood-insights';
import { MoodHistory } from '@/components/mood-history';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function DoctorDashboard({ profile }: { profile: UserProfile }) {
  const { user } = useUser();
  const { t } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');

  const assignmentsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'assignments'), where('doctorId', '==', user.uid));
  }, [db, user]);
  const { data: assignments } = useCollection<Assignment>(assignmentsQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'users');
  }, [db]);
  const { data: allUsers } = useCollection<UserProfile>(usersQuery);

  const pendingRequests = assignments?.filter(a => a.status === 'pending') || [];
  const acceptedPatients = assignments?.filter(a => a.status === 'accepted') || [];

  const selectedPatient = allUsers?.find(u => u.id === selectedPatientId);

  const patientMoodsQuery = useMemoFirebase(() => {
    if (!selectedPatientId || !db) return null;
    return query(collection(db, 'users', selectedPatientId, 'moodEntries'), orderBy('createdAt', 'desc'));
  }, [db, selectedPatientId]);
  const { data: patientMoods } = useCollection<MoodEntry>(patientMoodsQuery);

  const notesQuery = useMemoFirebase(() => {
    if (!user || !selectedPatientId || !db) return null;
    // Optimized: Only fetch notes relevant to the selected doctor-patient pair
    return query(
      collection(db, 'doctorNotes'), 
      where('doctorId', '==', user.uid),
      where('patientId', '==', selectedPatientId)
    );
  }, [db, user, selectedPatientId]);
  const { data: doctorNotes } = useCollection<DoctorNote>(notesQuery);

  const handleAssignmentStatus = (id: string, status: 'accepted' | 'rejected') => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, 'assignments', id), { status });
    toast({ title: `Consultation ${status}` });
  };

  const handleAddNote = () => {
    if (!selectedPatientId || !user || !noteContent.trim() || !db) return;
    const noteId = crypto.randomUUID();
    setDocumentNonBlocking(doc(db, 'doctorNotes', noteId), {
      id: noteId,
      patientId: selectedPatientId,
      doctorId: user.uid,
      content: noteContent,
      createdAt: new Date().toISOString()
    }, { merge: true });
    setNoteContent('');
    toast({ title: "Clinical note saved" });
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => setSelectedPatientId(null)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <span className="bg-primary text-white p-1 rounded-lg font-bold">DP</span>
            <h1 className="text-xl font-bold text-primary">{t.appTitle}</h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Medical Professional
            </span>
          </button>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium hidden md:block">Dr. {profile?.name || 'User'}</p>
            <Button variant="ghost" size="icon" onClick={() => auth.signOut()} className="rounded-full">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="space-y-6 md:col-span-1">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">My Patients</CardTitle></CardHeader>
            <CardContent className="space-y-2 p-2">
              {acceptedPatients.map(a => {
                const p = allUsers?.find(u => u.id === a.patientId);
                return (
                  <button 
                    key={a.id} 
                    onClick={() => setSelectedPatientId(p?.id || null)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedPatientId === p?.id ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted'}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p?.avatarUrl} />
                      <AvatarFallback>{p?.name?.[0] || 'P'}</AvatarFallback>
                    </Avatar>
                    <div className="text-left overflow-hidden">
                      <p className="font-medium truncate text-sm">{p?.name || 'Patient'}</p>
                    </div>
                  </button>
                );
              })}
              {acceptedPatients.length === 0 && <p className="text-center text-muted-foreground py-10 text-xs italic">No patients yet.</p>}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Consultation Requests</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-2">
              {pendingRequests.map(r => {
                const p = allUsers?.find(u => u.id === r.patientId);
                return (
                  <div key={r.id} className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                       <Avatar className="h-8 w-8">
                        <AvatarImage src={p?.avatarUrl} />
                        <AvatarFallback>{p?.name?.[0] || 'P'}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-xs truncate">{p?.name || 'Patient'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAssignmentStatus(r.id, 'accepted')} className="flex-1 h-8 text-[10px]"><Check className="h-3 w-3 mr-1" /> Accept</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAssignmentStatus(r.id, 'rejected')} className="flex-1 h-8 text-[10px]"><X className="h-3 w-3 mr-1" /> Decline</Button>
                    </div>
                  </div>
                );
              })}
              {pendingRequests.length === 0 && <p className="text-center text-muted-foreground py-6 text-xs italic">All clear.</p>}
            </CardContent>
          </Card>
        </aside>

        <section className="md:col-span-3 space-y-6">
          {selectedPatient ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-4 border-primary/10">
                    <AvatarImage src={selectedPatient.avatarUrl} />
                    <AvatarFallback className="text-2xl">{selectedPatient.name?.[0] || 'P'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPatient.name || 'Patient'}</h2>
                    <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                  </div>
                </div>
              </header>

              <Tabs defaultValue="insights">
                <TabsList className="bg-muted/50 rounded-full p-1 h-12 mb-6">
                  <TabsTrigger value="insights" className="rounded-full gap-2 px-6"><FileText className="h-4 w-4" /> Insights</TabsTrigger>
                  <TabsTrigger value="history" className="rounded-full gap-2 px-6"><HistoryIcon className="h-4 w-4" /> History</TabsTrigger>
                  <TabsTrigger value="notes" className="rounded-full gap-2 px-6"><MessageSquare className="h-4 w-4" /> Clinical Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="animate-in fade-in duration-300">
                  <MoodInsights entries={patientMoods || []} />
                </TabsContent>

                <TabsContent value="history" className="animate-in fade-in duration-300">
                  <MoodHistory entries={patientMoods || []} />
                </TabsContent>

                <TabsContent value="notes" className="space-y-6 animate-in fade-in duration-300">
                  <Card className="border-none shadow-md bg-white">
                    <CardHeader><CardTitle className="text-sm font-semibold">New Observation</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea 
                        placeholder="Add guidance, observations, or next steps for the patient..." 
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="bg-muted/30 border-none resize-none min-h-[120px] text-base rounded-2xl p-4"
                      />
                      <Button onClick={handleAddNote} disabled={!noteContent.trim()} className="rounded-full px-8">Save Note</Button>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Note History</h3>
                    <div className="grid gap-4">
                      {doctorNotes?.map(note => (
                        <Card key={note.id} className="border-none shadow-sm bg-white hover:shadow-md transition-all">
                          <CardContent className="p-5">
                            <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(note.createdAt).toLocaleString()}</p>
                              <BadgeCheck className="h-4 w-4 text-primary" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-muted-foreground bg-white rounded-[40px] shadow-sm border-2 border-dashed border-muted/50">
              <div className="bg-primary/5 p-8 rounded-full mb-6">
                <Users className="h-16 w-16 text-primary/40" />
              </div>
              <h3 className="text-xl font-bold text-foreground/70">Patient Record Access</h3>
              <p className="max-w-xs text-center mt-2">Select a patient from the sidebar to review their mood history and record clinical observations.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

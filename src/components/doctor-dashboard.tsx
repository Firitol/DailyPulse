
"use client"

import React, { useState } from 'react';
import { useUser, useFirestore, useCollection, useAuth, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, where } from 'firebase/firestore';
import { UserProfile, Assignment, MoodEntry, DoctorNote } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/context';
import { LogOut, Users, FileText, Check, X, History as HistoryIcon, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MoodInsights } from '@/components/mood-insights';
import { MoodHistory } from '@/components/mood-history';
import { useToast } from '@/hooks/use-toast';

export function DoctorDashboard({ profile }: { profile: UserProfile }) {
  const { user } = useUser();
  const { t } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Simplified queries to avoid composite index requirements in MVP
  const assignmentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'assignments');
  }, [db, user]);
  const { data: rawAssignments } = useCollection<Assignment>(assignmentsQuery);

  const patientsQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const { data: allUsers } = useCollection<UserProfile>(patientsQuery);

  const notesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'doctorNotes'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: rawDoctorNotes } = useCollection<DoctorNote>(notesQuery);

  // In-memory filtering to bypass potential index issues
  const myAssignments = rawAssignments?.filter(a => a.doctorId === user?.uid);
  const requests = myAssignments?.filter(a => a.status === 'pending');
  const patients = myAssignments?.filter(a => a.status === 'accepted');

  const selectedPatient = allUsers?.find(u => u.id === selectedPatientId);
  const patientMoodsQuery = useMemoFirebase(() => {
    if (!selectedPatientId) return null;
    return query(collection(db, 'users', selectedPatientId, 'moodEntries'), orderBy('createdAt', 'desc'));
  }, [db, selectedPatientId]);
  const { data: patientMoods } = useCollection<MoodEntry>(patientMoodsQuery);

  const doctorNotes = rawDoctorNotes?.filter(n => n.doctorId === user?.uid);

  const handleAssignmentStatus = (id: string, status: 'accepted' | 'rejected') => {
    updateDocumentNonBlocking(doc(db, 'assignments', id), { status });
    toast({ title: `Request ${status}` });
  };

  const handleAddNote = () => {
    if (!selectedPatientId || !user || !noteContent.trim()) return;
    const noteId = crypto.randomUUID();
    setDocumentNonBlocking(doc(db, 'doctorNotes', noteId), {
      id: noteId,
      patientId: selectedPatientId,
      doctorId: user.uid,
      content: noteContent,
      createdAt: new Date().toISOString()
    }, { merge: true });
    setNoteContent('');
    toast({ title: "Note saved successfully" });
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="bg-primary text-white p-1 rounded-lg">DP</span> {t.appTitle} <span className="text-xs font-normal opacity-50">Doctor Portal</span>
          </h1>
          <Button variant="ghost" size="icon" onClick={() => auth.signOut()} className="rounded-full">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-6">
          <Card className="border-none shadow-md bg-white">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Assigned Patients</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {patients?.map(a => {
                const p = allUsers?.find(u => u.id === a.patientId);
                return (
                  <button 
                    key={a.id} 
                    onClick={() => setSelectedPatientId(p?.id || null)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${selectedPatientId === p?.id ? 'bg-primary text-white' : 'hover:bg-muted/50'}`}
                  >
                    <p className="font-medium">{p?.name}</p>
                    <p className={`text-xs ${selectedPatientId === p?.id ? 'text-white/70' : 'text-muted-foreground'}`}>{p?.email}</p>
                  </button>
                );
              })}
              {patients?.length === 0 && <p className="text-center text-muted-foreground py-4">No active patients.</p>}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardHeader><CardTitle className="text-lg">Pending Requests</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {requests?.map(r => {
                const p = allUsers?.find(u => u.id === r.patientId);
                return (
                  <div key={r.id} className="p-3 bg-muted/30 rounded-xl space-y-3">
                    <p className="font-medium text-sm">{p?.name}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAssignmentStatus(r.id, 'accepted')} className="flex-1"><Check className="h-3 w-3 mr-1" /> Accept</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAssignmentStatus(r.id, 'rejected')} className="flex-1"><X className="h-3 w-3 mr-1" /> Decline</Button>
                    </div>
                  </div>
                );
              })}
              {requests?.length === 0 && <p className="text-center text-muted-foreground py-4">No new requests.</p>}
            </CardContent>
          </Card>
        </aside>

        <section className="md:col-span-2 space-y-6">
          {selectedPatient ? (
            <div className="space-y-6">
              <header className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedPatient.name}'s Profile</h2>
              </header>

              <Tabs defaultValue="insights">
                <TabsList className="bg-muted/50 rounded-full p-1 h-12 mb-6">
                  <TabsTrigger value="insights" className="rounded-full gap-2"><FileText className="h-4 w-4" /> Insights</TabsTrigger>
                  <TabsTrigger value="history" className="rounded-full gap-2"><HistoryIcon className="h-4 w-4" /> History</TabsTrigger>
                  <TabsTrigger value="notes" className="rounded-full gap-2"><MessageSquare className="h-4 w-4" /> Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="insights">
                  <MoodInsights entries={patientMoods || []} />
                </TabsContent>

                <TabsContent value="history">
                  <MoodHistory entries={patientMoods || []} />
                </TabsContent>

                <TabsContent value="notes" className="space-y-6">
                  <Card className="border-none shadow-md bg-white">
                    <CardHeader><CardTitle className="text-sm">Write clinical note</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea 
                        placeholder="Add professional guidance or observations..." 
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="bg-muted/30 border-none resize-none min-h-[100px]"
                      />
                      <Button onClick={handleAddNote} disabled={!noteContent.trim()}>Save Note</Button>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Previous Notes</h3>
                    {doctorNotes?.filter(n => n.patientId === selectedPatientId).map(note => (
                      <Card key={note.id} className="border-none shadow-sm bg-white">
                        <CardContent className="p-4">
                          <p className="text-sm">{note.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-2">{new Date(note.createdAt).toLocaleString()}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-muted-foreground bg-white rounded-3xl shadow-sm border-2 border-dashed">
              <Users className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a patient to view their wellness data.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

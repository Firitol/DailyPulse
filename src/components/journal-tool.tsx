"use client"

import React, { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/context';
import { BookOpen, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function JournalTool() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!content.trim() || !user || !db) return;
    setLoading(true);
    try {
      const entryId = crypto.randomUUID();
      await setDoc(doc(db, 'users', user.uid, 'journalEntries', entryId), {
        id: entryId,
        content: content,
        createdAt: new Date().toISOString(),
      });
      setContent('');
      toast({ title: "Journal entry saved", description: "Taking notes helps clarify thoughts." });
    } catch (e) {
      toast({ variant: "destructive", title: t.toastError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-md bg-white">
      <CardHeader className="bg-secondary/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-secondary" />
          {t.journal}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <Textarea 
          placeholder={t.journalPlaceholder} 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] border-none focus-visible:ring-0 resize-none text-base bg-muted/20 rounded-xl"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={loading || !content.trim()}
            className="rounded-full px-6"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {t.saveJournal}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
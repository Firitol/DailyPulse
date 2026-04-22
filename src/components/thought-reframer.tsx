"use client"

import React, { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/context';
import { RefreshCw, Save, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ThoughtReframer() {
  const [situation, setSituation] = useState('');
  const [negativeThought, setNegativeThought] = useState('');
  const [alternativeThought, setAlternativeThought] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!situation.trim() || !user || !db) return;
    setLoading(true);
    try {
      const entryId = crypto.randomUUID();
      await setDoc(doc(db, 'users', user.uid, 'reframingLogs', entryId), {
        id: entryId,
        situation,
        negativeThought,
        alternativeThought,
        createdAt: new Date().toISOString(),
      });
      setSituation('');
      setNegativeThought('');
      setAlternativeThought('');
      toast({ title: "Reframing saved", description: "You're building healthier thought patterns!" });
    } catch (e) {
      toast({ variant: "destructive", title: t.toastError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-md bg-white">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          {t.reframer}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.reframerSituation}</label>
          <Input 
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="e.g., I made a mistake at work"
            className="rounded-xl bg-muted/30 border-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-red-500">{t.reframerThought}</label>
            <Input 
              value={negativeThought}
              onChange={(e) => setNegativeThought(e.target.value)}
              placeholder="e.g., I'm incompetent"
              className="rounded-xl bg-red-50/50 border-red-100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-green-500">{t.reframerAlternative}</label>
            <Input 
              value={alternativeThought}
              onChange={(e) => setAlternativeThought(e.target.value)}
              placeholder="e.g., I am learning and will improve"
              className="rounded-xl bg-green-50/50 border-green-100"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleSave} 
            disabled={loading || !situation.trim()}
            className="rounded-full px-8"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {t.saveReframing}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
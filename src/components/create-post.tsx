"use client"

import React, { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/context';
import { Send, Loader2 } from 'lucide-react';

export function CreatePost() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useLanguage();

  const handlePost = async () => {
    if (!content.trim() || !user) return;
    setLoading(true);
    try {
      const postRef = doc(collection(db, 'posts'));
      await setDoc(postRef, {
        id: postRef.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        content: content,
        createdAt: new Date().toISOString(),
        likeCount: 0
      });
      setContent('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-md border-none rounded-2xl overflow-hidden mb-8">
      <CardContent className="p-4 space-y-4">
        <Textarea 
          placeholder={t.shareThought} 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] border-none focus-visible:ring-0 resize-none text-base bg-muted/30 rounded-xl"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handlePost} 
            disabled={loading || !content.trim()}
            className="rounded-full px-6"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {t.post}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

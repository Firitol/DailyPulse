"use client"

import React from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/lib/i18n/context';
import { Post, Like } from '@/lib/types';
import { useMemoFirebase } from '@/firebase';

export function SocialFeed() {
  const db = useFirestore();
  const { user } = useUser();
  const { t } = useLanguage();

  const postsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
  }, [db]);

  const { data: posts, isLoading } = useCollection<Post>(postsQuery);

  if (isLoading) return <div className="space-y-4">
    {[1,2,3].map(i => <Card key={i} className="animate-pulse h-48" />)}
  </div>;

  if (!posts || posts.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
          <p>{t.noPosts}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} userId={user?.uid} />
      ))}
    </div>
  );
}

function PostCard({ post, userId }: { post: Post; userId?: string }) {
  const db = useFirestore();
  const likeRef = useMemoFirebase(() => {
    if (!userId || !db) return null;
    return doc(db, 'posts', post.id, 'likes', userId);
  }, [db, post.id, userId]);

  const likesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'posts', post.id, 'likes'));
  }, [db, post.id]);

  const { data: likeData } = useCollection<Like>(likesQuery);

  const hasLiked = likeData?.some(l => l.userId === userId);

  const handleLike = async () => {
    if (!userId || !likeRef) return;
    if (hasLiked) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, {
        id: userId,
        userId: userId,
        postId: post.id,
        createdAt: new Date().toISOString()
      });
    }
  };

  return (
    <Card className="bg-white border-none shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar>
          <AvatarImage src={post.userAvatarUrl} />
          <AvatarFallback>{post.userName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{post.userName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt))} ago
          </p>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm leading-relaxed">{post.content}</p>
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className={hasLiked ? "text-red-500 hover:text-red-600" : ""}
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 mr-2 ${hasLiked ? "fill-current" : ""}`} />
          {likeData?.length || 0}
        </Button>
        <Button variant="ghost" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          0
        </Button>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
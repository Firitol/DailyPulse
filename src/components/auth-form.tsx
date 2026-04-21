"use client"

import React, { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name,
          email,
          avatarUrl: `https://picsum.photos/seed/${user.uid}/200/200`,
          createdAt: serverTimestamp(),
          onboardingCompleted: false,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t.toastError,
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: t.toastError,
        description: t.enterEmail,
      });
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: t.toastPasswordResetSent,
        description: t.toastPasswordResetSentDesc,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t.toastError,
        description: error.message,
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isLogin ? t.login : t.register}</CardTitle>
        <CardDescription>
          {isLogin ? t.welcome : t.onboardingTitle1}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.name}</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe" 
                required 
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.email}</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com" 
              required 
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t.password}</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-primary hover:underline"
                  disabled={resetLoading}
                >
                  {resetLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : t.forgotPassword}
                </button>
              )}
            </div>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? t.login : t.register}
          </Button>
          <Button 
            variant="ghost" 
            type="button" 
            className="text-xs" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? t.noAccount : t.haveAccount}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

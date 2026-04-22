
"use client"

import React, { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User as UserIcon, Stethoscope, Mail, LogIn, SeparatorHorizontal } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleResetPassword = async () => {
    if (!email) {
      toast({ variant: "destructive", title: t.enterEmail });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: t.toastPasswordResetSent, description: t.toastPasswordResetSentDesc });
    } catch (error: any) {
      toast({ variant: "destructive", title: t.toastError, description: error.message });
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user profile already exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create user profile for first-time social login
        const userData = {
          id: user.uid,
          name: user.displayName || 'Anonymous User',
          email: user.email,
          avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
          role: role, // Use currently selected role in the UI
          createdAt: serverTimestamp(),
          onboardingCompleted: false,
        };

        await setDoc(userDocRef, userData);

        if (role === 'doctor') {
          await setDoc(doc(db, 'doctorProfiles', user.uid), {
            userId: user.uid,
            name: user.displayName || 'Anonymous Doctor',
            specialization: 'General Practice',
            bio: 'Passionate about mental wellness.',
            isVerified: false
          });
        }
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
        
        const userData = {
          id: user.uid,
          name,
          email,
          avatarUrl: `https://picsum.photos/seed/${user.uid}/200/200`,
          role,
          createdAt: serverTimestamp(),
          onboardingCompleted: false,
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        if (role === 'doctor') {
          await setDoc(doc(db, 'doctorProfiles', user.uid), {
            userId: user.uid,
            name,
            specialization: 'General Practice',
            bio: 'Passionate about mental wellness.',
            isVerified: false
          });
        }
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

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{isLogin ? t.login : t.register}</CardTitle>
        <CardDescription>
          {isLogin ? t.welcome : t.onboardingTitle1}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3 pt-2">
          <label className="text-sm font-medium">I am a...</label>
          <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)} className="flex gap-4">
            <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-xl flex-1 cursor-pointer transition-colors hover:bg-muted">
              <RadioGroupItem value="patient" id="patient" />
              <Label htmlFor="patient" className="flex items-center gap-2 cursor-pointer w-full">
                <UserIcon className="h-4 w-4" /> Patient
              </Label>
            </div>
            <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-xl flex-1 cursor-pointer transition-colors hover:bg-muted">
              <RadioGroupItem value="doctor" id="doctor" />
              <Label htmlFor="doctor" className="flex items-center gap-2 cursor-pointer w-full">
                <Stethoscope className="h-4 w-4" /> Doctor
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button 
          variant="outline" 
          type="button" 
          className="w-full rounded-full h-12 gap-3" 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Continue with Google
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  onClick={handleResetPassword}
                  className="text-xs text-primary hover:underline"
                >
                  {t.forgotPassword}
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
          <Button type="submit" className="w-full rounded-full h-12 text-base font-semibold" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? t.login : t.register}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          type="button" 
          className="text-xs hover:bg-transparent text-muted-foreground" 
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? t.noAccount : t.haveAccount}
        </Button>
      </CardFooter>
    </Card>
  );
}

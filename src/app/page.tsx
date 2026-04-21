
"use client"

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import { AuthForm } from '@/components/auth-form';
import { Toaster } from '@/components/ui/toaster';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/lib/i18n/context';
import { useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientDashboard } from '@/components/patient-dashboard';
import { DoctorDashboard } from '@/components/doctor-dashboard';

export default function DailyPulse() {
  const { user, isUserLoading } = useUser();
  const { t } = useLanguage();
  const db = useFirestore();

  // Fetch user profile to determine role
  const userDocRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  if (isUserLoading || (user && isProfileLoading)) {
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
    <>
      {profile?.role === 'doctor' ? (
        <DoctorDashboard profile={profile} />
      ) : (
        <PatientDashboard profile={profile as UserProfile} />
      )}
      <Toaster />
    </>
  );
}

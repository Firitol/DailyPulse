"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/context';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface OnboardingTourProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingTour({ userId, isOpen, onClose }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const { t } = useLanguage();
  const db = useFirestore();

  const steps = [
    { title: t.onboardingTitle1, desc: t.onboardingDesc1 },
    { title: t.onboardingTitle2, desc: t.onboardingDesc2 },
    { title: t.onboardingTitle3, desc: t.onboardingDesc3 },
    { title: t.onboardingTitle4, desc: t.onboardingDesc4 },
  ];

  const handleFinish = async () => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        onboardingCompleted: true
      });
      onClose();
    } catch (e) {
      console.error(e);
      onClose();
    }
  };

  const currentStep = steps[step];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleFinish()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-1 bg-primary rounded-full" />
          </div>
          <DialogTitle className="text-center text-2xl">{currentStep.title}</DialogTitle>
        </DialogHeader>
        <div className="py-6 text-center text-muted-foreground">
          {currentStep.desc}
        </div>
        <DialogFooter className="flex flex-row justify-between sm:justify-between items-center gap-2">
          <Button variant="ghost" onClick={handleFinish}>{t.skip}</Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>{t.back}</Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>{t.next}</Button>
            ) : (
              <Button onClick={handleFinish}>{t.finish}</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

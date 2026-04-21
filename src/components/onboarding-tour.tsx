"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
    { title: t.onboardingTitle5, desc: t.onboardingDesc5 },
    { title: t.onboardingTitle6, desc: t.onboardingDesc6 },
  ];

  const handleFinish = async () => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        onboardingCompleted: true
      });
      onClose();
    } catch (e) {
      onClose();
    }
  };

  const currentStep = steps[step];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleFinish()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-1.5 bg-primary/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            {currentStep.title}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground mt-2">
            Step {step + 1} of {steps.length}: {currentStep.title}
          </DialogDescription>
        </DialogHeader>
        <div className="py-8 px-2">
          <div className="text-center text-muted-foreground whitespace-pre-line leading-relaxed">
            {currentStep.desc}
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between sm:justify-between items-center gap-2 pt-4">
          <Button variant="ghost" onClick={handleFinish} className="text-muted-foreground">
            {t.skip}
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                {t.back}
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="min-w-[80px]">
                {t.next}
              </Button>
            ) : (
              <Button onClick={handleFinish} className="min-w-[100px] shadow-lg shadow-primary/20">
                {t.finish}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
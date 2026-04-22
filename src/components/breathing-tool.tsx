"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/context';
import { Wind, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BreathingTool() {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState(4);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (phase === 'inhale') {
              setPhase('hold');
              return 4;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return 4;
            } else {
              setPhase('inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase]);

  const toggleBreathing = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setPhase('inhale');
      setTimer(4);
    }
  };

  return (
    <Card className="border-none shadow-md bg-white overflow-hidden">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          {t.breathing}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 flex flex-col items-center justify-center space-y-8">
        <div className="relative flex items-center justify-center">
          <div 
            className={cn(
              "w-48 h-48 rounded-full bg-primary/10 transition-all duration-[4000ms] flex items-center justify-center",
              isActive && phase === 'inhale' && "scale-125 bg-primary/20",
              isActive && phase === 'exhale' && "scale-75 bg-primary/5",
              isActive && phase === 'hold' && "scale-125 bg-primary/30"
            )}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-primary capitalize">
                {isActive ? t[phase] : t.inhale}
              </p>
              <p className="text-4xl font-mono mt-1">{timer}s</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={toggleBreathing} 
          size="lg" 
          className="rounded-full px-8 gap-2"
          variant={isActive ? "secondary" : "default"}
        >
          {isActive ? <><Square className="h-4 w-4" /> {t.stopBreathing}</> : <><Play className="h-4 w-4" /> {t.startBreathing}</>}
        </Button>
      </CardContent>
    </Card>
  );
}
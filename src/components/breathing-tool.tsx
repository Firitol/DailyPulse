
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/context';
import { Wind, Play, Square, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateBreathingAudio } from '@/ai/flows/generate-breathing-audio-flow';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type Phase = 'inhale' | 'hold' | 'exhale';

export function BreathingTool() {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [timer, setTimer] = useState(4);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  // Cache for audio data URIs
  const audioCache = useRef<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            const nextPhase: Phase = phase === 'inhale' ? 'hold' : phase === 'hold' ? 'exhale' : 'inhale';
            setPhase(nextPhase);
            if (isVoiceEnabled) playPhaseAudio(nextPhase);
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase, isVoiceEnabled]);

  const toggleBreathing = async () => {
    if (!isActive) {
      // Starting
      if (isVoiceEnabled) {
        await playPhaseAudio('inhale');
      }
      setIsActive(true);
      setPhase('inhale');
      setTimer(4);
    } else {
      // Stopping
      setIsActive(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const playPhaseAudio = async (currentPhase: Phase) => {
    const textToSpeak = t[currentPhase];
    
    // Check cache first
    if (audioCache.current[currentPhase]) {
      playAudio(audioCache.current[currentPhase]);
      return;
    }

    setIsAudioLoading(true);
    try {
      const { audioUri } = await generateBreathingAudio({ text: textToSpeak });
      audioCache.current[currentPhase] = audioUri;
      playAudio(audioUri);
    } catch (error) {
      console.error("Failed to generate voice guide:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const playAudio = (uri: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    audioRef.current.src = uri;
    audioRef.current.play().catch(e => console.warn("Audio play blocked:", e));
  };

  return (
    <Card className="border-none shadow-md bg-white overflow-hidden">
      <CardHeader className="bg-primary/5 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          {t.breathing}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Label htmlFor="voice-guide" className="text-xs font-medium cursor-pointer flex items-center gap-1">
            {isVoiceEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            {t.enableVoice}
          </Label>
          <Switch 
            id="voice-guide" 
            checked={isVoiceEnabled} 
            onCheckedChange={setIsVoiceEnabled} 
            disabled={isActive}
          />
        </div>
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
          {isAudioLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs font-medium">{t.loadingVoice}</span>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={toggleBreathing} 
          size="lg" 
          className="rounded-full px-8 gap-2"
          variant={isActive ? "secondary" : "default"}
          disabled={isAudioLoading}
        >
          {isActive ? <><Square className="h-4 w-4" /> {t.stopBreathing}</> : <><Play className="h-4 w-4" /> {t.startBreathing}</>}
        </Button>
      </CardContent>
    </Card>
  );
}

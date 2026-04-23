"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Share, PlusSquare } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export function PwaInstallPrompt() {
  const { t } = useLanguage();
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Listen for the beforeinstallprompt event (Android/Chrome/Edge)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has dismissed it recently
      const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 1000 * 60 * 60 * 24 * 7) {
        setShowPrompt(true);
      }
    });

    // For iOS, show the prompt manually after a short delay
    if (ios) {
      const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 1000 * 60 * 60 * 24 * 7) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-6 md:w-96 animate-in slide-in-from-bottom-8">
      <Card className="bg-primary text-white border-none shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-5 relative">
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex gap-4 items-start">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Download className="h-6 w-6" />
            </div>
            <div className="space-y-1 pr-4">
              <h4 className="font-bold text-lg">Install ReliefZone</h4>
              <p className="text-xs text-white/80 leading-relaxed">
                Add ReliefZone to your home screen for a faster, full-screen wellness experience.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            {isIOS ? (
              <div className="flex items-center gap-2 text-xs font-medium bg-white/10 p-3 rounded-xl">
                <span>Tap</span>
                <Share className="h-4 w-4" />
                <span>then</span>
                <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded">
                  <PlusSquare className="h-3 w-3" /> Add to Home Screen
                </span>
              </div>
            ) : (
              <Button 
                onClick={handleInstallClick}
                className="w-full bg-white text-primary hover:bg-white/90 rounded-full font-bold h-11"
              >
                Install Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
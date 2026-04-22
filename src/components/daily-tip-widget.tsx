
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Quote } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { getDailyTip } from '@/lib/wellness-tips';

export function DailyTipWidget() {
  const { language, t } = useLanguage();
  const [tip, setTip] = useState('');

  useEffect(() => {
    // Ensuring consistent tip between SSR and Hydration
    setTip(getDailyTip(language as any));
  }, [language]);

  if (!tip) return null;

  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-2 rounded-xl shadow-sm text-primary group-hover:scale-110 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">DailyPulse Insight</h4>
            <div className="relative">
              <Quote className="absolute -left-2 -top-1 h-3 w-3 opacity-20 text-primary" />
              <p className="text-lg font-medium italic leading-relaxed pl-2">
                {tip}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client"

import React from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ReminderBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="bg-primary text-white p-4 rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">Time for your daily pulse!</p>
          <p className="text-xs text-white/80">Checking in helps you track your wellness patterns.</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white" onClick={onDismiss}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
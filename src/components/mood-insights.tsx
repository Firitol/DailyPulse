"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoodEntry, MOODS } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/context';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface MoodInsightsProps {
  entries: MoodEntry[];
}

export function MoodInsights({ entries }: MoodInsightsProps) {
  const { t } = useLanguage();

  if (entries.length === 0) return null;

  // Aggregate counts
  const counts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(counts).map(([mood, count]) => ({
    name: mood,
    count: count,
    color: MOODS.find(m => m.label === mood)?.color.split(' ')[0].replace('bg-', '#') || '#6366f1'
  })).sort((a, b) => b.count - a.count);

  const dominantMood = data[0]?.name;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t.mostFrequentMood}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{MOODS.find(m => m.label === dominantMood)?.emoji}</span>
              <p className="text-2xl font-bold text-primary">{dominantMood}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/5 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t.weeklySummary}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You've recorded {entries.length} moods recently. {dominantMood ? `You've been feeling ${dominantMood.toLowerCase()} the most.` : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t.moodTrend}</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide />
              <ChartTooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={MOODS.find(m => m.label === entry.name)?.color.includes('yellow') ? '#fbbf24' : '#4f46e5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

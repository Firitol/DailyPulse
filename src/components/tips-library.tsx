
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { WELLNESS_TIPS } from '@/lib/wellness-tips';
import { useLanguage } from '@/lib/i18n/context';
import { Search, Brain, Target, Heart, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TipsLibrary() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredTips = WELLNESS_TIPS.filter(tip => 
    tip.content[language as 'en' | 'om' | 'am'].toLowerCase().includes(search.toLowerCase())
  );

  const categories = [
    { id: 'all', label: 'All', icon: Brain },
    { id: 'stress', label: 'Stress', icon: Heart },
    { id: 'motivation', label: 'Motivation', icon: Zap },
    { id: 'focus', label: 'Focus', icon: Target },
    { id: 'balance', label: 'Balance', icon: Brain },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.wellnessTips}</h2>
          <p className="text-muted-foreground">Bite-sized wisdom for your mental journey.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tips..." 
            className="pl-10 rounded-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex flex-wrap h-auto bg-transparent gap-2 p-0 mb-8">
          {categories.map(cat => (
            <TabsTrigger 
              key={cat.id} 
              value={cat.id}
              className="rounded-full border data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-10 px-6 gap-2"
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTips
                .filter(tip => cat.id === 'all' || tip.category === cat.id)
                .map(tip => (
                  <Card key={tip.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest px-3">
                          {tip.category}
                        </Badge>
                      </div>
                      <p className="text-base font-medium leading-relaxed group-hover:text-primary transition-colors">
                        "{tip.content[language as 'en' | 'om' | 'am']}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
            {filteredTips.filter(tip => cat.id === 'all' || tip.category === cat.id).length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
                <p className="text-muted-foreground">No tips found in this category.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

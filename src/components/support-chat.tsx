'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { supportChat } from '@/ai/flows/support-chat-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageSquare, Send, Loader2, X, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/firebase';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export function SupportChat() {
  const { t, language } = useLanguage();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const languageMap = { en: 'English', om: 'Afan Oromo', am: 'Amharic' };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'model', content: t.chatWelcome }]);
    }
  }, [t.chatWelcome]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const result = await supportChat({
        message: userMessage,
        history: messages,
        userName: user?.displayName || undefined,
        language: (languageMap[language] || 'English') as any,
      });

      setMessages([...newMessages, { role: 'model', content: result.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { role: 'model', content: 'I apologize, but I am having trouble connecting right now. Please try again in a moment.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl hover:scale-105 transition-transform bg-primary text-white border-4 border-white/20">
            <MessageSquare className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[350px] p-0 border-none shadow-2xl rounded-3xl overflow-hidden mb-4">
          <Card className="border-none shadow-none">
            <CardHeader className="bg-primary text-white p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {t.supportChat}
                </CardTitle>
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                          m.role === 'user'
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-muted text-foreground rounded-bl-none'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-2xl rounded-bl-none">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t bg-muted/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex w-full gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  className="bg-white border-none focus-visible:ring-1 focus-visible:ring-primary h-10 rounded-full"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading || !input.trim()}
                  className="rounded-full h-10 w-10 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}

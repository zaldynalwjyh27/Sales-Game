'use client';

import { useState, useEffect, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher-client';
import { sendMessage } from '@/server/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MessageCircle, Send, ShieldAlert, Bot } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string | null;
  isAi: boolean;
  sender?: { name: string; role: string | null } | null;
}

interface ChatInterfaceProps {
  roomId: string;
  playerId: string;
  initialMessages: Message[];
  role: string | null;
}

export function ChatInterface({
  roomId,
  playerId,
  initialMessages,
  role,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe(`room-${roomId}`);

    channel.bind('new-message', (newMessage: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    channel.bind('next-round', () => {
      setMessages([]);
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe(`room-${roomId}`);
    };
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    const content = input;
    setInput('');

    try {
      await sendMessage(roomId, playerId, content);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const isEvaluator = role === 'EVALUATOR';

  return (
    <Card className="flex flex-col h-[600px] shadow-lg border overflow-hidden" dir="rtl">
      {/* Header */}
      <CardHeader className="py-3 px-5 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            المحادثة المباشرة
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">نشط</span>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-4 overflow-y-auto bg-background/50" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-30 mt-20">
              <MessageCircle className="h-12 w-12 mb-2" />
              <p className="text-sm">لا توجد رسائل بعد. ابدأ المحادثة!</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === playerId;
            const senderName = msg.isAi
              ? 'العميل'
              : msg.sender?.name || 'مجهول';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {msg.isAi && <Badge variant="secondary" className="h-4 text-[9px] px-1.5 gap-1"><Bot className="h-2 w-2"/> ذكاء اصطناعي</Badge>}
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {senderName}
                  </span>
                </div>
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted text-foreground rounded-tl-none border'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Input */}
      <CardFooter className="p-3 border-t bg-muted/20">
        {isEvaluator ? (
          <div className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground bg-background/50 border rounded-lg border-dashed">
            <ShieldAlert className="h-3.5 w-3.5" />
            أنت في وضع المراقبة ولا يمكنك الإرسال.
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 bg-background"
              disabled={isSending}
            />
            <Button type="submit" disabled={isSending || !input.trim()} size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
              <span className="sr-only">إرسال</span>
            </Button>
          </form>
        )}
      </CardFooter>
    </Card>
  );
}


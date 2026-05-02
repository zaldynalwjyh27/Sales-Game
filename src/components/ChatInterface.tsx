'use client';

import { useState, useEffect, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher-client';
import { sendMessage } from '@/server/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <div
      className="flex flex-col h-[500px] border rounded-xl bg-white dark:bg-slate-900 shadow-lg overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="px-5 py-3 border-b bg-gradient-to-l from-blue-600 to-indigo-700 text-white font-semibold text-lg flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        المحادثة المباشرة
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-10">
              لا توجد رسائل بعد. ابدأ المحادثة!
            </p>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === playerId;
            const senderName = msg.isAi
              ? 'العميل (ذكاء اصطناعي)'
              : msg.sender?.name || 'مجهول';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
              >
                <span className="text-xs text-slate-500 mb-1 px-1">
                  {senderName}
                </span>
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-[80%] leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-slate-50 dark:bg-slate-800">
        {isEvaluator ? (
          <p className="text-center text-sm text-slate-500">
            أنت في وضع المراقبة ولا يمكنك الإرسال.
          </p>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1"
              disabled={isSending}
            />
            <Button type="submit" disabled={isSending || !input.trim()}>
              إرسال
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

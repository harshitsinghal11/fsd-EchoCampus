'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send, Users } from 'lucide-react';
import { useSessionCode } from '@/hooks/useSessionCode';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

type Message = {
  id: string;
  random_code: string;
  message: string;
  created_at: string;
};

export default function AnonChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const sessionCode = useSessionCode();
  const endRef = useRef<HTMLDivElement | null>(null);

  const isOwnMessage = (code: string) => code === sessionCode;

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);

      if (error) {
        console.error('Error fetching messages:', error);
      } else if (data) {
        setMessages(data as Message[]);
      }
    };

    fetchMessages();

    // 2. Subscribe to realtime updates
    const channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Deduplicate in case optimistic update already added it
            if (prev.some(m => m.id === newMsg.id || (m.random_code === newMsg.random_code && m.message === newMsg.message && new Date(newMsg.created_at).getTime() - new Date(m.created_at).getTime() < 5000))) {
              return prev.map(m => m.message === newMsg.message && m.random_code === newMsg.random_code ? newMsg : m);
            }
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim() || !sessionCode) return;

    const newMessageText = text.trim();
    
    // Create an optimistic message object
    const optimisticMessage: Message = {
      id: crypto.randomUUID(), // temp id
      random_code: sessionCode,
      message: newMessageText,
      created_at: new Date().toISOString(),
    };

    const payload = {
      random_code: sessionCode,
      message: newMessageText,
    };

    setText('');
    
    // Optimistic update
    setMessages((prev) => [...prev, optimisticMessage]);

    const { data, error } = await supabase.from('chat_messages').insert([payload]).select().single();

    if (error) {
      console.error('Failed to send message:', error);
      toast.error(`Error sending message: ${error.message}`);
      // Revert optimistic update
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
    } else if (data) {
      // We don't need to do anything here if Realtime is working, 
      // but if Realtime is slow, the optimistic update handles the UI.
      // We could update the ID to the real one to avoid duplicates if Realtime fires,
      // but a simple approach is to let Realtime add the "real" one and we deduplicate.
    }
  }

  return (
    <div className="relative flex-1 h-full w-full min-h-0">
      <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
        
        {/* Messages Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-8">
          <div className="flex min-h-full flex-col gap-5">
            {messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-10">
                <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 px-8 py-10 text-center shadow-2xl shadow-black/20">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/80">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">No messages yet</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Start the room with a question, a study update, or a quick campus check-in.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isOwn = isOwnMessage(m.random_code);

                return (
                  <div
                    key={m.id}
                    className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex max-w-[min(86%,42rem)] flex-col">
                      <div
                        className={`mb-1.5 flex items-baseline gap-2 px-1 ${
                          isOwn ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span
                          className={`text-[11px] font-mono font-semibold uppercase tracking-[0.16em] sm:text-xs ${
                            isOwn ? 'text-blue-300' : 'text-slate-300'
                          }`}
                        >
                          {m.random_code}
                        </span>
                        <span className="text-[10px] text-slate-500 sm:text-xs">
                          {m.created_at
                            ? new Date(m.created_at).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })
                            : 'Sending...'}
                        </span>
                      </div>

                      <div
                        className={`rounded-3xl px-4 py-3 shadow-lg shadow-black/10 transition-colors sm:px-5 ${
                          isOwn
                            ? 'rounded-br-md border border-blue-500/30 bg-blue-500/20 text-white'
                            : 'rounded-bl-md border border-slate-700/80 bg-slate-900/75 text-slate-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7 sm:text-[15px]">
                          {m.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} className="h-px w-full shrink-0" />
          </div>
        </div>

        <form
          onSubmit={handleSend}
          className="shrink-0 border-t border-slate-800 bg-slate-950/90 px-3 py-3 backdrop-blur-xl sm:px-5 sm:py-4 lg:px-8"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <input
              aria-label="Anonymous chat message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write something respectful..."
              className="h-12 flex-1 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:h-14 sm:px-5 sm:text-base"
            />

            <button
              aria-label="Send message"
              type="submit"
              disabled={!text.trim()}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-blue-500/40 bg-blue-500/15 px-4 font-medium text-white transition-colors hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500 sm:h-14 sm:px-6"
            >
              <Send className="h-4 w-4 text-blue-300" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

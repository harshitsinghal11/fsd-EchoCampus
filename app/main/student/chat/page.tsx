'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';
import { SubmitBtn } from '@/components/shared/SubmitBtn';
import { useSessionCode } from '@/hooks/useSessionCode';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { broadcastChatMessageNotification } from '@/actions/chatActions';

type Message = {
  id: string;
  random_code: string;
  message: string;
  created_at: string;
  pending?: boolean;
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
        toast.error('Failed to load messages');
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
            // 1. If already exists by exact ID, ignore
            if (prev.some(m => m.id === newMsg.id)) return prev;
            
            // 2. Find a matching pending optimistic message
            const pendingIndex = prev.findIndex(m => m.pending && m.random_code === newMsg.random_code && m.message === newMsg.message);
            
            if (pendingIndex !== -1) {
              const newArr = [...prev];
              newArr[pendingIndex] = newMsg;
              return newArr;
            }
            
            // 3. Otherwise, just append
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
      pending: true,
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
      // Ensure the optimistic message is updated with the real DB data in case the realtime event missed it
      setMessages((prev) => prev.map((m) => m.id === optimisticMessage.id ? (data as Message) : m));
      
      // Fire chat push notification (cooldown is handled by the server action)
      await broadcastChatMessageNotification(newMessageText);
    }
  }

  return (
    <div className="relative flex-1 h-full w-full min-h-0">
      <div className="absolute inset-0 flex flex-col overflow-hidden bg-background text-text-primary">
        
        {/* Messages Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-8">
          <div className="flex min-h-full flex-col gap-5">
            {messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-10">
                <div className="mx-auto max-w-md rounded-3xl border border-border bg-surface px-8 py-10 text-center shadow-2xl shadow-black/20">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-hover/80">
                    <Users className="h-8 w-8 text-text-muted" />
                  </div>
                  <h2 className="text-xl font-semibold text-text-primary">No messages yet</h2>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    Start the room with a question, a study update, or a quick campus check-in.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m, index) => {
                const isOwn = isOwnMessage(m.random_code);
                
                // Determine if we need to show a date header
                const msgDateObj = m.created_at ? new Date(m.created_at) : new Date();
                const messageDate = msgDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                const prevMessageDate = index > 0 && messages[index - 1].created_at 
                  ? new Date(messages[index - 1].created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
                  : null;
                const showDateHeader = messageDate !== prevMessageDate;

                // Today/Yesterday logic
                const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                const yesterdayObj = new Date();
                yesterdayObj.setDate(yesterdayObj.getDate() - 1);
                const yesterday = yesterdayObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                
                let displayDate = messageDate;
                if (messageDate === today) displayDate = 'Today';
                else if (messageDate === yesterday) displayDate = 'Yesterday';

                return (
                  <React.Fragment key={m.id}>
                    {showDateHeader && (
                      <div className="flex justify-center my-4">
                        <span className="bg-surface-hover/80 text-text-muted text-[11px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full border border-border">
                          {displayDate}
                        </span>
                      </div>
                    )}
                    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className="flex max-w-[min(86%,42rem)] flex-col">
                        <div className={`mb-1 flex items-baseline px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.16em] ${isOwn ? 'text-primary' : 'text-text-muted'}`}>
                            {m.random_code}
                          </span>
                        </div>

                        <div className={`relative rounded-3xl px-3.5 py-2.5 pb-6 shadow-lg shadow-black/10 transition-colors sm:px-4 sm:pb-7 ${
                            isOwn
                              ? 'rounded-br-md border border-primary/30 bg-primary/10 text-text-primary'
                              : 'rounded-bl-md border border-border/80 bg-surface-hover/75 text-text-primary'
                          }`}
                        >
                          <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed sm:text-[15px]">
                            {m.message}
                          </p>
                          <div className={`absolute bottom-1.5 right-3 text-[9px] sm:text-[10px] font-medium tracking-wide ${isOwn ? 'text-primary/70' : 'text-text-muted/70'}`}>
                            {m.created_at
                              ? msgDateObj.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })
                              : 'Sending...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
            <div ref={endRef} className="h-px w-full shrink-0" />
          </div>
        </div>

        <form
          onSubmit={handleSend}
          className="shrink-0 border-t border-border bg-background/90 px-3 py-3 backdrop-blur-xl sm:px-5 sm:py-4 lg:px-8"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <input
              aria-label="Anonymous chat message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write something respectful..."
              className="h-12 flex-1 rounded-2xl border border-border bg-surface-hover px-4 text-sm text-text-primary placeholder:text-text-disabled focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:h-14 sm:px-5 sm:text-base"
            />

            <SubmitBtn
              disabled={!text.trim()}
              label="Send"
              fullWidth={false}
              className="h-12 sm:h-14 shrink-0"
              aria-label="Send message"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

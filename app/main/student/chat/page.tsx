'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft, Send, MessageSquareText, X } from 'lucide-react';
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
  const [onlineCount, setOnlineCount] = useState(1);
  const [activeParticipants, setActiveParticipants] = useState<string[]>([]);
  const [showMobileParticipants, setShowMobileParticipants] = useState(false);
  const sessionCode = useSessionCode();
  const endRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const isOwnMessage = (code: string) => code === sessionCode;

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        toast.error('Failed to load messages');
        console.error('Error fetching messages:', error);
      } else if (data) {
        setMessages((data as Message[]).reverse());
      }
    };

    fetchMessages();

    // 2. Subscribe to realtime updates and presence
    const channel = supabase.channel('public:chat_messages');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeUsers = Object.keys(state).length;
        setOnlineCount(activeUsers === 0 ? 1 : activeUsers);

        const participants = new Set<string>();
        for (const id in state) {
          const presences = state[id] as any[];
          for (const p of presences) {
            if (p.session_code) participants.add(p.session_code);
          }
        }
        setActiveParticipants(Array.from(participants));
      })
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
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            session_code: sessionCode
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
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

  const renderParticipantsList = () => (
    <>
      {/* Show self always */}
      {sessionCode && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">{sessionCode.substring(1, 3)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-text-primary block truncate">{sessionCode} (You)</span>
            <span className="text-[11px] font-medium text-primary mt-0.5 block">Online now</span>
          </div>
          <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
        </div>
      )}

      {/* Other participants */}
      {activeParticipants.filter(code => code !== sessionCode).map(code => (
        <div key={code} className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border shadow-sm hover:border-border/80 transition-colors">
          <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center shrink-0 border border-border/50">
            <span className="text-sm font-bold text-text-secondary">{code.substring(1, 3)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-text-primary block truncate">{code}</span>
            <span className="text-[11px] font-medium text-text-muted mt-0.5 block">Online now</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0 mr-1.5"></div>
        </div>
      ))}
    </>
  );

  return (
    <div className="relative flex-1 h-full w-full min-h-0">
      <div className="absolute inset-0 flex flex-row overflow-hidden bg-background">

        {/* Side Panel (Hidden on mobile, 25% width on large screens) - Moved to LEFT */}
        <div className="hidden lg:flex w-80 max-w-sm flex-col bg-surface-hover/30 h-full relative z-10 border-r border-border/50">
          <div className="px-6 py-5 border-b border-border/50 bg-background/50 backdrop-blur-xl shrink-0 h-[73px]">
            <h2 className="text-lg font-bold text-text-primary tracking-tight">Active Participants</h2>
            <p className="text-xs text-text-muted mt-1">Currently in the global chat</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {renderParticipantsList()}
          </div>
        </div>

        {/* Main Chat Area - Moved to RIGHT */}
        <div className="flex-1 relative h-full flex flex-col overflow-hidden bg-background text-text-primary">

          {/* Unified Header for both Mobile and Desktop */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-background/90 backdrop-blur-xl shrink-0 z-20 relative shadow-sm h-[73px]">
            <div className="flex items-center gap-3">
              {/* Mobile Back Button */}
              <button
                onClick={() => router.back()}
                className="md:hidden p-1.5 sm:p-2 rounded-full bg-surface border border-border hover:bg-surface-hover text-text-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">Global Chat</h1>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMobileParticipants(true)}
              className="lg:hidden p-2 rounded-full bg-surface border border-border hover:bg-surface-hover text-text-secondary transition-colors relative shadow-sm"
              aria-label="Show Participants"
            >
              <Users className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full border border-background flex items-center justify-center">
                {onlineCount}
              </span>
            </button>
          </div>

          {/* Mobile Participants Overlay Popup */}
          {showMobileParticipants && (
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden flex flex-col animate-in fade-in">
              <div className="flex-1" onClick={() => setShowMobileParticipants(false)} />
              <div className="bg-surface border-t border-border rounded-t-3xl max-h-[80%] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary tracking-tight">Active Participants</h2>
                    <p className="text-xs text-text-muted mt-0.5">{onlineCount} {onlineCount === 1 ? 'student' : 'students'} currently online</p>
                  </div>
                  <button onClick={() => setShowMobileParticipants(false)} className="p-2 bg-surface-hover rounded-full text-text-secondary hover:bg-surface-hover/80 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {renderParticipantsList()}
                </div>
              </div>
            </div>
          )}

          {/* Messages Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-8 custom-scrollbar">
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
                            <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${isOwn ? 'text-primary' : 'text-text-muted'}`}>
                              {m.random_code}
                            </span>
                          </div>

                          <div className={`relative rounded-3xl px-4 py-2.5 shadow-lg shadow-black/10 transition-colors sm:px-4 sm:py-3 min-w-[100px] ${isOwn
                            ? 'rounded-br-md bg-primary text-primary-foreground'
                            : 'rounded-bl-md bg-surface border border-border text-text-primary'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed sm:text-[15px]">
                              {m.message}
                            </p>
                            <div className={`text-right mt-1.5 text-[11px] font-medium tracking-wide whitespace-nowrap ${isOwn ? 'text-primary-foreground/80' : 'text-text-muted'}`}>
                              {!m.pending
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

              <button
                type="submit"
                disabled={!text.trim()}
                className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-md hover:shadow-lg"
                aria-label="Send message"
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

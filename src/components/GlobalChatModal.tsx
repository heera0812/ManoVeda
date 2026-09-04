import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, MessageSquare, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

interface GlobalChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalChatModal: React.FC<GlobalChatModalProps> = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch recent messages (within 5 hours)
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      setLoading(true);
      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
      try {
        const { data, error } = await Promise.race([
          supabase
            .from('global_chat')
            .select('*')
            .gte('created_at', fiveHoursAgo)
            .order('created_at', { ascending: true }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Chat timeout')), 2500))
        ]);

        if (!error && data && data.length > 0) {
          setMessages(data);
        } else {
          const stored = localStorage.getItem('manoveda_local_chat');
          if (stored) setMessages(JSON.parse(stored));
        }
      } catch {
        const stored = localStorage.getItem('manoveda_local_chat');
        if (stored) setMessages(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [isOpen]);

  // Subscribe to real-time new messages
  useEffect(() => {
    if (!isOpen) return;

    try {
      const channel = supabase
        .channel('global_chat_realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'global_chat',
          },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch {}
      };
    } catch {
      // Ignore websocket connection error if Supabase is unreachable
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    const username = profile?.username || 'Anonymous';
    const text = newMessage.trim();
    setSending(true);

    const localMsg: ChatMessage = {
      id: 'local_msg_' + Date.now(),
      user_id: user.id,
      username,
      message: text,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await Promise.race([
        supabase.from('global_chat').insert({
          user_id: user.id,
          username,
          message: text,
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Send timeout')), 2500))
      ]);

      if (error) throw error;
      setNewMessage('');
    } catch {
      // Local fallback
      setMessages(prev => {
        const updated = [...prev, localMsg];
        localStorage.setItem('manoveda_local_chat', JSON.stringify(updated));
        return updated;
      });
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-28 right-6 z-[110] w-[340px] sm:w-[380px] h-[480px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#325343] to-[#3d6652] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Global Chat</h3>
              <p className="text-white/60 text-[10px]">Messages disappear after 5 hours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#FAF8F5]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#325343]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-[#325343]/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-[#325343]" />
              </div>
              <p className="font-bold text-slate-700 text-sm mb-1">No messages yet</p>
              <p className="text-slate-400 text-xs leading-relaxed">Be the first to say hello! All messages are automatically cleared after 5 hours.</p>
            </div>
          ) : (
            messages.map(msg => {
              const isOwn = msg.user_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  {!isOwn && (
                    <span className="text-[10px] font-bold text-[#325343] mb-0.5 px-1">{msg.username}</span>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-[#325343] text-white rounded-br-lg'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-lg shadow-xs'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className={`text-[9px] mt-1 px-1 ${isOwn ? 'text-slate-400' : 'text-slate-300'}`}>
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className="shrink-0 px-3 py-3 bg-white border-t border-slate-100 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#325343]/20 focus:border-[#325343] transition-shadow"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-xl bg-[#325343] hover:bg-[#264033] disabled:bg-slate-200 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

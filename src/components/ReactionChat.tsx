'use client';

import React, { useState } from 'react';
import { Send, MessageSquare, Flame, Heart, ThumbsUp, DollarSign, Smile } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

export interface ReactionBubble {
  id: string;
  emoji: string;
  senderName: string;
  x: number;
}

export const ReactionChat: React.FC = () => {
  const { socket, roomState } = useSocket();
  const [messages, setMessages] = useState<Array<{ id: string; sender: string; text: string; time: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [reactions, setReactions] = useState<ReactionBubble[]>([]);

  const EMOJIS = ['🔥', '👏', '🏏', '💰', '😱', '🚀', '👑'];

  const sendEmoji = (emoji: string) => {
    const bubble: ReactionBubble = {
      id: `react_${Date.now()}_${Math.random()}`,
      emoji,
      senderName: 'You',
      x: Math.floor(Math.random() * 80) + 10,
    };
    setReactions((prev) => [...prev.slice(-10), bubble]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== bubble.id));
    }, 2500);

    socket?.emit('send_reaction', { roomCode: roomState?.roomCode, emoji });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'You',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [newMsg, ...prev.slice(0, 19)]);
    setInputText('');
  };

  return (
    <div className="relative">
      {/* Floating Emoji Reactions Stream */}
      <div className="fixed bottom-24 right-6 pointer-events-none z-50 flex flex-col items-end space-y-2">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -120, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="text-4xl filter drop-shadow-lg"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Emoji Bar */}
      <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto">
        <span className="text-xs text-slate-400 font-semibold pl-1 pr-2">Reactions:</span>
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendEmoji(emoji)}
            className="p-2 text-xl hover:scale-125 transition transform active:scale-95 rounded-xl hover:bg-slate-800"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

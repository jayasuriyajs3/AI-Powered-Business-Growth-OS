'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { copilotAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  'Why is my conversion rate dropping?',
  'Who are my hottest leads right now?',
  'Generate an investor summary',
  'What is my biggest risk this quarter?',
  'Create a 30-day recovery plan',
  'Compare this month to last month',
];

interface Message { role: 'user' | 'ai'; text: string; }

export default function CopilotPage() {
  const { businessId, businessName } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    if (!text.trim() || !businessId) return;
    setMessages(p => [...p, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await copilotAPI.chat(businessId, text);
      setMessages(p => [...p, { role: 'ai', text: res.data.reply }]);
    } catch {
      setMessages(p => [...p, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col mx-auto" style={{ height: '100%', maxWidth: '800px', maxHeight: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">💬 AI Copilot</h1>
        <p className="text-gray-400 text-sm mt-1">Context-aware advisor — trained on operational history of {businessName}</p>
      </div>

      {/* Chat Messages Frame */}
      <div 
        className="flex-1 overflow-y-auto pr-2 mb-4" 
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minHeight: 0,
          paddingBottom: '20px'
        }}
      >
        {messages.length === 0 && (
          <div className="text-center py-10" style={{ margin: 'auto 0' }}>
            <p className="text-5xl mb-4">🤖</p>
            <p className="text-gray-400 text-sm mb-6">Ask anything about financial trends, leads performance, or strategic options.</p>
            
            <div className="grid grid-cols-2 gap-3" style={{ maxWidth: '600px', margin: '0 auto' }}>
              {SUGGESTIONS.map(s => (
                <button 
                  key={s} 
                  onClick={() => send(s)}
                  className="text-left p-4 glass hover:border-indigo-500 neon-border transition-all"
                  style={{ 
                    borderRadius: '12px', 
                    fontSize: '13px', 
                    background: 'rgba(13, 20, 38, 0.45)',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
              style={{ justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}
            >
              {m.role === 'ai' && (
                <div 
                  className="w-8 h-8 bg-indigo-600/10 border border-indigo-600/30 rounded-full flex items-center justify-center shrink-0"
                  style={{ borderRadius: '50%' }}
                >
                  🤖
                </div>
              )}
              <div 
                className="p-3.5 rounded-xl text-sm" 
                style={{ 
                  maxWidth: '75%', 
                  lineHeight: '1.5',
                  background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  color: m.role === 'user' ? '#ffffff' : 'var(--text-gray-200)',
                  borderTopRightRadius: m.role === 'user' ? '0px' : '12px',
                  borderTopLeftRadius: m.role === 'ai' ? '0px' : '12px',
                  boxShadow: m.role === 'user' ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                }}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-indigo-600/10 border border-indigo-600/30 rounded-full flex items-center justify-center" style={{ borderRadius: '50%' }}>🤖</div>
            <div className="glass p-3.5 rounded-xl flex gap-1.5 items-center" style={{ borderTopLeftRadius: '0px' }}>
              {[0, 1, 2].map(i => (
                <motion.div 
                  key={i} 
                  className="w-2 h-2 bg-indigo-400" 
                  style={{ borderRadius: '50%' }}
                  animate={{ y: [-3, 0] }} 
                  transition={{ delay: i * 0.15, repeat: Infinity, repeatType: 'reverse', duration: 0.4 }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Deck */}
      <div className="flex gap-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
        <input 
          className="input-dark flex-1" 
          placeholder="Ask anything about your business..." 
          value={input}
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && send(input)} 
        />
        <button 
          onClick={() => send(input)} 
          disabled={!input.trim() || loading} 
          className="btn-primary"
          style={{ paddingLeft: '24px', paddingRight: '24px' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { 
  Building, 
  RotateCcw, 
  Play, 
  Bot, 
  Vote, 
  Crown, 
  TrendingUp, 
  Target, 
  Activity, 
  DollarSign, 
  Briefcase, 
  HeartHandshake, 
  Lightbulb, 
  Compass,
  Zap,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const AGENT_COLORS: Record<string, string> = {
  'Data Analyst': '#A855F7', 'Marketing': '#8B5CF6', 'Sales': '#F97316',
  'Finance': '#10B981', 'Operations': '#64748B', 'Customer Success': '#EC4899',
  'Innovation': '#3B82F6', 'Strategy': '#06B6D4', 'CEO': '#F59E0B',
};

const AGENT_ICONS: Record<string, any> = {
  'Data Analyst': TrendingUp,
  'Marketing': Target,
  'Sales': Activity,
  'Finance': DollarSign,
  'Operations': Briefcase,
  'Customer Success': HeartHandshake,
  'Innovation': Lightbulb,
  'Strategy': Compass,
  'CEO': Crown,
};

interface AgentMessage {
  type: 'message' | 'vote' | 'done' | 'error';
  agent: string; emoji: string; color: string; message?: string;
  isVote?: boolean; vote?: string; confidence?: number; reason?: string;
  sessionId?: string; finalDecision?: string; yesVotes?: number; total?: number; avgConfidence?: number;
}

export default function BoardroomPage() {
  const { businessId, businessName } = useStore();
  const router = useRouter();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [votes, setVotes] = useState<AgentMessage[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [finalDecision, setFinalDecision] = useState('');
  const [sessionMeta, setSessionMeta] = useState<any>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!businessId) router.push('/onboard');
  }, [businessId]);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages, votes]);

  const startBoardroom = async () => {
    setMessages([]); setVotes([]); setDone(false); setFinalDecision(''); setSessionMeta(null);
    setRunning(true);

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${API}/api/boardroom/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, sessionType: 'regular' }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        try {
          const data: AgentMessage = JSON.parse(line.replace('data: ', ''));
          if (data.type === 'message') {
            setMessages(prev => [...prev, data]);
          } else if (data.type === 'vote') {
            setVotes(prev => [...prev, data]);
          } else if (data.type === 'done') {
            setFinalDecision(data.finalDecision || '');
            setSessionMeta(data);
            setDone(true);
          } else if (data.type === 'error') {
            setMessages(prev => [...prev, { ...data, message: `Error: ${data.message}` }]);
            setDone(true);
          }
        } catch {}
      }
    }
    setRunning(false);
  };

  const yesCount = votes.filter(v => v.vote === 'YES').length;
  const avgConf = votes.length ? Math.round(votes.reduce((s, v) => s + (v.confidence || 0), 0) / votes.length) : 0;

  return (
    <div className="p-6 flex flex-col mx-auto" style={{ height: '100%', maxWidth: '1000px', maxHeight: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <Building size={24} className="text-indigo-400" />
          <div>
            <h1 className="text-2xl font-black text-white">AI Executive Boardroom</h1>
            <p className="text-gray-400 text-sm mt-1">{businessName} — 9 AI agents debating business strategy live</p>
          </div>
        </div>
        <button onClick={startBoardroom} disabled={running} className="btn-primary flex items-center gap-2">
          {running ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Debate Live...
            </>
          ) : (
            <>
              {done ? <RotateCcw size={14} /> : <Play size={14} />}
              {done ? 'Start New Debate' : 'Launch Boardroom'}
            </>
          )}
        </button>
      </div>

      {/* Main Debate Area */}
      <div className="flex gap-6 flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Chat Feed */}
        <div className="flex-1 flex flex-col min-w-0" style={{ height: '100%' }}>
          <div 
            ref={feedRef} 
            className="flex-1 overflow-y-auto pr-2"
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingBottom: '20px'
            }}
          >
            {messages.length === 0 && !running && (
              <div className="text-center py-20 text-gray-600 glass p-10 flex flex-col items-center justify-center gap-4" style={{ background: 'rgba(13, 20, 38, 0.45)', margin: 'auto' }}>
                <Building size={48} className="text-gray-500" />
                <div>
                  <p className="text-lg font-bold text-gray-400">Boardroom Chambers Ready</p>
                  <p className="text-sm mt-2 max-w-sm mx-auto text-gray-500">Initiate debate. All 9 executive board members will assess your business profile, flag operational dependencies, and vote on immediate priorities.</p>
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, i) => {
                const AgentIcon = AGENT_ICONS[msg.agent] || Bot;
                return (
                  <motion.div 
                    key={i} 
                    className="agent-bubble flex gap-4 p-4 glass"
                    initial={{ opacity: 0, y: 12 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      borderLeftColor: msg.color || 'var(--primary)',
                      background: 'rgba(13, 20, 38, 0.55)'
                    }}
                  >
                    <div 
                      className="rounded-full flex items-center justify-center shrink-0"
                      style={{ 
                        width: '40px',
                        height: '40px',
                        alignSelf: 'flex-start',
                        background: (msg.color || '#6366F1') + '15', 
                        border: `1.5px solid ${msg.color || '#6366F1'}`,
                        borderRadius: '50%',
                        color: msg.color
                      }}
                    >
                      <AgentIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold" style={{ color: msg.color }}>{msg.agent} Agent</span>
                        {msg.agent === 'CEO' && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', fontSize: '9px', letterSpacing: '0.5px' }}>
                            Executive Veto
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-200" style={{ lineHeight: '1.5' }}>{msg.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {running && messages.length > 0 && (
              <div className="flex gap-4 p-4 glass" style={{ background: 'rgba(13, 20, 38, 0.35)', borderLeftColor: 'rgba(99,102,241,0.2)' }}>
                <div className="rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0" style={{ width: '40px', height: '40px', alignSelf: 'flex-start', borderRadius: '50%' }}>
                  <Bot size={18} className="text-indigo-400 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i} 
                      className="w-2.5 h-2.5 bg-indigo-400"
                      style={{ borderRadius: '50%' }}
                      animate={{ y: [-4, 0] }} 
                      transition={{ delay: i * 0.12, repeat: Infinity, repeatType: 'reverse', duration: 0.4 }} 
                    />
                  ))}
                  <span className="text-xs text-gray-500 font-semibold ml-2">Agent typing...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Voting Panel Side Deck */}
        {votes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="glass p-4 shrink-0 overflow-y-auto" 
            style={{ 
              width: '280px', 
              maxHeight: '100%',
              background: 'rgba(13, 20, 38, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <h3 className="font-bold text-sm text-white mb-2 uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Vote size={16} />
              Boardroom Votes
            </h3>
            
            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
              {votes.map((v, i) => {
                const AgentIcon = AGENT_ICONS[v.agent] || Bot;
                return (
                  <div key={i} className="p-3 rounded-lg flex flex-col" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span style={{ color: v.color }}><AgentIcon size={14} /></span>
                        <span className="text-xs font-bold text-white truncate" style={{ maxWidth: '110px' }}>{v.agent}</span>
                      </div>
                      <span 
                        className="text-xs font-black" 
                        style={{ color: v.vote === 'YES' ? 'var(--success)' : 'var(--danger)' }}
                      >
                        {v.vote === 'YES' ? 'YES' : 'NO'}
                      </span>
                    </div>
                    
                    <div className="progress-bar-container" style={{ height: '4px' }}>
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${v.confidence}%`, 
                          background: AGENT_COLORS[v.agent] || 'var(--primary)' 
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-500 font-semibold mt-1" style={{ fontSize: '10px' }}>{v.confidence}% confidence</span>
                  </div>
                );
              })}
            </div>

            {done && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg mt-auto"
                style={{ 
                  background: 'rgba(99, 102, 241, 0.05)', 
                  border: '1px solid rgba(99, 102, 241, 0.2)' 
                }}
              >
                <p className="text-xs font-bold text-indigo-300">
                  Tally: {yesCount}/{votes.length} Approved YES
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Average Confidence: {avgConf}%</p>
                <p className="text-xs font-black mt-2 flex items-center gap-1.5" style={{ color: yesCount >= votes.length * 0.6 ? 'var(--success)' : 'var(--danger)' }}>
                  {yesCount >= votes.length * 0.6 ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  STATUS: {yesCount >= votes.length * 0.6 ? 'APPROVED' : 'REJECTED'}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* CEO Decision Banner */}
      {done && finalDecision && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 glass shrink-0 mb-2"
          style={{ 
            marginTop: '16px',
            background: 'rgba(245, 158, 11, 0.05)', 
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}
        >
          <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Crown size={14} />
            CEO Synthesized Final Decision
          </p>
          <p className="text-sm text-gray-200" style={{ lineHeight: '1.4' }}>{finalDecision}</p>
          <div className="flex gap-3 mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
            <button onClick={() => router.push('/dashboard/strategy')} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
              <Zap size={12} />
              Generate Execution Roadmap <ArrowRight size={12} />
            </button>
            <button onClick={() => router.push('/dashboard/analytics')} className="btn-ghost text-xs py-2 px-4">View Metrics Dashboard</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

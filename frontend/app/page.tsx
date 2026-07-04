'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Building, 
  Dna, 
  AlertTriangle, 
  Sliders, 
  Sun, 
  Bot,
  ArrowRight,
  TrendingUp,
  Target,
  DollarSign,
  Heart
} from 'lucide-react';

const agents = [
  { name: 'CEO', emoji: '👔', color: '#F59E0B' },
  { name: 'Marketing', emoji: '🎯', color: '#8B5CF6' },
  { name: 'Sales', emoji: '📈', color: '#F97316' },
  { name: 'Finance', emoji: '💰', color: '#10B981' },
  { name: 'Strategy', emoji: '🗺️', color: '#06B6D4' },
  { name: 'Operations', emoji: '⚙️', color: '#64748B' },
  { name: 'Customer Success', emoji: '🤝', color: '#EC4899' },
  { name: 'Innovation', emoji: '💡', color: '#3B82F6' },
  { name: 'Data Analyst', emoji: '📊', color: '#A855F7' },
];

const features = [
  { icon: Building, title: 'AI Executive Boardroom', desc: '9 AI agents debate strategy live in real-time. Watch them argue, vote, and decide — just like a real board meeting.' },
  { icon: Dna, title: 'Growth DNA', desc: 'AI fingerprints your business across 5 dimensions. Instantly know your strengths and what\'s holding you back.' },
  { icon: AlertTriangle, title: 'AI Crisis Mode', desc: 'Anomaly detection fires automatically when KPIs drop. Emergency boardroom triggers with a recovery plan.' },
  { icon: Sliders, title: 'What-If Simulator', desc: 'Move sliders to simulate business decisions. See revenue, leads, and risk update instantly before you commit.' },
  { icon: Sun, title: 'Morning Brief', desc: 'Every login starts with your AI executive briefing — priorities, alerts, wins, and today\'s top actions.' },
  { icon: Bot, title: 'AI Copilot', desc: 'Your context-aware business advisor. Knows your full business history, not just the current conversation.' },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(7, 11, 25, 0.5)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center text-white" style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px' }}>
            <Rocket size={18} />
          </div>
          <span className="font-bold text-lg text-white">GrowthOS AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/onboard')} className="btn-ghost text-sm">Try Demo</button>
          <button onClick={() => router.push('/onboard')} className="btn-primary text-sm">
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="glass px-4 py-2 text-xs font-semibold text-indigo-300 mb-6 mx-auto flex items-center gap-2" style={{ display: 'inline-flex', borderRadius: '9999px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full pulse-dot"></span>
            Multi-Agent AI • Real Business Intelligence • Not a CRM
          </div>

          <h1 className="text-7xl font-black text-white mb-6" style={{ lineHeight: '1.15' }}>
            Your AI
            <span className="gradient-text"> Executive Team</span>
            <br />is Ready
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10" style={{ lineHeight: '1.6' }}>
            9 AI agents that debate, vote, and decide — just like a real boardroom.
            GrowthOS AI thinks, plans, executes, and grows your business autonomously.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap-mobile">
            <button
              onClick={() => router.push('/onboard')}
              className="btn-primary text-base px-8 py-4"
              style={{ fontSize: '16px' }}
            >
              Start Your AI Boardroom <ArrowRight size={16} />
            </button>
            <button
              onClick={() => router.push('/onboard')}
              className="btn-ghost text-base px-8 py-4"
              style={{ fontSize: '16px' }}
            >
              Watch Demo
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">No credit card required • 5-min setup • Fits any business model</p>
        </motion.div>

        {/* Floating Agent Badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-16"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="flex items-center gap-2 glass px-4 py-2 text-sm neon-border"
              style={{ 
                borderColor: agent.color + '30',
                borderRadius: '9999px',
                background: 'rgba(13, 20, 38, 0.6)'
              }}
            >
              <span>{agent.emoji}</span>
              <span style={{ color: agent.color, fontWeight: '600' }}>{agent.name} Agent</span>
            </div>
          ))}
        </motion.div>

        {/* Live Boardroom Preview Mock */}
        <motion.div
          className="mt-16 glass p-6 text-left max-w-3xl mx-auto neon-border"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ background: 'rgba(13, 20, 38, 0.85)' }}
        >
          <div className="flex items-center gap-2 mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-full" style={{ borderRadius: '50%' }}></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full" style={{ borderRadius: '50%' }}></div>
              <div className="w-3 h-3 bg-green-500 rounded-full" style={{ borderRadius: '50%' }}></div>
            </div>
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider ml-2">Live Boardroom Debate Preview</span>
            <span className="ml-auto text-xs text-green-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full pulse-dot" style={{ borderRadius: '50%' }}></span> LIVE DEBATE
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { agent: 'Data Analyst', emoji: TrendingUp, color: '#A855F7', msg: 'Revenue grew 8% but CAC increased 34%. Conversion at 2.1% vs industry 3.4%.' },
              { agent: 'Marketing', emoji: Target, color: '#8B5CF6', msg: 'Recommend increasing Instagram spend by 20%. Engagement rate is strong at 4.2%.' },
              { agent: 'Finance', emoji: DollarSign, color: '#10B981', msg: 'Budget increase is risky. Runway is 4 months. Cap at 10% max.' },
              { agent: 'CEO', emoji: Heart, color: '#F59E0B', msg: '[FINAL DECISION] Approved: Launch retention campaign. Cap ad spend at 10%. Close top 5 enterprise leads.' },
            ].map((m, i) => {
              const Icon = m.emoji;
              return (
                <motion.div
                  key={i}
                  className="flex items-start gap-4 p-3 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.2 }}
                  style={{ 
                    background: 'rgba(255,255,255,0.02)',
                    borderLeft: `3px solid ${m.color}`,
                    borderTopLeftRadius: '0px',
                    borderBottomLeftRadius: '0px',
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px'
                  }}
                >
                  <div className="flex items-center justify-center text-sm font-bold shrink-0" style={{ width: '28px', height: '28px', background: `${m.color}15`, border: `1px solid ${m.color}`, borderRadius: '50%', color: m.color }}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold" style={{ color: m.color }}>{m.agent} Agent</span>
                    </div>
                    <p className="text-sm text-gray-300" style={{ lineHeight: '1.4' }}>{m.msg}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="text-4xl font-bold text-center text-white mb-2">Everything a CEO needs. Nothing they don't.</h2>
        <p className="text-center text-gray-400 mb-12 text-base">Built for founders who want intelligence, not just information.</p>
        <div className="grid grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                className="kpi-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-indigo-400 mb-4" style={{ display: 'inline-block' }}>
                  <Icon size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm" style={{ lineHeight: '1.5' }}>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="glass p-10 neon-border" style={{ borderRadius: '24px', background: 'rgba(13, 20, 38, 0.75)' }}>
          <h2 className="text-3xl font-bold text-white mb-2">Ready to meet your AI executive team?</h2>
          <p className="text-gray-400 mb-8 text-sm">Takes 5 minutes to onboard. Your first boardroom session is free.</p>
          <button onClick={() => router.push('/onboard')} className="btn-primary text-base px-10 py-4">
            Start Your AI Boardroom <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(7, 11, 25, 0.4)' }}>
        GrowthOS AI — Built for PS-04 National Hackathon 2025 | Not a CRM. Not a chatbot. Your AI Growth OS.
      </footer>
    </div>
  );
}

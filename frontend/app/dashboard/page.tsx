'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { copilotAPI } from '@/lib/api';
import { 
  Sun, 
  AlertTriangle, 
  Target, 
  Trophy, 
  Building, 
  BarChart3, 
  Bot,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function MorningBriefPage() {
  const { businessId, businessName } = useStore();
  const router = useRouter();
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) { router.push('/onboard'); return; }
    copilotAPI.getMorningBrief(businessId)
      .then(r => setBrief(r.data.brief))
      .catch(() => setBrief(null))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderStyle: 'solid', borderColor: 'var(--primary) transparent transparent transparent' }}></div>
        <p className="text-gray-400 text-sm">Preparing your morning executive briefing...</p>
      </div>
    </div>
  );

  const greeting = brief?.greeting || `Good Morning`;
  const today = brief?.date || new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Sun size={28} className="text-amber-400" />
        <div>
          <h1 className="text-3xl font-black text-white">{greeting}</h1>
          <p className="text-gray-400 text-sm mt-1">{today} — Your GrowthOS Daily Executive Brief</p>
        </div>
      </motion.div>

      {/* Pulse Row */}
      {brief?.pulse && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4">
          {[
            { label: 'Revenue', value: brief.pulse.revenue.value, change: brief.pulse.revenue.change, positive: brief.pulse.revenue.positive },
            { label: 'Leads', value: brief.pulse.leads.value, change: brief.pulse.leads.change, positive: brief.pulse.leads.positive },
            { label: 'Risk Level', value: brief.pulse.risk.level, change: `${brief.pulse.risk.count} alert(s)`, positive: brief.pulse.risk.level === 'Low' },
          ].map((p, i) => (
            <div key={i} className="kpi-card">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{p.label}</p>
              <p className="text-2xl font-bold text-white mt-2">{p.value}</p>
              <p className="text-xs font-bold mt-1 flex items-center gap-1" style={{ color: p.positive ? 'var(--success)' : 'var(--danger)' }}>
                {p.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {p.change}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Critical System Alert */}
      {brief?.alert?.exists && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="p-4 glass rounded-xl flex items-start gap-4"
          style={{ 
            background: 'rgba(245, 158, 11, 0.05)', 
            border: '1px solid rgba(245, 158, 11, 0.2)' 
          }}
        >
          <div className="text-amber-500 shrink-0 mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="font-bold text-yellow-400 text-sm">CRITICAL WARNING ALERT</p>
            <p className="text-sm text-gray-200 mt-1">{brief.alert.message}</p>
            <p className="text-xs text-yellow-500 font-semibold mt-1">— Flagged by {brief.alert.agent} Agent</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Today's Priorities */}
        {brief?.priorities && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="kpi-card flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Target size={18} className="text-indigo-400" />
              Today's Top Priorities
            </h2>
            <div className="flex flex-col gap-3">
              {brief.priorities.map((p: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span className="text-2xl shrink-0">{p.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{p.task}</p>
                    <p className="text-xs text-gray-400 mt-0.5" style={{ lineHeight: '1.4' }}>{p.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Wins */}
        {brief?.wins && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="kpi-card flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trophy size={18} className="text-amber-400" />
              Yesterday's Success Wins
            </h2>
            <div className="flex flex-col gap-3">
              {brief.wins.map((w: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg items-center" style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <span className="text-xl shrink-0">{w.emoji}</span>
                  <p className="text-sm font-medium text-green-400" style={{ lineHeight: '1.4' }}>{w.win}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="mt-6 flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Launch Quick Actions</h3>
              {[
                { label: 'Start Boardroom Session', icon: Building, href: '/dashboard/boardroom' },
                { label: 'View KPI Dashboard', icon: BarChart3, href: '/dashboard/analytics' },
                { label: 'Ask AI Copilot', icon: Bot, href: '/dashboard/copilot' },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <button key={a.href} onClick={() => router.push(a.href)}
                    className="w-full text-left px-4 py-3 glass rounded-lg text-sm text-gray-300 hover:text-white neon-border transition-all flex items-center justify-between"
                    style={{ background: 'rgba(13, 20, 38, 0.3)', borderRadius: '10px' }}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={14} className="text-gray-400" />
                      {a.label}
                    </span>
                    <span className="text-xs text-indigo-400 font-bold flex items-center gap-1">Launch <ArrowRight size={10} /></span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* No Brief Fallback */}
      {!brief && (
        <div className="glass p-10 text-center neon-border" style={{ marginTop: '40px', background: 'rgba(13, 20, 38, 0.75)' }}>
          <div className="text-amber-400 flex justify-center mb-4">
            <Sun size={48} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Welcome to GrowthOS AI</h2>
          <p className="text-gray-400 text-sm mb-8">Your executive morning brief will appear here once you establish a business profile and upload KPI history.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => router.push('/dashboard/boardroom')} className="btn-primary flex items-center gap-2">
              Start First Boardroom Session <ArrowRight size={14} />
            </button>
            <button onClick={() => router.push('/dashboard/analytics')} className="btn-ghost">Open KPI Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}

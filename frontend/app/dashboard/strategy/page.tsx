'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { strategyAPI } from '@/lib/api';

const RISK_COLOR: Record<string, string> = { Low: 'text-green-400', Medium: 'text-yellow-400', High: 'text-red-400' };

export default function StrategyPage() {
  const { businessId } = useStore();
  const [strategy, setStrategy] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'30' | '90' | '180'>('30');

  const generate = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await strategyAPI.generate(businessId);
      setStrategy(res.data.strategy);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const plans: Record<string, any[]> = { '30': strategy?.plan30, '90': strategy?.plan90, '180': strategy?.plan180 };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">🗺️ Strategy Generator</h1>
          <p className="text-gray-400 text-sm mt-1">AI-generated 30 / 90 / 180-day growth roadmaps</p>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary">
          {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Generating...</span> : '⚡ Generate Strategy'}
        </button>
      </div>

      {strategy?.scores && (
        <motion.div className="kpi-card mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="font-bold text-white mb-4">🏆 AI Strategy Score</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Revenue Impact', value: strategy.scores.revenueImpact, color: '#10B981' },
              { label: 'Expected ROI', value: strategy.scores.expectedROI, color: '#6366F1' },
              { label: 'Confidence', value: strategy.scores.confidence, color: '#06B6D4' },
              { label: 'Risk', value: strategy.scores.risk, color: '#EF4444', invert: true },
              { label: 'Difficulty', value: strategy.scores.difficulty, color: '#F59E0B' },
              { label: 'Overall', value: strategy.scores.overall, color: '#8B5CF6' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-400">{s.label}</span>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}/100</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-2xl font-black text-indigo-400">{strategy.scores.overall}/100</span>
            <span className="text-sm text-indigo-300 font-semibold">⭐ RECOMMENDED</span>
          </div>
        </motion.div>
      )}

      {strategy ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex gap-2 mb-4">
            {(['30', '90', '180'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t ? 'bg-indigo-600 text-white' : 'glass text-gray-400 hover:text-white'}`}>
                {t}-Day Plan
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {(plans[activeTab] || []).map((item: any, i: number) => (
              <motion.div key={i} className="kpi-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className="text-indigo-400 font-black text-lg">{i + 1}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.action}</p>
                      <p className="text-xs text-gray-400 mt-1">Owner: <span className="text-indigo-400">{item.owner}</span></p>
                      <p className="text-xs text-gray-300 mt-1">Expected: {item.outcome}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold ${RISK_COLOR[item.risk] || 'text-gray-400'}`}>{item.risk} Risk</span>
                    <p className="text-xs text-gray-500 mt-1">{item.investment}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="kpi-card text-center py-16">
          <p className="text-4xl mb-4">🗺️</p>
          <p className="text-gray-400">Click "Generate Strategy" to create your AI growth roadmap</p>
        </div>
      )}
    </div>
  );
}

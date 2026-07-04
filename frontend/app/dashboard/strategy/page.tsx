'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { strategyAPI } from '@/lib/api';
import { 
  Compass, 
  AlertTriangle, 
  TrendingUp, 
  Coins, 
  Award, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  Activity,
  ThumbsUp,
  Brain,
  Zap
} from 'lucide-react';

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
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const plans: Record<string, any[]> = { 
    '30': strategy?.plan30, 
    '90': strategy?.plan90, 
    '180': strategy?.plan180 
  };

  const scoresMap: Record<string, any> = { 
    '30': strategy?.score30, 
    '90': strategy?.score90, 
    '180': strategy?.score180 
  };

  const activeScore = scoresMap[activeTab];

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Compass size={28} className="text-indigo-400" />
          <div>
            <h1 className="text-2xl font-black text-white">Strategy Generator</h1>
            <p className="text-gray-400 text-sm mt-1">AI-generated 30 / 90 / 180-day growth roadmaps with specific metrics</p>
          </div>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Generating Roadmaps...
            </>
          ) : (
            <>
              <Zap size={14} />
              Generate Strategy
            </>
          )}
        </button>
      </div>

      {/* CEO Best Plan Recommendation Banner */}
      {strategy?.recommendation && (
        <motion.div 
          className="glass p-5 flex items-start gap-4" 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: 'rgba(245, 158, 11, 0.04)', 
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '16px' 
          }}
        >
          <div className="text-amber-500 shrink-0 mt-0.5">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">CEO AI Recommendation Verdict</span>
              <span className="bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-500/20">
                BEST FIT: {strategy.recommendation.bestPlan} Plan
              </span>
            </div>
            <p className="text-sm text-gray-200 mt-2 leading-relaxed">
              {strategy.recommendation.reasoning}
            </p>
          </div>
        </motion.div>
      )}

      {/* Tab Score Card */}
      {activeScore && (
        <motion.div className="kpi-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={`scores-${activeTab}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider text-indigo-400">
              <Brain size={16} />
              AI Plan Metrics ({activeTab}-Day Roadmap)
            </h2>
            <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold text-indigo-300">
              <Activity size={12} />
              Overall Score: {activeScore.overall}/100
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Revenue Impact', value: activeScore.revenueImpact, color: '#10B981', icon: TrendingUp },
              { label: 'Expected ROI', value: activeScore.expectedROI, color: '#6366F1', icon: Coins },
              { label: 'Confidence Score', value: activeScore.confidence, color: '#06B6D4', icon: ThumbsUp },
              { label: 'Implementation Risk', value: activeScore.risk, color: '#EF4444', icon: AlertTriangle },
              { label: 'Execution Difficulty', value: activeScore.difficulty, color: '#F59E0B', icon: Award },
              { label: 'Overall Feasibility', value: activeScore.overall, color: '#8B5CF6', icon: Brain },
            ].map((s, i) => {
              const ScoreIcon = s.icon;
              return (
                <div key={i} className="flex flex-col gap-1.5" style={{ padding: '2px 0' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <ScoreIcon size={14} className="text-gray-500" />
                      {s.label}
                    </span>
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}/100</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${s.value}%`, background: s.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Main Roadmap Section */}
      {strategy ? (
        <div className="flex flex-col gap-4">
          {/* Plan Selector Tabs */}
          <div className="flex gap-2">
            {(['30', '90', '180'] as const).map(t => {
              const isRecommended = strategy?.recommendation?.bestPlan === `${t}-Day`;
              return (
                <button 
                  key={t} 
                  onClick={() => setActiveTab(t)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === t 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'glass text-gray-400 hover:text-white hover:bg-gray-800/40'
                  }`}
                  style={{
                    border: isRecommended ? '1px dashed rgba(245, 158, 11, 0.4)' : '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <span>{t}-Day Plan</span>
                  {isRecommended && (
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cards List */}
          <div className="flex flex-col gap-3">
            {(plans[activeTab] || []).map((item: any, i: number) => (
              <motion.div 
                key={`${activeTab}-${i}`} 
                className="kpi-card" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className="text-indigo-400 font-black text-lg" style={{ minWidth: '20px' }}>{i + 1}</span>
                    <div>
                      <p className="font-semibold text-white text-sm leading-snug">{item.action}</p>
                      <p className="text-xs text-gray-400 mt-1.5">Owner: <span className="text-indigo-400 font-bold">{item.owner}</span></p>
                      <p className="text-xs text-gray-300 mt-1 leading-normal">Outcome: {item.outcome}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-black px-2 py-0.5 rounded uppercase ${
                      item.risk === 'Low' ? 'bg-green-500/10 text-green-400 border border-green-500/15' :
                      item.risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15' :
                      'bg-red-500/10 text-red-400 border border-red-500/15'
                    }`}>
                      {item.risk} Risk
                    </span>
                    <p className="text-xs text-gray-500 mt-2 font-semibold">Budget: {item.investment}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="kpi-card text-center py-20 border border-dashed border-gray-800">
          <div className="text-gray-600 flex justify-center mb-4">
            <Compass size={48} />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Create AI Roadmaps</h2>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">Click the generate button at the top to draft your strategic priorities and score models.</p>
          <button onClick={generate} disabled={loading} className="btn-primary py-2 px-6">
            Generate Strategy
          </button>
        </div>
      )}
    </div>
  );
}

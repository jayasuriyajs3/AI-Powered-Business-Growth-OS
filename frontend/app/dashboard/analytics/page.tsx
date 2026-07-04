'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { kpiAPI, businessAPI } from '@/lib/api';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  Target, 
  Users, 
  Globe, 
  DollarSign, 
  BarChart3, 
  Dna, 
  Building, 
  Flame, 
  AlertCircle, 
  AlertTriangle, 
  Bot, 
  FileText,
  CheckCircle,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function AnalyticsPage() {
  const { businessId } = useStore();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [growthDNA, setGrowthDNA] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);

  useEffect(() => {
    if (!businessId) { router.push('/onboard'); return; }
    Promise.all([
      kpiAPI.getDashboard(businessId),
      businessAPI.getGrowthDNA(businessId),
    ]).then(([d, g]) => {
      setDashboard(d.data.dashboard);
      setGrowthDNA(g.data.growthDNA);
    }).finally(() => setLoading(false));
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    setAnalysisLoading(true);
    businessAPI.getAnalysis(businessId)
      .then(r => setAnalysis(r.data.analysis))
      .catch(err => console.error("Error loading SWOT report:", err))
      .finally(() => setAnalysisLoading(false));
  }, [businessId]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderStyle: 'solid', borderColor: 'var(--primary) transparent transparent transparent' }}></div>
        <p className="text-gray-400 text-sm">Loading business intelligence dashboard...</p>
      </div>
    </div>
  );

  const radarData = growthDNA ? [
    { subject: 'Innovation', value: growthDNA.innovation },
    { subject: 'Marketing', value: growthDNA.marketing },
    { subject: 'Sales', value: growthDNA.sales },
    { subject: 'Finance', value: growthDNA.finance },
    { subject: 'Operations', value: growthDNA.operations },
  ] : [];

  const kpiHistory = dashboard?.kpiHistory || [];

  const metrics = dashboard ? [
    { label: 'Business Health', value: dashboard.businessHealthScore, suffix: '/100', color: '#6366F1', icon: Activity },
    { label: 'Growth Score', value: dashboard.growthScore, suffix: '/100', color: '#10B981', icon: TrendingUp },
    { label: 'Lead Score', value: dashboard.leadScore, suffix: '/100', color: '#F97316', icon: Target },
    { label: 'Customer Health', value: dashboard.customerHealth, suffix: '/100', color: '#EC4899', icon: Users },
    { label: 'Market Readiness', value: dashboard.marketReadiness, suffix: '/100', color: '#06B6D4', icon: Globe },
    { label: 'Revenue Opportunity', value: `₹${(dashboard.revenueOpportunity || 0).toLocaleString('en-IN')}`, suffix: '', color: '#F59E0B', icon: DollarSign },
  ] : [];

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <BarChart3 size={28} className="text-indigo-400" />
        <div>
          <h1 className="text-2xl font-black text-white">Business Intelligence Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">All 9 mandatory metrics from the executive brief — real-time analysis</p>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div 
              key={i} 
              className="kpi-card" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{m.label}</span>
                <span style={{ color: m.color }}><Icon size={18} /></span>
              </div>
              <p className="text-3xl font-black mt-1" style={{ color: m.color }}>{m.value}{m.suffix}</p>
              
              <div className="progress-bar-container mt-4">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${typeof m.value === 'number' ? m.value : 65}%`,
                    background: `linear-gradient(90deg, ${m.color}, #8B5CF6)`
                  }}
                ></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Growth DNA Radar Chart */}
        <motion.div className="kpi-card flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Dna size={16} className="text-indigo-400" />
            Growth DNA Fingerprint
          </h2>
          {growthDNA && <p className="text-xs text-indigo-400 font-semibold mb-4">{growthDNA.label}</p>}
          
          <div className="flex-1 flex items-center justify-center py-2" style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }} />
                <Radar name="DNA" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {growthDNA?.narrative && (
            <p className="text-xs text-gray-400 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', lineHeight: '1.5' }}>
              {growthDNA.narrative}
            </p>
          )}
        </motion.div>

        {/* Revenue Line Chart */}
        <motion.div className="kpi-card flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            MoM Revenue Performance
          </h2>
          
          <div className="flex-1" style={{ height: 230 }}>
            {kpiHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpiHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-surface)', 
                      border: '1px solid var(--border)', 
                      color: 'var(--text-primary)', 
                      borderRadius: 10,
                      fontSize: '12px'
                    }} 
                    formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} 
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-sm font-medium">No KPI history recorded yet</p>
                  <button onClick={() => router.push('/dashboard/crisis')} className="btn-primary text-xs mt-4 py-2 px-4">Update KPI Data →</button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Business SWOT Analysis Section */}
      <motion.div 
        className="kpi-card" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Building size={16} className="text-indigo-400" />
          AI Business SWOT Health Report
        </h2>
        <p className="text-gray-400 text-xs mb-6">Autonomous audit generated from onboarding telemetry and business parameters</p>

        {analysisLoading ? (
          <div className="py-12 flex justify-center items-center">
            <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" style={{ borderStyle: 'solid', borderColor: 'var(--primary) transparent transparent transparent' }}></span>
            <span className="text-xs text-gray-500 ml-3">Groq compiling SWOT audit...</span>
          </div>
        ) : analysis ? (
          <div className="flex flex-col gap-6">
            {/* SWOT 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">💪 Key Strengths</p>
                <ul className="flex flex-col gap-2 list-none m-0 p-0">
                  {analysis.strengths.map((s: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">⚠️ Critical Weaknesses</p>
                <ul className="flex flex-col gap-2 list-none m-0 p-0">
                  {analysis.weaknesses.map((w: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2.5 leading-relaxed">
                      <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(6, 182, 212, 0.03)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">🚀 Market Opportunities</p>
                <ul className="flex flex-col gap-2 list-none m-0 p-0">
                  {analysis.opportunities.map((o: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2.5 leading-relaxed">
                      <Zap size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-3">🔥 Impending Threats</p>
                <ul className="flex flex-col gap-2 list-none m-0 p-0">
                  {analysis.threats.map((t: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2.5 leading-relaxed">
                      <AlertCircle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Strategic Insight Block */}
            <div className="p-5 glass" style={{ background: 'rgba(13, 20, 38, 0.5)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Target size={14} />
                Strategic Intelligence Insight
              </p>
              <p className="text-sm text-gray-200 font-medium italic leading-relaxed" style={{ fontStyle: 'italic' }}>
                "{analysis.keyInsight}"
              </p>
            </div>

            {/* Immediate Action Priority */}
            {analysis.immediatePriority && (
              <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div className="flex items-center gap-3">
                  <Flame size={18} className="text-orange-500" />
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Immediate Priority Action Item</span>
                    <span className="text-sm text-white font-bold">{analysis.immediatePriority}</span>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/dashboard/strategy')} 
                  className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5"
                >
                  Generate Plan <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">Failed to generate SWOT analysis. Please check your network connection.</p>
          </div>
        )}
      </motion.div>

      {/* Risk Alerts */}
      {dashboard?.riskAlerts?.length > 0 && (
        <motion.div className="kpi-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-400" />
            System Risk Alerts
          </h2>
          <div className="flex flex-col gap-2">
            {dashboard.riskAlerts.map((a: any, i: number) => {
              const isCritical = a.level === 'critical';
              const AlertIcon = isCritical ? AlertCircle : AlertTriangle;
              return (
                <div 
                  key={i} 
                  className="flex items-start gap-3 p-3 rounded-lg" 
                  style={{
                    background: isCritical ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                    border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                  }}
                >
                  <AlertIcon size={16} className="mt-0.5 shrink-0" style={{ color: isCritical ? '#EF4444' : '#F59E0B' }} />
                  <p className="text-sm" style={{ color: isCritical ? '#FCA3A3' : '#FDE047', lineHeight: '1.4' }}>{a.message}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* AI Recommendations */}
      {dashboard?.recommendations?.length > 0 && (
        <motion.div className="kpi-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Bot size={16} className="text-indigo-400" />
            AI Explanations & Recommendations
          </h2>
          <div className="flex flex-col gap-3">
            {dashboard.recommendations.map((r: any, i: number) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{r.area} Sector Opportunity</span>
                  <span className="text-xs text-gray-500 font-semibold">{r.confidence}% AI Confidence</span>
                </div>
                <p className="text-sm text-gray-200" style={{ lineHeight: '1.5' }}>{r.action}</p>
                <div className="progress-bar-container mt-3">
                  <div className="progress-bar-fill" style={{ width: `${r.confidence}%`, background: 'var(--primary)' }}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Executive Summary */}
      {dashboard?.executiveSummary && (
        <motion.div className="kpi-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <FileText size={16} className="text-indigo-400" />
            Executive Summary Report
          </h2>
          <p className="text-sm text-gray-300" style={{ lineHeight: '1.6' }}>{dashboard.executiveSummary}</p>
        </motion.div>
      )}
    </div>
  );
}

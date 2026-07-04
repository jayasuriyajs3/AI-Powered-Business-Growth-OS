'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { businessAPI } from '@/lib/api';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

export default function GrowthDNAPage() {
  const { businessId, businessName } = useStore();
  const router = useRouter();
  const [growthDNA, setGrowthDNA] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) { router.push('/onboard'); return; }
    setLoading(true);
    businessAPI.getGrowthDNA(businessId)
      .then(r => setGrowthDNA(r.data.growthDNA))
      .catch(err => console.error("Error loading Growth DNA:", err))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderStyle: 'solid', borderColor: 'var(--primary) transparent transparent transparent' }}></div>
        <p className="text-gray-400 text-sm">Mapping your company's Growth DNA...</p>
      </div>
    </div>
  );

  const radarData = growthDNA ? [
    { subject: 'Innovation', value: growthDNA.innovation, color: '#3B82F6' },
    { subject: 'Marketing', value: growthDNA.marketing, color: '#8B5CF6' },
    { subject: 'Sales', value: growthDNA.sales, color: '#F97316' },
    { subject: 'Finance', value: growthDNA.finance, color: '#10B981' },
    { subject: 'Operations', value: growthDNA.operations, color: '#64748B' },
  ] : [];

  const metrics = growthDNA ? [
    { label: 'Innovation', value: growthDNA.innovation, color: '#3B82F6', desc: 'Measures technology adoption, company stage flexibility, and MoM growth rate.' },
    { label: 'Marketing', value: growthDNA.marketing, color: '#8B5CF6', desc: 'Measures CAC efficiency, marketing spend ratio, and marketing channel diversity.' },
    { label: 'Sales', value: growthDNA.sales, color: '#F97316', desc: 'Measures lead conversion efficiency, deal sizes, and monthly pipeline lead volume.' },
    { label: 'Finance', value: growthDNA.finance, color: '#10B981', desc: 'Measures cash runway viability, profit margins, and revenue curve acceleration.' },
    { label: 'Operations', value: growthDNA.operations, color: '#64748B', desc: 'Measures headcount efficiency, process overheads, and operational scale factors.' },
  ] : [];

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">🧬 Growth DNA Fingerprint</h1>
        <p className="text-gray-400 text-sm mt-1">{businessName} — 5-dimensional capability indexing audit</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Radar Chart Card */}
        <motion.div 
          className="kpi-card col-span-2 flex flex-col justify-between"
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ height: '420px' }}
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">📊 Spider Chart Visualisation</h2>
          
          <div className="flex-1 w-full h-full flex items-center justify-center py-4">
            {growthDNA ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} />
                  <Radar name="Growth DNA" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} strokeWidth={2.5} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm">Failed to construct chart vector coordinates</p>
            )}
          </div>
        </motion.div>

        {/* Narrative Sidecard */}
        <motion.div 
          className="kpi-card flex flex-col justify-between"
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          style={{ height: '420px' }}
        >
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 mb-3">🏷️ Classification</h2>
            {growthDNA && (
              <div className="p-3.5 rounded-lg mb-4" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <span className="text-xs text-indigo-300 font-bold block uppercase tracking-wide">DNA LABEL</span>
                <span className="text-sm text-white font-bold block mt-1 leading-snug">{growthDNA.label}</span>
              </div>
            )}
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Narrative Report</h3>
            <p className="text-sm text-gray-300 leading-relaxed" style={{ fontStyle: 'italic' }}>
              "{growthDNA?.narrative || 'AI compiling narrative metrics...'}"
            </p>
          </div>
          <button onClick={() => router.push('/dashboard/strategy')} className="btn-primary text-xs py-2.5 w-full mt-4">
            Generate Strategy for DNA →
          </button>
        </motion.div>
      </div>

      {/* Detail list card */}
      <motion.div 
        className="kpi-card"
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 mb-4">🧬 Capability Dimension breakdown</h2>
        <div className="flex flex-col gap-4">
          {metrics.map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl flex items-center justify-between gap-6" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }}></span>
                  <span className="text-sm font-bold text-white">{m.label} capability</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{m.desc}</p>
              </div>
              <div className="text-right shrink-0" style={{ width: '180px' }}>
                <span className="text-xl font-black text-white">{m.value} <span className="text-xs text-gray-500">/100</span></span>
                <div className="progress-bar-container mt-1.5" style={{ height: '4px' }}>
                  <div className="progress-bar-fill" style={{ width: `${m.value}%`, background: m.color }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

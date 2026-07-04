'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';

const URGENCY_COLOR: Record<string, string> = { High: 'text-red-400 bg-red-900/30', Medium: 'text-yellow-400 bg-yellow-900/30', Low: 'text-green-400 bg-green-900/30' };

export default function OpportunityPage() {
  const { businessId } = useStore();
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const scan = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await contentAPI.getOpportunityRadar(businessId);
      setOpps(res.data.opportunities || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">🔭 Opportunity Radar</h1>
          <p className="text-gray-400 text-sm mt-1">AI scans your business context to surface hidden growth opportunities</p>
        </div>
        <button onClick={scan} disabled={loading} className="btn-primary">
          {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Scanning...</span> : '🔍 Scan Opportunities'}
        </button>
      </div>

      {opps.length === 0 && !loading && (
        <div className="kpi-card text-center py-16">
          <p className="text-4xl mb-4">🔭</p>
          <p className="text-gray-400">Click "Scan Opportunities" to discover hidden growth levers</p>
        </div>
      )}

      <div className="space-y-4">
        {opps.map((opp, i) => (
          <motion.div key={i} className="kpi-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="flex items-start gap-4">
              <span className="text-3xl">{opp.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-xs text-indigo-400 font-medium">{opp.category}</span>
                    <h3 className="font-bold text-white text-sm">{opp.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${URGENCY_COLOR[opp.urgency] || 'text-gray-400'}`}>{opp.urgency}</span>
                    {opp.potentialRevenue && <p className="text-xs text-green-400 mt-1">{opp.potentialRevenue}</p>}
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{opp.insight}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

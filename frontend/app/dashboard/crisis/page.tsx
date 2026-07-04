'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { kpiAPI } from '@/lib/api';

export default function CrisisPage() {
  const { businessId } = useStore();
  const [form, setForm] = useState({ month: '', revenue: '', profit: '', leads: '', conversion: '', marketingROI: '', cac: '', retention: '', nps: '', growthRate: '' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await kpiAPI.update({ businessId, ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, k === 'month' ? v : Number(v)])) });
      setResult(res.data);
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  };

  const Field = ({ label, field, placeholder }: any) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input className="input-dark" placeholder={placeholder} value={form[field as keyof typeof form]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} type={field === 'month' ? 'text' : 'number'} />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">🚨 AI Crisis Mode</h1>
        <p className="text-gray-400 text-sm mt-1">Enter your latest KPIs — AI detects anomalies automatically and triggers recovery</p>
      </div>

      <div className="kpi-card mb-6">
        <h2 className="font-bold text-white mb-4">Enter Latest KPI Data</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Month (e.g. Jun 2025)" field="month" placeholder="Jun 2025" />
          <Field label="Monthly Revenue (₹)" field="revenue" placeholder="500000" />
          <Field label="Monthly Profit (₹)" field="profit" placeholder="150000" />
          <Field label="New Leads" field="leads" placeholder="80" />
          <Field label="Conversion Rate (%)" field="conversion" placeholder="3.2" />
          <Field label="Marketing ROI (%)" field="marketingROI" placeholder="280" />
          <Field label="CAC (₹)" field="cac" placeholder="2500" />
          <Field label="Retention Rate (%)" field="retention" placeholder="88" />
          <Field label="NPS Score" field="nps" placeholder="42" />
          <Field label="MoM Growth (%)" field="growthRate" placeholder="8" />
        </div>
        <button onClick={submit} disabled={loading || !form.month || !form.revenue} className="btn-primary w-full">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Analysing...</span> : '🔍 Analyse KPIs'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {result.anomalyDetected ? (
            <div className="p-5 bg-red-900/20 border-2 border-red-700/60 rounded-xl glow-danger">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🚨</span>
                <div>
                  <p className="font-bold text-red-300 text-lg">ANOMALY DETECTED</p>
                  <p className="text-sm text-red-400">Revenue deviation: {result.anomalyScore}σ below baseline</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-4">This is a statistically significant drop. Emergency boardroom recommended.</p>
              <button onClick={() => window.location.href = '/dashboard/boardroom'} className="btn-primary bg-red-600 hover:bg-red-700 w-full">
                🏛️ Launch Emergency Boardroom →
              </button>
            </div>
          ) : (
            <div className="p-5 bg-green-900/20 border border-green-700/40 rounded-xl glow-success">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <p className="font-bold text-green-300 text-lg">KPIs Look Normal</p>
                  <p className="text-sm text-green-400">No anomalies detected. Anomaly score: {result.anomalyScore}σ</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

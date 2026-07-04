'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { strategyAPI } from '@/lib/api';

export default function SimulatorPage() {
  const { businessId } = useStore();
  const [sliders, setSliders] = useState({ marketingBudget: 0, pricing: 0, discount: 0 });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: number) => setSliders(s => ({ ...s, [key]: val }));

  const simulate = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await strategyAPI.whatif(businessId, sliders);
      setResult(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const SliderRow = ({ label, field, min, max, unit }: any) => (
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm font-bold text-indigo-400">{sliders[field as keyof typeof sliders] > 0 ? '+' : ''}{sliders[field as keyof typeof sliders]}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={sliders[field as keyof typeof sliders]}
        onChange={e => update(field, Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #6366F1 0%, #6366F1 ${((sliders[field as keyof typeof sliders] - min) / (max - min)) * 100}%, #1F2937 ${((sliders[field as keyof typeof sliders] - min) / (max - min)) * 100}%, #1F2937 100%)` }} />
      <div className="flex justify-between text-xs text-gray-600 mt-1"><span>{min}{unit}</span><span>{max}{unit}</span></div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">🎲 What-If Simulator</h1>
        <p className="text-gray-400 text-sm mt-1">Move sliders to simulate business decisions — instant AI predictions</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="kpi-card">
          <h2 className="font-bold text-white mb-5">Adjust Variables</h2>
          <SliderRow label="Marketing Budget Change" field="marketingBudget" min={-50} max={50} unit="%" />
          <SliderRow label="Pricing Change" field="pricing" min={-30} max={30} unit="%" />
          <SliderRow label="Discount Rate" field="discount" min={0} max={30} unit="%" />
          <button onClick={simulate} disabled={loading} className="btn-primary w-full mt-2">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Simulating...</span> : '🎲 Run Simulation'}
          </button>
        </div>

        {/* Results */}
        <div className="kpi-card">
          <h2 className="font-bold text-white mb-5">Predicted Impact</h2>
          {!result ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <p className="text-4xl mb-3">🎯</p>
              <p className="text-sm">Adjust sliders and run simulation</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {[
                { label: 'Revenue', base: `₹${result.base.revenue?.toLocaleString('en-IN')}`, projected: `₹${result.projected.revenue?.toLocaleString('en-IN')}`, positive: result.projected.revenue > result.base.revenue },
                { label: 'New Leads/mo', base: result.base.leads, projected: result.projected.leads, positive: result.projected.leads > result.base.leads },
                { label: 'CAC', base: `₹${result.base.cac?.toLocaleString('en-IN')}`, projected: `₹${result.projected.cac?.toLocaleString('en-IN')}`, positive: result.projected.cac < result.base.cac },
                { label: 'Profit', base: `₹${result.base.profit?.toLocaleString('en-IN')}`, projected: `₹${result.projected.profit?.toLocaleString('en-IN')}`, positive: result.projected.profit > result.base.profit },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
                  <span className="text-sm text-gray-400">{r.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{r.base}</span>
                    <span className="text-gray-600">→</span>
                    <span className={`text-sm font-bold ${r.positive ? 'text-green-400' : 'text-red-400'}`}>{r.projected}</span>
                  </div>
                </div>
              ))}
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${result.projected.riskLevel === 'HIGH' ? 'bg-red-900/40 text-red-400' : result.projected.riskLevel === 'MEDIUM' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-green-900/40 text-green-400'}`}>
                  {result.projected.riskLevel} RISK
                </span>
                {result.projected.roi > 0 && <span className="text-xs text-indigo-400">ROI: {result.projected.roi}x</span>}
              </div>
              {result.verdict && (
                <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-800/30 rounded-lg">
                  <p className="text-xs font-bold text-indigo-300 mb-1">🤖 AI Verdict</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{result.verdict}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

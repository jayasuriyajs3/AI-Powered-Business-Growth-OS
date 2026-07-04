'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';

const CAMPAIGN_TYPES = ['email', 'instagram', 'google_ads', 'whatsapp', 'linkedin'];

export default function CampaignsPage() {
  const { businessId } = useStore();
  const [type, setType] = useState('email');
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await contentAPI.generateCampaign(businessId, type);
      setCampaign(res.data.campaign);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">🎯 Campaign Generator</h1>
        <p className="text-gray-400 text-sm mt-1">One-click AI campaigns tailored to your business</p>
      </div>

      <div className="kpi-card mb-4">
        <h2 className="font-bold text-white mb-4">Select Campaign Type</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {CAMPAIGN_TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${type === t ? 'bg-indigo-600 text-white' : 'glass text-gray-400 hover:text-white neon-border'}`}>
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary w-full">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Generating...</span> : `✨ Generate ${type.replace('_', ' ')} Campaign`}
        </button>
      </div>

      {campaign && (
        <motion.div className="kpi-card space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-bold text-white">📋 Generated Campaign</h2>
          {[
            { label: '📢 Headline', value: campaign.headline },
            { label: '💬 Subheadline', value: campaign.subheadline },
            { label: '📝 Body Copy', value: campaign.body },
            { label: '🎯 CTA', value: campaign.cta },
            { label: '👥 Target Audience', value: campaign.targetAudience },
            { label: '💰 Budget Recommendation', value: campaign.budget },
            { label: '📊 Expected Reach', value: campaign.expectedReach },
          ].map((f, i) => f.value && (
            <div key={i} className="p-3 bg-gray-800/50 rounded-lg">
              <p className="text-xs font-semibold text-indigo-400 mb-1">{f.label}</p>
              <p className="text-sm text-gray-200 leading-relaxed">{f.value}</p>
            </div>
          ))}
          {campaign.hashtags?.length > 0 && (
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <p className="text-xs font-semibold text-indigo-400 mb-2"># Hashtags</p>
              <div className="flex flex-wrap gap-1">{campaign.hashtags.map((h: string, i: number) => <span key={i} className="text-xs bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded-full">{h}</span>)}</div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

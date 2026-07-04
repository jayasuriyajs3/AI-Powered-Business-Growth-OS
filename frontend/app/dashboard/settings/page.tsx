'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { businessAPI } from '@/lib/api';
import axios from 'axios';
import { 
  Settings, 
  Sparkles, 
  Save, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  Terminal,
  Activity,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const INDUSTRIES = [
  'B2B SaaS', 'E-commerce', 'Healthcare', 'Fintech', 
  'Edtech', 'Marketing Agency', 'Logistics', 'Professional Services'
];

export default function SettingsPage() {
  const { businessId, setBusinessName, setIndustry } = useStore();
  const router = useRouter();
  
  // Loading & State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'form' | 'ai'>('form');
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; msg?: string } | null>(null);
  
  // Form State
  const [form, setForm] = useState<any>({
    companyName: '',
    industry: '',
    foundedYear: 2024,
    employees: '1-10',
    stage: 'startup',
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    revenueGrowth: 0,
    topRevenueSource: '',
    cashRunway: 12,
    targetCustomer: 'B2B',
    avgDealSize: 0,
    monthlyLeads: 0,
    conversionRate: 0,
    churnRate: 0,
    topSalesChannel: '',
    marketingBudget: 0,
    cac: 0,
    activeChannels: '',
    topCompetitors: '',
    goals: '',
    biggestChallenge: '',
    workingWell: '',
    notWorking: '',
  });

  // AI Command Box State
  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUpdates, setAiUpdates] = useState<any>(null);

  // Fetch Business Data
  useEffect(() => {
    if (!businessId) {
      router.push('/onboard');
      return;
    }
    fetchData();
  }, [businessId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await businessAPI.get(businessId!);
      const b = res.data.business;
      setForm({
        ...b,
        activeChannels: b.activeChannels?.join(', ') || '',
        topCompetitors: b.topCompetitors?.join(', ') || '',
        goals: b.goals?.join(', ') || '',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, val: any) => {
    setForm((p: any) => ({ ...p, [field]: val }));
  };

  // Submit manual form updates
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    try {
      const cleaned = {
        ...form,
        activeChannels: form.activeChannels.split(',').map((s: string) => s.trim()).filter(Boolean),
        topCompetitors: form.topCompetitors.split(',').map((s: string) => s.trim()).filter(Boolean),
        goals: form.goals.split(',').map((s: string) => s.trim()).filter(Boolean),
      };

      const res = await businessAPI.update(businessId!, cleaned);
      if (res.data.success) {
        setSaveStatus({ success: true, msg: 'Company profile updated successfully! Growth DNA & caches rebuilt.' });
        setBusinessName(res.data.business.companyName);
        setIndustry(res.data.business.industry);
        setTimeout(() => setSaveStatus(null), 5000);
      }
    } catch (err: any) {
      setSaveStatus({ success: false, msg: err.response?.data?.error || err.message });
    }
  };

  // Submit agentic AI command updates
  const handleAiUpdate = async () => {
    if (!aiMessage.trim()) return;
    setAiLoading(true);
    setSaveStatus(null);
    setAiUpdates(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/business/${businessId}/update-agentic`, {
        message: aiMessage
      });
      
      if (res.data.success) {
        const updates = res.data.updatedFields;
        if (Object.keys(updates).length > 0) {
          setAiUpdates(updates);
          setAiMessage('');
          setSaveStatus({ success: true, msg: `Agent successfully updated ${Object.keys(updates).length} field(s)!` });
          // Refresh form state with newly saved data
          const b = res.data.business;
          setForm({
            ...b,
            activeChannels: b.activeChannels?.join(', ') || '',
            topCompetitors: b.topCompetitors?.join(', ') || '',
            goals: b.goals?.join(', ') || '',
          });
          setBusinessName(b.companyName);
          setIndustry(b.industry);
        } else {
          setSaveStatus({ success: false, msg: 'The AI could not identify any specific operational values to update in your message. Try being specific with numbers or names.' });
        }
      }
    } catch (err: any) {
      setSaveStatus({ success: false, msg: err.response?.data?.error || err.message });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderStyle: 'solid', borderColor: 'var(--primary) transparent transparent transparent' }}></div>
          <p className="text-gray-400 text-sm">Loading profile configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6" style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings size={28} className="text-indigo-400" />
        <div>
          <h1 className="text-2xl font-black text-white">Profile Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Configure company financials, operational variables, and targets</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 shrink-0 border-b border-gray-800 pb-px">
        <button 
          onClick={() => { setActiveTab('form'); setSaveStatus(null); }}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'form' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'glass text-gray-400 hover:text-white hover:bg-gray-800/40'
          }`}
          style={{ border: '1px solid rgba(255,255,255,0.05)' }}
        >
          📝 Edit Manually (Form)
        </button>
        <button 
          onClick={() => { setActiveTab('ai'); setSaveStatus(null); }}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'ai' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'glass text-gray-400 hover:text-white hover:bg-gray-800/40'
          }`}
          style={{ border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Sparkles size={14} className="text-amber-400" />
          ✨ Tell AI to Update
        </button>
      </div>

      {/* Status Alerts */}
      {saveStatus && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            saveStatus.success 
              ? 'bg-green-500/5 border-green-500/25 text-green-400' 
              : 'bg-red-500/5 border-red-500/25 text-red-400'
          }`}
        >
          {saveStatus.success ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span className="text-sm font-medium">{saveStatus.msg}</span>
        </motion.div>
      )}

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'form' ? (
          <motion.form 
            key="form-tab" 
            onSubmit={handleSaveForm}
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 10 }}
            className="flex flex-col gap-6"
          >
            {/* Section 1: Company Info */}
            <div className="kpi-card flex flex-col gap-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400">Company Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Company Name</label>
                  <input 
                    type="text" 
                    className="input-dark" 
                    value={form.companyName} 
                    onChange={e => updateField('companyName', e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Industry</label>
                  <select 
                    className="select-dark" 
                    value={form.industry} 
                    onChange={e => updateField('industry', e.target.value)}
                  >
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Company Stage</label>
                  <select 
                    className="select-dark" 
                    value={form.stage} 
                    onChange={e => updateField('stage', e.target.value)}
                  >
                    {['startup', 'growth', 'mature'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Founded Year</label>
                  <input 
                    type="number" 
                    className="input-dark" 
                    value={form.foundedYear} 
                    onChange={e => updateField('foundedYear', parseInt(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Team Size</label>
                  <select 
                    className="select-dark" 
                    value={form.employees} 
                    onChange={e => updateField('employees', e.target.value)}
                  >
                    {['1-10', '11-50', '51-200', '200+'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Financial Snapshot */}
            <div className="kpi-card flex flex-col gap-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400">Financial Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Monthly Revenue (₹)</label>
                  <input 
                    type="number" 
                    className="input-dark" 
                    value={form.monthlyRevenue} 
                    onChange={e => updateField('monthlyRevenue', parseFloat(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Monthly Expenses (₹)</label>
                  <input 
                    type="number" 
                    className="input-dark" 
                    value={form.monthlyExpenses} 
                    onChange={e => updateField('monthlyExpenses', parseFloat(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Revenue Growth Rate (3M %)</label>
                  <input 
                    type="number" 
                    className="input-dark" 
                    value={form.revenueGrowth} 
                    onChange={e => updateField('revenueGrowth', parseFloat(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Avg. Customer Deal Size (₹)</label>
                  <input 
                    type="number" 
                    className="input-dark" 
                    value={form.avgDealSize} 
                    onChange={e => updateField('avgDealSize', parseFloat(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Cash Runway (months)</label>
                  <input 
                    type="number" 
                    className="input-dark" 
                    value={form.cashRunway} 
                    onChange={e => updateField('cashRunway', parseInt(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Primary Revenue Stream</label>
                  <input 
                    type="text" 
                    className="input-dark" 
                    placeholder="e.g. Subscription Subscriptions"
                    value={form.topRevenueSource} 
                    onChange={e => updateField('topRevenueSource', e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Marketing & Sales Operations */}
            <div className="kpi-card flex flex-col gap-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400">Marketing & Sales Channels</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Monthly Marketing Budget (₹)</label>
                  <input 
                    type="number" 
                    className="input-dark" 
                    value={form.marketingBudget} 
                    onChange={e => updateField('marketingBudget', parseFloat(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Customer Acquisition Cost (CAC) (₹)</label>
                  <input 
                    type="number" 
                    className="input-dark" 
                    value={form.cac} 
                    onChange={e => updateField('cac', parseFloat(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Target Customer Audience</label>
                  <select 
                    className="select-dark" 
                    value={form.targetCustomer} 
                    onChange={e => updateField('targetCustomer', e.target.value)}
                  >
                    {['B2B', 'B2C', 'Both'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Monthly Inbound Leads</label>
                  <input 
                    type="number" 
                    className="input-dark" 
                    value={form.monthlyLeads} 
                    onChange={e => updateField('monthlyLeads', parseInt(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Lead Conversion Rate (%)</label>
                  <input 
                    type="number" 
                    className="input-dark" 
                    value={form.conversionRate} 
                    onChange={e => updateField('conversionRate', parseFloat(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Monthly Customer Churn Rate (%)</label>
                  <input 
                    type="number" 
                    className="input-dark" 
                    value={form.churnRate} 
                    onChange={e => updateField('churnRate', parseFloat(e.target.value))} 
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Active Channels (comma-separated)</label>
                  <input 
                    type="text" 
                    className="input-dark" 
                    placeholder="e.g. LinkedIn Ads, Cold Email, Google SEO"
                    value={form.activeChannels} 
                    onChange={e => updateField('activeChannels', e.target.value)} 
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Top Sales Channel</label>
                  <input 
                    type="text" 
                    className="input-dark" 
                    placeholder="e.g. Outbound Sales Team"
                    value={form.topSalesChannel} 
                    onChange={e => updateField('topSalesChannel', e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {/* Section 4: SWOT & Insights Context */}
            <div className="kpi-card flex flex-col gap-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400">Goals & Challenges</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Competitors (comma-separated)</label>
                  <input 
                    type="text" 
                    className="input-dark" 
                    placeholder="e.g. HubSpot, Salesforce"
                    value={form.topCompetitors} 
                    onChange={e => updateField('topCompetitors', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Strategic Growth Goals (comma-separated)</label>
                  <input 
                    type="text" 
                    className="input-dark" 
                    placeholder="e.g. Reach ₹20L MRR, Expand into Enterprise tier"
                    value={form.goals} 
                    onChange={e => updateField('goals', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Biggest Operational Challenge</label>
                  <textarea 
                    className="input-dark" 
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    value={form.biggestChallenge} 
                    onChange={e => updateField('biggestChallenge', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">What is working well right now?</label>
                  <textarea 
                    className="input-dark" 
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    value={form.workingWell} 
                    onChange={e => updateField('workingWell', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">What is NOT working well?</label>
                  <textarea 
                    className="input-dark" 
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    value={form.notWorking} 
                    onChange={e => updateField('notWorking', e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={fetchData} 
                className="btn-ghost"
              >
                <RefreshCcw size={14} />
                Discard Changes
              </button>
              <button 
                type="submit" 
                className="btn-primary"
              >
                <Save size={14} />
                Save Profile Configuration
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            key="ai-tab" 
            initial={{ opacity: 0, x: 10 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col gap-6"
          >
            {/* AI Command Box card */}
            <div className="kpi-card flex flex-col gap-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-400 animate-pulse" />
                Natural Language Profile Updater
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Just state the updates you want to make in plain English. The AI agent will parse your sentence, identify the numbers/channels to change, update your database record, and automatically recalculate your Growth DNA scores.
              </p>
              
              <div className="mt-2 flex flex-col gap-3">
                <textarea 
                  className="input-dark"
                  placeholder="e.g. 'We increased our monthly revenue to 15L and our conversion rate is now 3.2%. Also, our CAC dropped to 4500.'"
                  style={{ minHeight: '120px', resize: 'vertical', fontSize: '14px' }}
                  value={aiMessage}
                  onChange={e => setAiMessage(e.target.value)}
                  disabled={aiLoading}
                />
                <button 
                  onClick={handleAiUpdate}
                  disabled={aiLoading || !aiMessage.trim()}
                  className="btn-primary flex items-center gap-2 align-self-end"
                  style={{ alignSelf: 'flex-end', minWidth: '180px' }}
                >
                  {aiLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Apply AI Update
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Suggested/Applied Updates Log */}
            {aiUpdates && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="kpi-card flex flex-col gap-4"
                style={{ border: '1px solid rgba(16, 185, 129, 0.25)', background: 'rgba(16, 185, 129, 0.02)' }}
              >
                <h4 className="font-bold text-sm text-green-400 flex items-center gap-1.5 uppercase">
                  <Terminal size={14} />
                  AI Agent Delta Log (Fields Modified)
                </h4>
                <div className="flex flex-col gap-2.5">
                  {Object.entries(aiUpdates).map(([field, val]: [string, any]) => (
                    <div key={field} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 text-xs">
                      <span className="font-mono text-indigo-300">{field}</span>
                      <span className="font-semibold text-white">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/20 text-xs text-gray-300 flex items-center gap-2">
                  <Activity size={12} className="text-indigo-400" />
                  Growth DNA and SWOT analytics cache rebuilt automatically.
                </div>
              </motion.div>
            )}

            {/* Example Statements */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Update Financials', desc: "We raised our monthly revenue to 18 Lakhs but our monthly expenses increased to 8L" },
                { title: 'Optimize Marketing', desc: "Our conversion rate improved to 4.5% and our CAC decreased to 5200" },
                { title: 'Add Competitors & Goals', desc: "Add Zoho and ActiveCampaign to our competitors and set a goal to raise funding" },
                { title: 'Operational Status', desc: "Our cash runway has extended to 8 months and our top sales channel is now Cold Outbound Email" },
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setAiMessage(ex.desc)}
                  className="text-left p-4 glass hover:border-indigo-500 transition-all flex flex-col gap-1.5"
                  style={{ background: 'rgba(13, 20, 38, 0.45)', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                    <ArrowRight size={10} />
                    {ex.title}
                  </span>
                  <span className="text-xs text-gray-400 leading-normal font-medium">{ex.desc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

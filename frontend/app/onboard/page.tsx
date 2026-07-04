'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { businessAPI } from '@/lib/api';
import { useStore } from '@/lib/store';
import { 
  Rocket, 
  Building, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Award, 
  FolderOpen, 
  AlertTriangle, 
  Check,
  ArrowRight
} from 'lucide-react';

const INDUSTRIES = ['D2C / E-commerce', 'B2B SaaS', 'Retail', 'Service', 'Manufacturing', 'Marketplace', 'Healthcare', 'Fintech', 'EdTech', 'Other'];
const CHANNELS = ['Instagram', 'LinkedIn', 'Google Ads', 'Email', 'WhatsApp', 'SEO', 'Facebook', 'Events', 'Referral'];

const steps = [
  { title: 'Company Basics', subtitle: 'Tell us about your business', icon: Building },
  { title: 'Financial Snapshot', subtitle: 'Your current numbers', icon: DollarSign },
  { title: 'Customers & Sales', subtitle: 'Pipeline and conversion', icon: TrendingUp },
  { title: 'Marketing', subtitle: 'Channels and budget', icon: Target },
  { title: 'Goals & Competitors', subtitle: 'Where you want to go', icon: Award },
];

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{children}</label>
);

export default function OnboardPage() {
  const router = useRouter();
  const { setBusinessId, setBusinessName, setIndustry } = useStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingBusinesses, setExistingBusinesses] = useState<any[]>([]);
  const [form, setForm] = useState({
    companyName: '', industry: '', foundedYear: '', employees: '1-10', stage: 'startup',
    monthlyRevenue: '', monthlyExpenses: '', revenueGrowth: '', topRevenueSource: '', cashRunway: '',
    targetCustomer: 'B2C', avgDealSize: '', monthlyLeads: '', conversionRate: '', churnRate: '', topSalesChannel: '',
    marketingBudget: '', activeChannels: [] as string[], cac: '', campaignRunning: false,
    goals: ['', '', ''], biggestChallenge: '', topCompetitors: ['', ''], workingWell: '', notWorking: '',
  });

  useEffect(() => {
    businessAPI.list()
      .then(r => setExistingBusinesses(r.data.businesses || []))
      .catch(err => console.error("Error loading existing businesses:", err));
  }, []);

  const update = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));
  
  const toggleChannel = (ch: string) => {
    const chs = form.activeChannels.includes(ch)
      ? form.activeChannels.filter(c => c !== ch)
      : [...form.activeChannels, ch];
    update('activeChannels', chs);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        monthlyRevenue: Number(form.monthlyRevenue),
        monthlyExpenses: Number(form.monthlyExpenses),
        revenueGrowth: Number(form.revenueGrowth),
        cashRunway: Number(form.cashRunway),
        avgDealSize: Number(form.avgDealSize),
        monthlyLeads: Number(form.monthlyLeads),
        conversionRate: Number(form.conversionRate),
        churnRate: Number(form.churnRate),
        marketingBudget: Number(form.marketingBudget),
        cac: Number(form.cac),
        foundedYear: Number(form.foundedYear),
        goals: form.goals.filter(g => g.trim()),
        topCompetitors: form.topCompetitors.filter(c => c.trim()),
        userId: 'demo-user',
      };
      const res = await businessAPI.onboard(payload);
      setBusinessId(res.data.business._id);
      setBusinessName(form.companyName);
      setIndustry(form.industry);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Something went wrong. Check your API connection.');
    } finally {
      setLoading(false);
    }
  };

  const ActiveStepIcon = steps[step].icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'rgba(7, 11, 25, 0.3)' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Rocket size={20} className="text-indigo-400" />
          <span className="font-bold text-xl text-white">GrowthOS AI</span>
        </div>
        <h1 className="text-3xl font-black text-white">Onboard Your Business</h1>
        <p className="text-gray-400 text-sm mt-1">Provide your business context. Your AI executive boardroom starts here.</p>
      </div>

      {/* Select Existing Business Option */}
      {existingBusinesses.length > 0 && (
        <div className="w-full max-w-2xl glass p-4 mb-6 neon-border flex items-center justify-between" style={{ background: 'rgba(13, 20, 38, 0.5)' }}>
          <span className="text-sm text-indigo-300 font-bold flex items-center gap-2.5">
            <FolderOpen size={16} />
            Load Existing Company:
          </span>
          <select 
            className="select-dark" 
            style={{ width: 'auto', minWidth: '220px', padding: '8px 12px' }}
            onChange={(e) => {
              const selected = existingBusinesses.find(b => b._id === e.target.value);
              if (selected) {
                setBusinessId(selected._id);
                setBusinessName(selected.companyName);
                setIndustry(selected.industry);
                router.push('/dashboard');
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>Select a profile...</option>
            {existingBusinesses.map((b: any) => (
              <option key={b._id} value={b._id}>{b.companyName} ({b.industry})</option>
            ))}
          </select>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex items-center gap-3 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-8 h-8 flex items-center justify-center text-sm font-bold transition-all`}
              style={{
                borderRadius: '50%',
                background: i < step ? 'var(--success)' : i === step ? 'var(--primary)' : 'rgba(31, 41, 55, 0.6)',
                color: '#ffffff',
                border: i === step ? '2px solid rgba(255,255,255,0.1)' : 'none',
                boxShadow: i === step ? '0 0 15px rgba(99, 102, 241, 0.35)' : 'none'
              }}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: '32px',
                height: '2px',
                background: i < step ? 'var(--success)' : 'rgba(31, 41, 55, 0.6)'
              }}></div>
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="w-full max-w-2xl glass p-8 neon-border" style={{ background: 'rgba(13, 20, 38, 0.75)' }}>
        <div className="mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="text-indigo-400">
              <ActiveStepIcon size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{steps[step].title}</h2>
              <p className="text-gray-400 text-sm mt-1">{steps[step].subtitle}</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={step} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Company Basics */}
            {step === 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Company Name *</Label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="e.g. Acme Tech Solutions"
                    value={form.companyName}
                    onChange={e => update('companyName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Industry *</Label>
                  <select 
                    className="select-dark" 
                    value={form.industry} 
                    onChange={e => update('industry', e.target.value)}
                  >
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Founded Year</Label>
                  <input
                    type="number"
                    className="input-dark"
                    placeholder="e.g. 2022"
                    value={form.foundedYear}
                    onChange={e => update('foundedYear', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Team Size</Label>
                  <select 
                    className="select-dark" 
                    value={form.employees} 
                    onChange={e => update('employees', e.target.value)}
                  >
                    {['1-10', '11-50', '51-200', '200+'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Company Stage</Label>
                  <select 
                    className="select-dark" 
                    value={form.stage} 
                    onChange={e => update('stage', e.target.value)}
                  >
                    {['startup', 'growth', 'mature'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Financial Snapshot */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Revenue (₹)</Label>
                  <input
                    type="number"
                    className="input-dark"
                    placeholder="e.g. 500000"
                    value={form.monthlyRevenue}
                    onChange={e => update('monthlyRevenue', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Monthly Expenses (₹)</Label>
                  <input
                    type="number"
                    className="input-dark"
                    placeholder="e.g. 350000"
                    value={form.monthlyExpenses}
                    onChange={e => update('monthlyExpenses', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Revenue Growth (last 3M %)</Label>
                  <input
                    type="number"
                    className="input-dark"
                    placeholder="e.g. 15"
                    value={form.revenueGrowth}
                    onChange={e => update('revenueGrowth', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Cash Runway (months)</Label>
                  <input
                    type="number"
                    className="input-dark"
                    placeholder="e.g. 6"
                    value={form.cashRunway}
                    onChange={e => update('cashRunway', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Top Revenue Source</Label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="e.g. SaaS Subscriptions, Direct sales"
                    value={form.topRevenueSource}
                    onChange={e => update('topRevenueSource', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Customers & Sales */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Customer</Label>
                  <select 
                    className="select-dark" 
                    value={form.targetCustomer} 
                    onChange={e => update('targetCustomer', e.target.value)}
                  >
                    {['B2B', 'B2C', 'Both'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Avg Deal Size (₹)</Label>
                  <input
                    type="number"
                    className="input-dark"
                    placeholder="e.g. 25000"
                    value={form.avgDealSize}
                    onChange={e => update('avgDealSize', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Monthly Leads</Label>
                  <input
                    type="number"
                    className="input-dark"
                    placeholder="e.g. 80"
                    value={form.monthlyLeads}
                    onChange={e => update('monthlyLeads', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Conversion Rate (%)</Label>
                  <input
                    type="number"
                    className="input-dark"
                    placeholder="e.g. 3.2"
                    value={form.conversionRate}
                    onChange={e => update('conversionRate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Churn Rate (%)</Label>
                  <input
                    type="number"
                    className="input-dark"
                    placeholder="e.g. 5"
                    value={form.churnRate}
                    onChange={e => update('churnRate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Top Sales Channel</Label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="e.g. Direct sales, WhatsApp"
                    value={form.topSalesChannel}
                    onChange={e => update('topSalesChannel', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Marketing */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Marketing Budget (₹/month)</Label>
                    <input
                      type="number"
                      className="input-dark"
                      placeholder="e.g. 50000"
                      value={form.monthlyRevenue}
                      onChange={e => update('marketingBudget', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Avg CAC (₹)</Label>
                    <input
                      type="number"
                      className="input-dark"
                      placeholder="e.g. 2500"
                      value={form.cac}
                      onChange={e => update('cac', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Active Marketing Channels</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CHANNELS.map(ch => {
                      const active = form.activeChannels.includes(ch);
                      return (
                        <button 
                          key={ch} 
                          type="button"
                          onClick={() => toggleChannel(ch)}
                          className="btn-ghost"
                          style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            background: active ? 'var(--primary)' : 'rgba(31, 41, 55, 0.4)',
                            color: active ? '#ffffff' : 'var(--text-secondary)',
                            borderColor: active ? 'var(--primary)' : 'var(--border)'
                          }}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={form.campaignRunning} 
                      onChange={e => update('campaignRunning', e.target.checked)} 
                    />
                    <div className="checkbox-custom"></div>
                    <span className="text-sm text-gray-300">Currently running active campaigns?</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 5: Goals & Competitors */}
            {step === 4 && (
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Top 3 Business Goals</Label>
                  {form.goals.map((g, i) => (
                    <input 
                      key={i} 
                      className="input-dark mb-2" 
                      placeholder={`Goal ${i + 1} — e.g. Reach ₹10L MRR by Q3`}
                      value={g} 
                      onChange={e => { 
                        const g2 = [...form.goals]; 
                        g2[i] = e.target.value; 
                        update('goals', g2); 
                      }} 
                    />
                  ))}
                </div>
                <div>
                  <Label>Biggest Challenge</Label>
                  <input 
                    type="text"
                    className="input-dark" 
                    placeholder="e.g. Customer Acquisition Cost is too high" 
                    value={form.biggestChallenge} 
                    onChange={e => update('biggestChallenge', e.target.value)} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {form.topCompetitors.map((c, i) => (
                    <div key={i}>
                      <Label>Competitor {i + 1}</Label>
                      <input 
                        type="text"
                        className="input-dark" 
                        placeholder={`Competitor ${i + 1} Name`}
                        value={c} 
                        onChange={e => { 
                          const c2 = [...form.topCompetitors]; 
                          c2[i] = e.target.value; 
                          update('topCompetitors', c2); 
                        }} 
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <Label>What's working well?</Label>
                  <input 
                    type="text"
                    className="input-dark" 
                    placeholder="e.g. Direct outbound sales, LinkedIn content" 
                    value={form.workingWell} 
                    onChange={e => update('workingWell', e.target.value)} 
                  />
                </div>
                <div>
                  <Label>What's not working?</Label>
                  <input 
                    type="text"
                    className="input-dark" 
                    placeholder="e.g. Meta Ads campaigns are unprofitable" 
                    value={form.notWorking} 
                    onChange={e => update('notWorking', e.target.value)} 
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5' }}>
            <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <button 
            onClick={() => setStep(s => s - 1)} 
            disabled={step === 0} 
            className="btn-ghost" 
            style={{ opacity: step === 0 ? 0.3 : 1 }}
          >
            ← Back
          </button>
          
          {step < steps.length - 1 ? (
            <button 
              onClick={() => setStep(s => s + 1)} 
              disabled={step === 0 && !form.companyName} 
              className="btn-primary"
            >
              Next Step <ArrowRight size={14} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="btn-primary"
              style={{ paddingLeft: '32px', paddingRight: '32px' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> 
                  Generating DNA...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Launch My AI Team <Rocket size={16} />
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

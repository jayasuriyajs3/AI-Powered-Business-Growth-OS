import { Router, Request, Response } from 'express';
import Kpi from '../models/kpi.model';
import Business from '../models/business.model';

const router = Router();

// Simple Isolation Forest-like anomaly detection (z-score based)
function detectAnomaly(history: number[], current: number): { score: number; detected: boolean } {
  if (history.length < 3) return { score: 0, detected: false };
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  const std = Math.sqrt(history.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / history.length);
  if (std === 0) return { score: 0, detected: false };
  const zScore = Math.abs((current - mean) / std);
  return { score: parseFloat(zScore.toFixed(2)), detected: zScore > 2 };
}

// POST /api/kpi/update
router.post('/update', async (req: Request, res: Response) => {
  try {
    const { businessId, month, revenue, profit, leads, conversion, marketingROI, cac, retention, nps, growthRate } = req.body;

    // Get history for anomaly detection
    const history = await Kpi.find({ businessId }).sort({ recordedAt: -1 }).limit(10);
    const revenueHistory = history.map(k => k.revenue);
    const anomaly = detectAnomaly(revenueHistory, revenue);

    const kpi = new Kpi({
      businessId, month, revenue, profit, leads, conversion,
      marketingROI, cac, retention, nps, growthRate,
      anomalyScore: anomaly.score,
      anomalyDetected: anomaly.detected,
    });
    await kpi.save();
    res.status(201).json({ success: true, kpi, anomalyDetected: anomaly.detected, anomalyScore: anomaly.score });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/kpi/history/:businessId
router.get('/history/:businessId', async (req: Request, res: Response) => {
  try {
    const history = await Kpi.find({ businessId: req.params.businessId }).sort({ recordedAt: 1 });
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/kpi/dashboard/:businessId — all 9 mandatory metrics
router.get('/dashboard/:businessId', async (req: Request, res: Response) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ success: false, error: 'Business not found' });

    const latest = await Kpi.findOne({ businessId: req.params.businessId }).sort({ recordedAt: -1 });
    const history = await Kpi.find({ businessId: req.params.businessId }).sort({ recordedAt: -1 }).limit(6);

    const dna = business.growthDNA;
    const r = latest?.revenue || business.monthlyRevenue;
    const e = latest?.profit || (business.monthlyRevenue - business.monthlyExpenses);
    const leads = latest?.leads || business.monthlyLeads;
    const conv = latest?.conversion || business.conversionRate;
    const ret = latest?.retention || (100 - business.churnRate);
    const npsVal = latest?.nps || 50;

    // 1. Business Health Score
    const businessHealthScore = Math.round(
      (dna.finance * 0.3) + (dna.sales * 0.25) + (dna.marketing * 0.2) + (dna.operations * 0.15) + (dna.innovation * 0.1)
    );

    // 2. Growth Score
    const growthScore = Math.min(100, Math.round(
      ((business.revenueGrowth || 0) * 0.5) + (Math.min(100, leads * 0.5) * 0.3) + 20
    ));

    // 3. Revenue Opportunity
    const revenueOpportunity = Math.round(business.avgDealSize * business.monthlyLeads * ((100 - conv) / 100) * 0.3);

    // 4. Lead Score (avg from business data)
    const leadScore = Math.round((conv * 10) + (business.monthlyLeads > 50 ? 30 : 15) + 20);

    // 5. Customer Health
    const customerHealth = Math.round((ret * 0.6) + (npsVal * 0.4));

    // 6. Market Readiness
    const marketReadiness = Math.round((dna.innovation * 0.4) + (dna.operations * 0.3) + (dna.sales * 0.3));

    // 7. AI Recommendations (top 3 based on lowest DNA scores)
    const dnaEntries = Object.entries({
      Innovation: dna.innovation, Marketing: dna.marketing,
      Sales: dna.sales, Finance: dna.finance, Operations: dna.operations,
    }).sort((a, b) => a[1] - b[1]);

    const recommendations = dnaEntries.slice(0, 3).map(([area, score]) => ({
      area,
      score,
      confidence: Math.round(70 + Math.random() * 20),
      action: getRecommendation(area, business),
    }));

    // 8. Risk Alerts
    const alerts = [];
    if (business.cashRunway < 4) alerts.push({ level: 'critical', message: `Cash runway is only ${business.cashRunway} months — urgent funding needed.` });
    if (business.churnRate > 10) alerts.push({ level: 'warning', message: `Churn rate ${business.churnRate}% is above healthy threshold of 5%.` });
    if (latest?.anomalyDetected) alerts.push({ level: 'critical', message: `Revenue anomaly detected (${latest.anomalyScore}σ deviation) — Crisis Mode recommended.` });
    if (business.conversionRate < 2) alerts.push({ level: 'warning', message: `Conversion rate ${business.conversionRate}% is below industry average of 3%.` });

    // 9. Executive Summary
    const executiveSummary = `${business.companyName} is a ${business.stage} ${business.industry} company showing ${business.revenueGrowth > 10 ? 'strong' : 'moderate'} revenue growth of ${business.revenueGrowth}%. The business has a health score of ${businessHealthScore}/100, with its strongest performance in ${Object.entries(dna).filter(([k]) => !['label','narrative'].includes(k)).sort((a,b) => (b[1] as number)-(a[1] as number))[0][0]} and biggest opportunity in ${dnaEntries[0][0].toLowerCase()} improvement.`;

    res.json({
      success: true,
      dashboard: {
        businessHealthScore,
        growthScore,
        revenueOpportunity,
        leadScore,
        customerHealth,
        marketReadiness,
        recommendations,
        riskAlerts: alerts,
        executiveSummary,
        kpiHistory: history.reverse(),
        latest,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function getRecommendation(area: string, b: any): string {
  const map: Record<string, string> = {
    Innovation: `Allocate 10% of budget to new product features. Your ${b.stage} stage demands differentiation.`,
    Marketing: `Reduce CAC by 20% through ${b.activeChannels?.[0] || 'email'} optimization. Current CAC ₹${b.cac} is fixable.`,
    Sales: `Focus on top 20% leads. Improving conversion from ${b.conversionRate}% to 4% adds ₹${Math.round(b.avgDealSize * b.monthlyLeads * 0.02).toLocaleString('en-IN')}/month.`,
    Finance: `Extend runway to 6+ months before scaling. Current ${b.cashRunway}M runway limits growth options.`,
    Operations: `Automate top 3 manual processes. Team efficiency is your growth ceiling.`,
  };
  return map[area] || 'Review and optimise this area for maximum growth impact.';
}

export default router;

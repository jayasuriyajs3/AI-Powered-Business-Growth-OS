import { Router, Request, Response } from 'express';
import Business from '../models/business.model';
import { buildContext, geminiChat } from '../services/gemini.service';

const router = Router();

// POST /api/strategy/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.body;
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ success: false, error: 'Business not found' });

    const ctx = buildContext(business);
    const prompt = `You are the Strategy Agent for ${business.companyName}. Generate a detailed growth strategy.

BUSINESS CONTEXT:
${ctx}

Respond in this exact JSON format:
{
  "plan30": [
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"}
  ],
  "plan90": [
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"}
  ],
  "plan180": [
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"},
    {"action": "string", "owner": "string", "outcome": "string", "risk": "Low|Medium|High", "investment": "string"}
  ],
  "scores": {
    "revenueImpact": <60-95>,
    "risk": <10-50>,
    "difficulty": <30-70>,
    "investment": <20-60>,
    "expectedROI": <70-95>,
    "confidence": <70-90>,
    "overall": <65-90>
  }
}`;

    const raw = await geminiChat('', prompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const strategy = JSON.parse(cleaned);
    res.json({ success: true, strategy });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/strategy/whatif
router.post('/whatif', async (req: Request, res: Response) => {
  try {
    const { businessId, changes } = req.body;
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ success: false, error: 'Not found' });

    const base = {
      revenue: business.monthlyRevenue,
      leads: business.monthlyLeads,
      cac: business.cac,
      profit: business.monthlyRevenue - business.monthlyExpenses,
    };

    // Formula-based simulation
    const mktChange = (changes.marketingBudget || 0) / 100;
    const pricingChange = (changes.pricing || 0) / 100;
    const discountChange = (changes.discount || 0) / 100;

    const projectedLeads = Math.round(base.leads * (1 + mktChange * 1.5));
    const projectedRevenue = Math.round(base.revenue * (1 + mktChange * 0.8 + pricingChange * 0.6 - discountChange * 0.4));
    const projectedCAC = Math.round(base.cac * (1 + mktChange * 0.3));
    const projectedProfit = Math.round(base.profit * (1 + mktChange * 0.5 + pricingChange * 0.8 - discountChange * 0.6));
    const riskLevel = Math.abs(mktChange) > 0.3 ? 'HIGH' : Math.abs(mktChange) > 0.15 ? 'MEDIUM' : 'LOW';
    const roi = projectedRevenue > 0 ? parseFloat(((projectedRevenue - base.revenue) / (business.marketingBudget * Math.abs(mktChange) + 1)).toFixed(1)) : 0;

    const ctx = buildContext(business);
    const verdict = await geminiChat('', `As a business strategist, give a 2-sentence verdict on these simulation results for ${business.companyName}.
Changes applied: ${JSON.stringify(changes)}
Projected: Revenue ₹${projectedRevenue.toLocaleString('en-IN')}, Leads ${projectedLeads}, CAC ₹${projectedCAC.toLocaleString('en-IN')}, Profit ₹${projectedProfit.toLocaleString('en-IN')}, Risk: ${riskLevel}
${ctx}
Be concise, specific, and actionable.`);

    res.json({
      success: true,
      base,
      projected: { revenue: projectedRevenue, leads: projectedLeads, cac: projectedCAC, profit: projectedProfit, riskLevel, roi },
      verdict,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

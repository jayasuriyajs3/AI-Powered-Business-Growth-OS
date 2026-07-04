import { Router, Request, Response } from 'express';
import Business from '../models/business.model';
import { buildContext, geminiChat } from '../services/gemini.service';

const router = Router();

// POST /api/content/campaign
router.post('/campaign', async (req: Request, res: Response) => {
  try {
    const { businessId, type = 'email' } = req.body;
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ success: false, error: 'Not found' });

    const ctx = buildContext(business);
    const prompt = `You are the Marketing Agent for ${business.companyName}. Generate a ${type} campaign.

BUSINESS CONTEXT:
${ctx}

Respond in JSON:
{
  "type": "${type}",
  "headline": "string",
  "subheadline": "string",
  "body": "string",
  "cta": "string",
  "targetAudience": "string",
  "budget": "string",
  "expectedReach": "string",
  "hashtags": ["string", "string", "string"]
}`;

    const raw = await geminiChat('', prompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const campaign = JSON.parse(cleaned);
    res.json({ success: true, campaign });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/content/opportunity-radar
router.post('/opportunity-radar', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.body;
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ success: false, error: 'Not found' });

    const ctx = buildContext(business);
    const prompt = `You are the Innovation Agent for ${business.companyName}. Identify 5 key opportunities.

BUSINESS CONTEXT:
${ctx}

Respond in JSON:
{
  "opportunities": [
    {"category": "Untapped Segment|Seasonal Demand|Competitor Weakness|New Revenue|Geographic", "emoji": "🎯", "title": "string", "insight": "string", "urgency": "High|Medium|Low", "potentialRevenue": "string"},
    {"category": "...", "emoji": "📅", "title": "string", "insight": "string", "urgency": "High|Medium|Low", "potentialRevenue": "string"},
    {"category": "...", "emoji": "🏴", "title": "string", "insight": "string", "urgency": "High|Medium|Low", "potentialRevenue": "string"},
    {"category": "...", "emoji": "🚀", "title": "string", "insight": "string", "urgency": "High|Medium|Low", "potentialRevenue": "string"},
    {"category": "...", "emoji": "📍", "title": "string", "insight": "string", "urgency": "High|Medium|Low", "potentialRevenue": "string"}
  ]
}`;

    const raw = await geminiChat('', prompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const radar = JSON.parse(cleaned);
    res.json({ success: true, ...radar });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import Business from '../models/business.model';
import Session from '../models/session.model';
import { buildContext, geminiChat } from '../services/gemini.service';

const router = Router();

// POST /api/copilot/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { businessId, message } = req.body;
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ success: false, error: 'Business not found' });

    const ctx = buildContext(business);
    const lastSession = await Session.findOne({ businessId }).sort({ createdAt: -1 });
    const sessionSummary = lastSession ? `\nLast boardroom decision: ${lastSession.finalDecision}` : '';

    const prompt = `You are the GrowthOS AI Copilot — an expert business advisor for ${business.companyName}. 
You have full knowledge of this business. Answer the user's question with specific, actionable insights using their real data.
Be concise (3-5 sentences max), data-specific, and always end with one clear recommendation.

BUSINESS CONTEXT:
${ctx}
${sessionSummary}

USER QUESTION: ${message}`;

    const reply = await geminiChat('', prompt);
    res.json({ success: true, reply });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/copilot/morning-brief/:businessId
router.get('/morning-brief/:businessId', async (req: Request, res: Response) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ success: false, error: 'Not found' });

    // Check if we have a cached morning brief generated *today*
    if (business.morningBrief && business.morningBriefUpdatedAt) {
      const lastUpdated = new Date(business.morningBriefUpdatedAt);
      const now = new Date();
      const isSameDay = 
        lastUpdated.getDate() === now.getDate() &&
        lastUpdated.getMonth() === now.getMonth() &&
        lastUpdated.getFullYear() === now.getFullYear();

      if (isSameDay) {
        res.json({ success: true, brief: business.morningBrief });
        return;
      }
    }

    const ctx = buildContext(business);
    const lastSession = await Session.findOne({ businessId: req.params.businessId }).sort({ createdAt: -1 });

    const prompt = `Generate an Executive Morning Brief for the CEO of ${business.companyName}.

BUSINESS CONTEXT:
${ctx}
${lastSession ? `Last boardroom decision: ${lastSession.finalDecision}` : ''}

Respond in this exact JSON format:
{
  "greeting": "Good Morning, [first word of company name or generic]",
  "date": "${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}",
  "pulse": {
    "revenue": {"value": "₹X", "change": "+X%", "positive": true/false},
    "leads": {"value": "X", "change": "+X", "positive": true/false},
    "risk": {"level": "Low|Medium|High", "count": X}
  },
  "alert": {"exists": true/false, "message": "string", "agent": "Finance|Sales|Marketing|Operations"},
  "priorities": [
    {"emoji": "📞", "task": "string", "why": "string"},
    {"emoji": "📧", "task": "string", "why": "string"},
    {"emoji": "🤝", "task": "string", "why": "string"}
  ],
  "wins": [
    {"emoji": "✅", "win": "string"},
    {"emoji": "✅", "win": "string"}
  ]
}`;

    const raw = await geminiChat('', prompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const brief = JSON.parse(cleaned);

    // Save/cache brief in database
    business.morningBrief = brief;
    business.morningBriefUpdatedAt = new Date();
    await business.save();

    res.json({ success: true, brief });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

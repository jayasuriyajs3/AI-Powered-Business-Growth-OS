import { Router, Request, Response } from 'express';
import Business from '../models/business.model';
import { computeGrowthDNA } from '../services/growth-dna.service';
import { geminiChat, buildContext } from '../services/gemini.service';

const router = Router();

// POST /api/business/onboard
router.post('/onboard', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const growthDNA = computeGrowthDNA(data);
    const business = new Business({ ...data, growthDNA });
    await business.save();
    res.status(201).json({ success: true, business });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/business/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ success: false, error: 'Business not found' });
    res.json({ success: true, business });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/business/:id/growth-dna
router.get('/:id/growth-dna', async (req: Request, res: Response) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ success: false, error: 'Business not found' });
    res.json({ success: true, growthDNA: business.growthDNA });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/business/:id/analysis
router.get('/:id/analysis', async (req: Request, res: Response) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ success: false, error: 'Business not found' });

    // Return cached analysis if present
    if (business.analysis && business.analysis.strengths && business.analysis.strengths.length > 0) {
      res.json({ success: true, analysis: business.analysis });
      return;
    }

    const ctx = buildContext(business);
    const prompt = `You are a senior business strategist. Analyse this business and provide a structured SWOT analysis and key insight.

BUSINESS CONTEXT:
${ctx}

Respond in this exact JSON format:
{
  "strengths": ["point1", "point2", "point3"],
  "weaknesses": ["point1", "point2", "point3"],
  "opportunities": ["point1", "point2", "point3"],
  "threats": ["point1", "point2", "point3"],
  "keyInsight": "One powerful paragraph insight",
  "immediatePriority": "One specific action to take this week"
}`;

    const raw = await geminiChat('', prompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(cleaned);

    // Persist analysis in database
    business.analysis = analysis;
    await business.save();

    res.json({ success: true, analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/business/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    // Clear analysis cache when core operational data updates so it regenerates fresh
    if (data.companyName || data.industry || data.monthlyRevenue || data.conversionRate || data.churnRate || data.goals) {
      data.analysis = null;
      data.morningBrief = null;
      data.morningBriefUpdatedAt = null;
    }
    const updated = await Business.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Business not found' });
    res.json({ success: true, business: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/business/:id/update-agentic — AI updates via freeform message commands
router.post('/:id/update-agentic', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ success: false, error: 'Business not found' });

    const prompt = `You are a data extraction assistant. The user wants to update their company profile based on this message: "${message}".
Here is the current business profile data:
${JSON.stringify(business)}

Your task is to identify which fields from the profile need to be updated and output ONLY the updated fields in a flat JSON structure.
Supported fields and their data types:
- companyName (string)
- industry (string)
- stage (enum: 'startup', 'growth', 'mature')
- monthlyRevenue (number)
- monthlyExpenses (number)
- revenueGrowth (number)
- topRevenueSource (string)
- cashRunway (number)
- targetCustomer (enum: 'B2B', 'B2C', 'Both')
- avgDealSize (number)
- monthlyLeads (number)
- conversionRate (number)
- churnRate (number)
- topSalesChannel (string)
- marketingBudget (number)
- cac (number)
- goals (array of strings)
- biggestChallenge (string)
- topCompetitors (array of strings)
- workingWell (string)
- notWorking (string)

Crucial rules:
1. Convert human shorthand values like "15L" or "15 Lakhs" or "1.5 million" to actual raw numbers (e.g. 1500000).
2. Clean up percentages to raw numbers (e.g. "3.2%" becomes 3.2).
3. If a field was not mentioned in the message, do NOT include it in your output.
4. Output ONLY a valid JSON object. Do not include markdown backticks.

Example output:
{
  "monthlyRevenue": 1500000,
  "conversionRate": 3.2
}`;

    const raw = await geminiChat('', prompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const updates = JSON.parse(cleaned);

    if (Object.keys(updates).length === 0) {
      return res.json({ success: true, updatedFields: {}, message: "No operational profile updates identified in your message." });
    }

    // Merge updates
    Object.assign(business, updates);

    // Recompute Growth DNA based on updated profile metrics
    business.growthDNA = computeGrowthDNA(business);

    // Clear caches
    business.analysis = undefined;
    business.morningBrief = undefined;
    business.morningBriefUpdatedAt = undefined;

    await business.save();

    res.json({ success: true, updatedFields: updates, business });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/business — list all (for demo)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const businesses = await Business.find().select('companyName industry stage createdAt');
    res.json({ success: true, businesses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

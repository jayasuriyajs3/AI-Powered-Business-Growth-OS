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
    res.json({ success: true, analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/business/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Business not found' });
    res.json({ success: true, business: updated });
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

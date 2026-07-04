import { Router, Request, Response } from 'express';
import Business from '../models/business.model';
import Session from '../models/session.model';
import { runBoardroom } from '../services/boardroom.service';

const router = Router();

// POST /api/boardroom/start — SSE streaming endpoint
router.post('/start', async (req: Request, res: Response) => {
  const { businessId, sessionType = 'regular', topic = 'Business Strategy Review' } = req.body;

  try {
    const business = await Business.findById(businessId);
    if (!business) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sessionMessages: any[] = [];
    const sessionVotes: any[] = [];

    // Stream each agent response
    for await (const event of runBoardroom(business)) {
      if (event.isVote) {
        sessionVotes.push({
          agent: event.agent,
          vote: event.vote,
          confidence: event.confidence,
          reason: event.reason,
        });
        res.write(`data: ${JSON.stringify({ type: 'vote', ...event })}\n\n`);
      } else {
        sessionMessages.push({
          agent: event.agent,
          emoji: event.emoji,
          role: event.agent,
          message: event.message,
          timestamp: new Date(),
        });
        res.write(`data: ${JSON.stringify({ type: 'message', ...event })}\n\n`);
      }
    }

    // Compute final decision
    const yesVotes = sessionVotes.filter(v => v.vote === 'YES').length;
    const avgConf = Math.round(sessionVotes.reduce((s, v) => s + v.confidence, 0) / (sessionVotes.length || 1));
    const ceoMsg = sessionMessages.find(m => m.agent === 'CEO');
    const finalDecision = ceoMsg?.message || 'Strategy approved by the executive team.';

    // Save session to DB
    const session = new Session({
      businessId,
      sessionType,
      topic,
      messages: sessionMessages,
      votes: sessionVotes,
      finalDecision,
      strategyGenerated: false,
    });
    await session.save();

    // Send completion event
    res.write(`data: ${JSON.stringify({ type: 'done', sessionId: session._id, finalDecision, yesVotes, total: 8, avgConfidence: avgConf })}\n\n`);
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
  }
});

// GET /api/boardroom/sessions/:businessId
router.get('/sessions/:businessId', async (req: Request, res: Response) => {
  try {
    const sessions = await Session.find({ businessId: req.params.businessId }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, sessions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/boardroom/session/:id
router.get('/session/:id', async (req: Request, res: Response) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    res.json({ success: true, session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

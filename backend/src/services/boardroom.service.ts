import { buildContext, model } from './gemini.service';

export const AGENTS = [
  { name: 'Data Analyst', emoji: '📊', color: '#A855F7' },
  { name: 'Marketing',    emoji: '🎯', color: '#8B5CF6' },
  { name: 'Sales',        emoji: '📈', color: '#F97316' },
  { name: 'Finance',      emoji: '💰', color: '#10B981' },
  { name: 'Operations',   emoji: '⚙️',  color: '#64748B' },
  { name: 'Customer Success', emoji: '🤝', color: '#EC4899' },
  { name: 'Innovation',   emoji: '💡', color: '#3B82F6' },
  { name: 'Strategy',     emoji: '🗺️',  color: '#06B6D4' },
  { name: 'CEO',          emoji: '👔', color: '#F59E0B' },
];

const AGENT_PROMPTS: Record<string, (ctx: string, prev: string) => string> = {
  'Data Analyst': (ctx, _prev) => `
You are the Data Analyst Agent for this company. Analyse the key metrics and give a sharp 2-3 sentence data-driven insight.
Focus on: revenue trends, CAC vs LTV, conversion rate vs industry average, growth patterns.
Be specific with numbers. No fluff. Start directly with your insight.

BUSINESS CONTEXT:
${ctx}`,

  'Marketing': (ctx, prev) => `
You are the Marketing Agent. Based on the data analysis and business context, give your marketing recommendation in 2-3 sentences.
Focus on: channel performance, CAC reduction, campaign effectiveness, budget allocation.
Previous agent said: "${prev}"
Respond naturally as if in a boardroom. Start with your stance directly.

BUSINESS CONTEXT:
${ctx}`,

  'Sales': (ctx, prev) => `
You are the Sales Agent. Analyse the sales pipeline and give your recommendation in 2-3 sentences.
Focus on: lead quality, conversion improvements, upsell/cross-sell, pipeline health.
Previous agents discussed: "${prev}"
Be direct and number-focused. Start immediately with your point.

BUSINESS CONTEXT:
${ctx}`,

  'Finance': (ctx, prev) => `
You are the Finance Agent. You are conservative and data-driven. Assess the financial health and challenge risky proposals in 2-3 sentences.
Focus on: cash runway, profit margins, ROI of proposed actions, financial risk.
Previous discussion: "${prev}"
Be firm about financial constraints. Start directly.

BUSINESS CONTEXT:
${ctx}`,

  'Operations': (ctx, prev) => `
You are the Operations Agent. Assess execution feasibility and team capacity in 2-3 sentences.
Focus on: team bandwidth, process bottlenecks, execution risk, resource constraints.
Previous discussion: "${prev}"
Be practical. Start directly.

BUSINESS CONTEXT:
${ctx}`,

  'Customer Success': (ctx, prev) => `
You are the Customer Success Agent. Analyse retention and customer health in 2-3 sentences.
Focus on: churn risk, NPS trends, at-risk accounts, retention opportunities.
Previous discussion: "${prev}"
Be empathetic but data-backed. Start directly.

BUSINESS CONTEXT:
${ctx}`,

  'Innovation': (ctx, prev) => `
You are the Innovation Agent. Identify market opportunities and competitive threats in 2-3 sentences.
Focus on: competitor weaknesses, untapped segments, emerging trends, new revenue streams.
Previous discussion: "${prev}"
Be forward-thinking and bold. Start directly.

BUSINESS CONTEXT:
${ctx}`,

  'Strategy': (ctx, prev) => `
You are the Strategy Agent. Synthesise the discussion and recommend the 30-day priority in 2-3 sentences.
Focus on: strategic priorities, resource allocation, risk-adjusted growth path.
Previous discussion: "${prev}"
Be decisive and structured. Start directly.

BUSINESS CONTEXT:
${ctx}`,

  'CEO': (ctx, prev) => `
You are the CEO Agent — the final decision maker. Based on the full boardroom discussion, give your final decision in 3-4 sentences.
You must: acknowledge key concerns, make a clear decision, state 2-3 specific actions to take immediately.
Full discussion: "${prev}"
Start with "[FINAL DECISION]" and be authoritative.

BUSINESS CONTEXT:
${ctx}`,
};

export async function* runBoardroom(business: any): AsyncGenerator<{
  agent: string; emoji: string; color: string; message: string; isVote?: boolean; vote?: string; confidence?: number; reason?: string;
}> {
  const ctx = buildContext(business);
  let conversationHistory = '';
  const messages: { agent: string; message: string }[] = [];

  for (const agent of AGENTS) {
    const promptFn = AGENT_PROMPTS[agent.name];
    const prompt = promptFn(ctx, conversationHistory);

    try {
      const result = await model.generateContent(prompt);
      const message = result.response.text().trim();
      conversationHistory += `\n${agent.name}: ${message}`;
      messages.push({ agent: agent.name, message });

      yield { agent: agent.name, emoji: agent.emoji, color: agent.color, message };

      // Small delay between agents for streaming effect
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      const fallback = `Analysing ${business.companyName}'s data and aligning with strategic priorities.`;
      yield { agent: agent.name, emoji: agent.emoji, color: agent.color, message: fallback };
    }
  }

  // Generate votes from all agents except CEO
  for (const agent of AGENTS.slice(0, 8)) {
    const votePrompt = `
Based on this boardroom discussion about ${business.companyName}, as the ${agent.name} Agent, cast your vote.
Discussion: "${conversationHistory}"
Respond in JSON only: {"vote": "YES" or "NO", "confidence": <number 60-99>, "reason": "<one sentence reason>"}
`;
    try {
      const result = await model.generateContent(votePrompt);
      const text = result.response.text().trim().replace(/```json|```/g, '');
      const parsed = JSON.parse(text);
      yield {
        agent: agent.name,
        emoji: agent.emoji,
        color: agent.color,
        message: '',
        isVote: true,
        vote: parsed.vote,
        confidence: parsed.confidence,
        reason: parsed.reason,
      };
    } catch {
      yield {
        agent: agent.name, emoji: agent.emoji, color: agent.color,
        message: '', isVote: true, vote: 'YES', confidence: 75, reason: 'Aligned with strategic direction.',
      };
    }
    await new Promise(r => setTimeout(r, 200));
  }
}

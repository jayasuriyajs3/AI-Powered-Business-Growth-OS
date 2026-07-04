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
You are the Data Analyst Agent. Analyze the metrics and give a sharp, data-driven insight.
CRITICAL: Keep your response under 35 words (strictly 1-2 sentences). Do NOT use any Markdown formatting, bold stars (**), bullet lists, or asterisks (*). Start directly with your insight.

BUSINESS CONTEXT:
${ctx}`,

  'Marketing': (ctx, prev) => `
You are the Marketing Agent. Based on the preceding discussion, give your recommendation.
CRITICAL: Keep your response under 35 words (strictly 1-2 sentences). Do NOT use any Markdown formatting, bold stars (**), bullet lists, or asterisks (*). Start directly.
Previous agent discussed: "${prev}"

BUSINESS CONTEXT:
${ctx}`,

  'Sales': (ctx, prev) => `
You are the Sales Agent. Give your customer pipeline recommendation.
CRITICAL: Keep your response under 35 words (strictly 1-2 sentences). Do NOT use any Markdown formatting, bold stars (**), bullet lists, or asterisks (*). Start directly.
Previous discussion: "${prev}"

BUSINESS CONTEXT:
${ctx}`,

  'Finance': (ctx, prev) => `
You are the Finance Agent. Assess the financial health and challenge any risky spend proposals.
CRITICAL: Keep your response under 35 words (strictly 1-2 sentences). Do NOT use any Markdown formatting, bold stars (**), bullet lists, or asterisks (*). Start directly.
Previous discussion: "${prev}"

BUSINESS CONTEXT:
${ctx}`,

  'Operations': (ctx, prev) => `
You are the Operations Agent. Assess team feasibility and project execution limits.
CRITICAL: Keep your response under 35 words (strictly 1-2 sentences). Do NOT use any Markdown formatting, bold stars (**), bullet lists, or asterisks (*). Start directly.
Previous discussion: "${prev}"

BUSINESS CONTEXT:
${ctx}`,

  'Customer Success': (ctx, prev) => `
You are the Customer Success Agent. Focus on customer retention and churn.
CRITICAL: Keep your response under 35 words (strictly 1-2 sentences). Do NOT use any Markdown formatting, bold stars (**), bullet lists, or asterisks (*). Start directly.
Previous discussion: "${prev}"

BUSINESS CONTEXT:
${ctx}`,

  'Innovation': (ctx, prev) => `
You are the Innovation Agent. Focus on competitor gaps and differentiation.
CRITICAL: Keep your response under 35 words (strictly 1-2 sentences). Do NOT use any Markdown formatting, bold stars (**), bullet lists, or asterisks (*). Start directly.
Previous discussion: "${prev}"

BUSINESS CONTEXT:
${ctx}`,

  'Strategy': (ctx, prev) => `
You are the Strategy Agent. Synthesize the debate into a single priority focus.
CRITICAL: Keep your response under 35 words (strictly 1-2 sentences). Do NOT use any Markdown formatting, bold stars (**), bullet lists, or asterisks (*). Start directly.
Previous discussion: "${prev}"

BUSINESS CONTEXT:
${ctx}`,

  'CEO': (ctx, prev) => `
You are the CEO Agent. Make the final authoritative decision based on the debate.
CRITICAL: Give your final decision in exactly 2-3 sentences. Do NOT use any Markdown formatting, bold stars (**), bullet lists, or asterisks (*). Start directly with "[FINAL DECISION]".
Full discussion: "${prev}"

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
      let message = result.response.text().trim();
      
      // Clean up any remaining asterisks (*) or markdown bullet point dash (- ) prefixes
      message = message
        .replace(/\*/g, '')
        .replace(/^- /g, '')
        .replace(/^CEO Agent:\s*/i, '') // strip redundant prefixes if model repeats name
        .trim();

      conversationHistory += `\n${agent.name}: ${message}`;
      messages.push({ agent: agent.name, message });

      yield { agent: agent.name, emoji: agent.emoji, color: agent.color, message };

      // Small delay between agents for streaming effect
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      const fallback = `Analyzing ${business.companyName}'s data to align operations with strategy.`;
      yield { agent: agent.name, emoji: agent.emoji, color: agent.color, message: fallback };
    }
  }

  // Generate votes from all agents except CEO
  for (const agent of AGENTS.slice(0, 8)) {
    const votePrompt = `
Based on this boardroom discussion about ${business.companyName}, as the ${agent.name} Agent, cast your vote on the final CEO proposal.
Discussion: "${conversationHistory}"
Respond in JSON only (do NOT output markdown backticks): {"vote": "YES" or "NO", "confidence": <number 60-99>, "reason": "<one sentence reason under 15 words, no asterisks>"}
`;
    try {
      const result = await model.generateContent(votePrompt);
      let text = result.response.text().trim();
      text = text.replace(/```json|```/g, '').replace(/\*/g, '').trim();
      const parsed = JSON.parse(text);
      yield {
        agent: agent.name,
        emoji: agent.emoji,
        color: agent.color,
        message: '',
        isVote: true,
        vote: parsed.vote || 'YES',
        confidence: parsed.confidence || 80,
        reason: (parsed.reason || 'Aligned with strategic goals.').replace(/\*/g, ''),
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

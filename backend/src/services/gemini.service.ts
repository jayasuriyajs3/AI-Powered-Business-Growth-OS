import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  throw new Error('GROQ_API_KEY is not defined in the backend environment variables! Please configure it in your .env file.');
}
const groq = new Groq({ apiKey });

// Helper to call Groq with automatic model fallback on rate limits (429)
async function createChatCompletionWithFallback(options: any) {
  const models = [
    'llama-3.3-70b-versatile',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
    'llama-3.1-8b-instant'
  ];
  
  let lastError: any = null;
  for (const modelName of models) {
    try {
      console.log(`[LLM Fallback] Attempting generation with model: ${modelName}`);
      const completion = await groq.chat.completions.create({
        ...options,
        model: modelName
      });
      console.log(`[LLM Fallback] SUCCESS using model: ${modelName}`);
      return completion;
    } catch (err: any) {
      lastError = err;
      const isRateLimit = err.status === 429 || err.message?.includes('rate_limit') || err.message?.includes('Limit') || err.message?.includes('quota');
      const isModelError = err.status === 400 || err.status === 404;
      if (isRateLimit || isModelError) {
        console.warn(`[LLM Fallback] Model ${modelName} failed (status ${err.status}). Reason: ${err.message}. Retrying next fallback...`);
        continue;
      }
      // For critical errors (e.g. invalid credentials), fail immediately
      throw err;
    }
  }
  throw lastError;
}

// 100% Groq API Adapter (Llama 3.3 70B with fallback support) — Completely decoupled from Gemini
export const model = {
  async generateContent(prompt: string) {
    const isJson = prompt.toLowerCase().includes('json');
    const completion = await createChatCompletionWithFallback({
      messages: [{ role: 'user', content: prompt }],
      ...(isJson ? { response_format: { type: 'json_object' } } : {})
    });
    const text = completion.choices[0]?.message?.content || '';
    return {
      response: {
        text: () => text
      }
    };
  }
};

export function buildContext(b: any): string {
  return `
Company: ${b.companyName} | Industry: ${b.industry} | Stage: ${b.stage}
Employees: ${b.employees} | Founded: ${b.foundedYear}
Monthly Revenue: ₹${b.monthlyRevenue?.toLocaleString('en-IN')} | Expenses: ₹${b.monthlyExpenses?.toLocaleString('en-IN')}
Revenue Growth (3M): ${b.revenueGrowth}% | Cash Runway: ${b.cashRunway} months
Target Customer: ${b.targetCustomer} | Avg Deal Size: ₹${b.avgDealSize?.toLocaleString('en-IN')}
Monthly Leads: ${b.monthlyLeads} | Conversion Rate: ${b.conversionRate}% | Churn Rate: ${b.churnRate}%
Marketing Budget: ₹${b.marketingBudget?.toLocaleString('en-IN')}/month | CAC: ₹${b.cac?.toLocaleString('en-IN')}
Active Channels: ${b.activeChannels?.join(', ')}
Competitors: ${b.topCompetitors?.join(', ')}
Goals: ${b.goals?.join('; ')}
Biggest Challenge: ${b.biggestChallenge}
Working Well: ${b.workingWell}
Not Working: ${b.notWorking}
Growth DNA — Innovation: ${b.growthDNA?.innovation}, Marketing: ${b.growthDNA?.marketing}, Sales: ${b.growthDNA?.sales}, Finance: ${b.growthDNA?.finance}, Operations: ${b.growthDNA?.operations}
  `.trim();
}

export async function geminiChat(systemPrompt: string, userMessage: string): Promise<string> {
  const isJson = systemPrompt.toLowerCase().includes('json') || userMessage.toLowerCase().includes('json');
  const completion = await createChatCompletionWithFallback({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    ...(isJson ? { response_format: { type: 'json_object' } } : {})
  });
  return completion.choices[0]?.message?.content || '';
}

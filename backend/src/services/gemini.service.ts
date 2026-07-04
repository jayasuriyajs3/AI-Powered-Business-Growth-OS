import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) : null;

// API adapter to support both Groq (Llama 3.3 70B) and Gemini
export const model = {
  async generateContent(prompt: string) {
    if (groq) {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
      });
      const text = completion.choices[0]?.message?.content || '';
      return {
        response: {
          text: () => text
        }
      };
    }
    
    if (geminiModel) {
      return await geminiModel.generateContent(prompt);
    }
    
    throw new Error('No LLM Provider API Key found in .env (either GEMINI_API_KEY or GROQ_API_KEY must be provided)');
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
  if (groq) {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: 'llama-3.3-70b-versatile',
    });
    return completion.choices[0]?.message?.content || '';
  }

  if (geminiModel) {
    const result = await geminiModel.generateContent(`${systemPrompt}\n\n${userMessage}`);
    return result.response.text();
  }

  throw new Error('No LLM Provider API Key found in .env');
}

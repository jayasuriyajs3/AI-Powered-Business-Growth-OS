import { IBusiness } from '../models/business.model';

interface GrowthDNA {
  innovation: number;
  marketing: number;
  sales: number;
  finance: number;
  operations: number;
  label: string;
  narrative: string;
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function computeGrowthDNA(b: Partial<IBusiness>): GrowthDNA {
  const stageScore = b.stage === 'startup' ? 70 : b.stage === 'growth' ? 85 : 60;
  const channelCount = (b.activeChannels?.length || 0);
  const channelScore = Math.min(100, channelCount * 14);
  const cacEfficiency = b.cac && b.avgDealSize ? Math.min(100, (b.avgDealSize / b.cac) * 20) : 50;
  const budgetRatio = b.monthlyRevenue && b.marketingBudget
    ? Math.min(100, (b.marketingBudget / b.monthlyRevenue) * 200)
    : 40;
  const convScore = Math.min(100, (b.conversionRate || 0) * 15);
  const dealScore = Math.min(100, Math.log10((b.avgDealSize || 1) + 1) * 20);
  const leadScore = Math.min(100, (b.monthlyLeads || 0) * 2);
  const margin = b.monthlyRevenue && b.monthlyExpenses
    ? ((b.monthlyRevenue - b.monthlyExpenses) / b.monthlyRevenue) * 100
    : 30;
  const profitScore = Math.min(100, Math.max(0, margin * 2));
  const runwayScore = Math.min(100, (b.cashRunway || 0) * 8);
  const empScore = b.employees === '1-10' ? 60 : b.employees === '11-50' ? 75 : b.employees === '51-200' ? 85 : 90;

  const innovation = clamp((stageScore * 0.3) + ((b.revenueGrowth || 0) * 0.4) + (channelScore * 0.3));
  const marketing = clamp((budgetRatio * 0.4) + (channelScore * 0.3) + (cacEfficiency * 0.3));
  const sales = clamp((convScore * 0.4) + (dealScore * 0.3) + (leadScore * 0.3));
  const finance = clamp((profitScore * 0.4) + (runwayScore * 0.3) + ((b.revenueGrowth || 0) * 0.3));
  const operations = clamp((empScore * 0.5) + (channelScore * 0.5));

  // Determine label
  const scores = { Innovation: innovation, Marketing: marketing, Sales: sales, Finance: finance, Operations: operations };
  const lowest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
  const highest = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const label = `${highest[0]}-Led, ${lowest[0]}-Constrained Growth Engine`;

  const narrative = `Your company shows strong ${highest[0].toLowerCase()} capability (${highest[1]}/100) but is constrained by ${lowest[0].toLowerCase()} performance (${lowest[1]}/100). Addressing the ${lowest[0].toLowerCase()} gap could unlock significant growth potential in the next 90 days.`;

  return { innovation, marketing, sales, finance, operations, label, narrative };
}

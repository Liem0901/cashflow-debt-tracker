import { formatCurrency, getMonthName, shiftMonthKey } from '../utils/formatters';
import { getDashboardStats, getCategorySpending } from '../utils/calculations';
import { buildAIInsights } from '../utils/aiInsights';

function extractAmount(text) {
  const match = text.match(/(?:rm\s?)?(\d[\d,]*(?:\.\d{1,2})?)/i);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

function streamText(text, onChunk, onDone) {
  let index = 0;
  const interval = setInterval(() => {
    index += 2;
    onChunk(text.slice(0, index));
    if (index >= text.length) {
      clearInterval(interval);
      onDone();
    }
  }, 16);
  return () => clearInterval(interval);
}

export function generateFinancialResponse(question, data, monthKey) {
  const q = question.toLowerCase().trim();
  const stats = getDashboardStats(data, monthKey);
  const insights = buildAIInsights(data, monthKey);
  const prevMonth = shiftMonthKey(monthKey, -1);
  const prevSpending = getCategorySpending(data.transactions, prevMonth);
  const monthLabel = getMonthName(monthKey);

  if (/afford|can i buy|can i get/.test(q)) {
    const price = extractAmount(q) || 999;
    const ok = stats.safeBalance >= price;
    return {
      content: ok
        ? `Yes — you can afford **${formatCurrency(price)}** this month.\n\nYour safe-to-spend balance is **${formatCurrency(stats.safeBalance)}** after expenses and upcoming bills.\n\nYou'd still have **${formatCurrency(stats.safeBalance - price)}** left.`
        : `I'd hold off on **${formatCurrency(price)}** right now.\n\nYour safe-to-spend balance is **${formatCurrency(stats.safeBalance)}**, which is **${formatCurrency(price - stats.safeBalance)}** short.\n\nConsider waiting until after your next income or reducing discretionary spending.`,
      followUps: ['How can I save more?', 'Show my biggest expenses', 'What bills are coming up?'],
    };
  }

  if (/where did my money|spending this month|money go/.test(q)) {
    const lines = Object.entries(stats.categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, amt]) => `- **${cat}**: ${formatCurrency(amt)}`);
    return {
      content: `Here's where your money went in **${monthLabel}**:\n\n${lines.join('\n') || '- No expenses recorded yet.'}\n\n**Total spent:** ${formatCurrency(stats.totalExpenses)}`,
      followUps: ['Compare with last month', 'Help me save RM500', 'Create a budget'],
    };
  }

  if (/save|cut back|reduce spending/.test(q)) {
    const target = extractAmount(q) || 500;
    const cat = insights.topCategory;
    return {
      content: `To save around **${formatCurrency(target)}/month**, start with **${cat}** — your largest category at **${formatCurrency(insights.topCategoryAmount)}**.\n\n**Quick wins:**\n- Set a ${cat} budget 15–20% lower\n- Review subscriptions\n- Delay non-essential purchases until safe balance grows\n\nEstimated savings potential: **${formatCurrency(insights.potentialSavings)}/month**.`,
      followUps: ['Create a budget', 'Analyze my spending', 'Can I afford a vacation?'],
    };
  }

  if (/food|category|spent on/.test(q)) {
    const catMatch = q.match(/on (\w+)/);
    const category = catMatch?.[1]
      ? Object.keys(stats.categorySpending).find((c) =>
          c.toLowerCase().includes(catMatch[1])
        ) || insights.topCategory
      : insights.topCategory;
    const amount = stats.categorySpending[category] || 0;
    return {
      content: `You spent **${formatCurrency(amount)}** on **${category}** in ${monthLabel}.`,
      followUps: ['Where did my money go?', 'Compare with last month', 'Help me save money'],
    };
  }

  if (/compare|last month|vs/.test(q)) {
    const prevTotal = getDashboardStats(data, prevMonth).totalExpenses;
    const delta = prevTotal
      ? Math.round(((stats.totalExpenses - prevTotal) / prevTotal) * 100)
      : 0;
    return {
      content: `**${monthLabel}** vs last month:\n\n| | This month | Last month |\n|---|---|---|\n| Expenses | ${formatCurrency(stats.totalExpenses)} | ${formatCurrency(prevTotal)} |\n| Income | ${formatCurrency(stats.salary)} | ${formatCurrency(getDashboardStats(data, prevMonth).salary)} |\n\nYou spent **${Math.abs(delta)}%** ${delta <= 0 ? 'less' : 'more'} than last month.`,
      followUps: ['Biggest expense category', 'Financial health score', 'Plan next month budget'],
    };
  }

  if (/subscription|cancel/.test(q)) {
    return {
      content: `Review recurring expenses in **Entertainment**, **Shopping**, and **Transport** — common subscription categories.\n\nI don't see dedicated subscription tags yet. Try adding a "subscription" tag to recurring payments for sharper analysis.`,
      followUps: ['Analyze my spending', 'Help me save RM500', 'Monthly report'],
    };
  }

  if (/budget|plan/.test(q)) {
    return {
      content: `Suggested budget for **${monthLabel}** based on your spending:\n\n${Object.entries(stats.categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([cat, amt]) => `- **${cat}**: ${formatCurrency(Math.round(amt * 1.1))} limit`)
        .join('\n') || '- Add expenses first so I can recommend limits.'}\n\nOpen the **Budget** tab to set limits.`,
      followUps: ['Can I afford this?', 'Where did my money go?', 'Help me save money'],
    };
  }

  if (/report|summary|overview/.test(q)) {
    return {
      content: `**${monthLabel} Financial Report**\n\n- **Income:** ${formatCurrency(stats.salary)}\n- **Expenses:** ${formatCurrency(stats.totalExpenses)}\n- **Safe balance:** ${formatCurrency(stats.safeBalance)}\n- **Upcoming bills:** ${formatCurrency(stats.upcomingDebt)}\n- **Health score:** ${insights.healthScore}/100\n\n**Top category:** ${insights.topCategory} (${formatCurrency(insights.topCategoryAmount)})`,
      followUps: ['Compare with last month', 'Help me save money', 'Upcoming bills'],
    };
  }

  if (/bill|upcoming|due/.test(q)) {
    const bills = stats.debtsDueThisMonth;
    if (!bills.length) {
      return {
        content: `No upcoming bills for ${monthLabel}. You're clear for now 🎉`,
        followUps: ['Financial health', 'Analyze spending', 'Create a budget'],
      };
    }
    const lines = bills.map(
      (b) => `- **${b.category}** — ${formatCurrency(b.remaining)} due ${b.dueDate}`
    );
    return {
      content: `**Upcoming bills:**\n\n${lines.join('\n')}\n\n**Total due:** ${formatCurrency(stats.upcomingDebt)}`,
      followUps: ['Can I afford a purchase?', 'Help me save', 'Monthly report'],
    };
  }

  return {
    content: `I'm your financial assistant. I can help with:\n\n- **Affordability checks** — "Can I afford RM999?"\n- **Spending analysis** — "Where did my money go?"\n- **Savings plans** — "Help me save RM500"\n- **Budgets & reports** — "Plan my budget"\n\nYour safe-to-spend balance is **${formatCurrency(stats.safeBalance)}** this month.`,
    followUps: [
      'Can I afford this?',
      'Where did my money go?',
      'Compare with last month',
      'Monthly report',
    ],
  };
}

export { streamText };

import { formatCurrency, getMonthName, shiftMonthKey } from '../utils/formatters';
import { getDashboardStats, getCategorySpending } from '../utils/calculations';
import { buildAIInsights } from '../utils/aiInsights';
import {
  computeSavingsCapacity,
  extractSalaryFromQuestion,
} from '../utils/savingsAnalysis';
import { getMonthlyManualSavingsNet } from '../utils/savings';
import { AI_BRAND_NAME, AI_BRAND_SHORT } from '../constants/aiBrand';

function extractAmount(text) {
  const match = text.match(/(?:rm\s?)?(\d[\d,]*(?:\.\d{1,2})?)/i);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

function findAffordabilityAmount(question, previousMessages = []) {
  const fromQuestion = extractAmount(question);
  if (fromQuestion != null) return fromQuestion;

  for (let i = previousMessages.length - 1; i >= 0; i--) {
    const msg = previousMessages[i];
    const amount = extractAmount(msg.content || '');
    if (
      amount != null &&
      /hold off|afford|safe-to-spend|short|can afford/i.test(msg.content || '')
    ) {
      return amount;
    }
  }

  return null;
}

function explainSavingsCapacity(stats, insights, monthLabel, data, monthKey, salaryOverride = null) {
  const manualSavingsSetAside = getMonthlyManualSavingsNet(data.savingsHistory, monthKey);
  const capacity = computeSavingsCapacity(stats, manualSavingsSetAside, salaryOverride);
  const { amountAvailableToSave, salary, totalExpenses, upcomingDebt } = capacity;
  const usingOverride = salaryOverride != null && salaryOverride !== stats.salary;

  const headline =
    amountAvailableToSave >= 0
      ? `You can save up to **${formatCurrency(amountAvailableToSave)}** this month.`
      : `You're **${formatCurrency(Math.abs(amountAvailableToSave))}** over budget — no room to save until expenses or bills come down.`;

  const breakdown = `**${monthLabel} breakdown** (${usingOverride ? 'using your stated salary' : 'from your records'}):\n\n| | Amount |\n|---|---|\n| Salary | ${formatCurrency(salary)} |\n| Paid expenses | ${formatCurrency(totalExpenses)} |\n| Upcoming bills | ${formatCurrency(upcomingDebt)} |\n| **Available to save** | **${formatCurrency(amountAvailableToSave)}** |`;

  const cutsNote =
    insights.potentialSavings > 0
      ? `\n\nIf you trim discretionary spending (~15% on large categories), you could free up about **${formatCurrency(insights.potentialSavings)}** more — but that's a cut target, not guaranteed leftover.`
      : '';

  return {
    content: `${headline}\n\n${breakdown}${cutsNote}`,
    followUps: ['Where did my money go?', 'What bills are coming up?', 'Help me cut spending'],
  };
}

function explainAffordability(price, stats) {
  const ok = stats.safeBalance >= price;
  if (ok) {
    return {
      content: `You can afford **${formatCurrency(price)}** — your safe-to-spend balance is **${formatCurrency(stats.safeBalance)}**, so you'd still have **${formatCurrency(stats.safeBalance - price)}** left after that purchase.`,
      followUps: ['Where did my money go?', 'What bills are coming up?', 'Help me save money'],
    };
  }

  return {
    content: `I suggested holding off on **${formatCurrency(price)}** because your **safe-to-spend balance** is only **${formatCurrency(stats.safeBalance)}**.\n\nThat purchase would exceed it by **${formatCurrency(price - stats.safeBalance)}**, leaving you short for bills or essentials already counted in that balance.\n\n**Safe balance** = income minus paid expenses minus upcoming bills this month.`,
    followUps: ['What bills are coming up?', 'How can I save more?', 'Show my biggest expenses'],
  };
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

export function generateFinancialResponse(question, data, monthKey, previousMessages = []) {
  const q = question.toLowerCase().trim();
  const stats = getDashboardStats(data, monthKey);
  const insights = buildAIInsights(data, monthKey);
  const prevMonth = shiftMonthKey(monthKey, -1);
  const prevSpending = getCategorySpending(data.transactions, prevMonth, data.debts);
  const monthLabel = getMonthName(monthKey);

  if (/why|explain|how come|what reason|tell me more|hold off/.test(q)) {
    const price = findAffordabilityAmount(q, previousMessages);
    if (price != null) {
      return explainAffordability(price, stats);
    }
  }

  if (/afford|can i buy|can i get|can i spend|should i buy/.test(q)) {
    const price = extractAmount(q) || 999;
    return explainAffordability(price, stats);
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

  if (/how much.*save|can i save|amount.*save|save.*(?:this|each|per)\s*month|much can i put aside|leftover|left over/.test(q)) {
    const statedSalary = extractSalaryFromQuestion(q);
    return explainSavingsCapacity(
      stats,
      insights,
      monthLabel,
      data,
      monthKey,
      statedSalary
    );
  }

  if (/save|cut back|reduce spending/.test(q)) {
    const statedSalary = extractSalaryFromQuestion(q);
    if (statedSalary != null) {
      return explainSavingsCapacity(
        stats,
        insights,
        monthLabel,
        data,
        monthKey,
        statedSalary
      );
    }

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
      content: `**${monthLabel} Financial Report**\n\n- **Income:** ${formatCurrency(stats.salary)}\n- **Expenses (paid):** ${formatCurrency(stats.totalExpenses)}\n- **Upcoming bills** ([[unpaid]]): ${formatCurrency(stats.upcomingDebt)}\n- **Safe balance:** ${formatCurrency(stats.safeBalance)}\n- **Health score:** ${insights.healthScore}/100\n\n**Top category:** ${insights.topCategorySummary}`,
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
    content: `I'm **${AI_BRAND_SHORT}** (${AI_BRAND_NAME}). I can help with:\n\n- **Affordability checks** — "Can I afford RM999?"\n- **Spending analysis** — "Where did my money go?"\n- **Savings plans** — "Help me save RM500"\n- **Budgets & reports** — "Plan my budget"\n\nYour safe-to-spend balance is **${formatCurrency(stats.safeBalance)}** this month.`,
    followUps: [
      'Can I afford this?',
      'Where did my money go?',
      'Compare with last month',
      'Monthly report',
    ],
  };
}

export { streamText };

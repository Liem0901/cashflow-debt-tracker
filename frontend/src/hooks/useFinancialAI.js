import { formatCurrency, getMonthName, shiftMonthKey } from '../utils/formatters';
import { getDashboardStats, getCategorySpending } from '../utils/calculations';
import { buildAIInsights } from '../utils/aiInsights';
import {
  computeSavingsCapacity,
  extractSalaryFromQuestion,
} from '../utils/savingsAnalysis';
import { getMonthlyManualSavingsNet } from '../utils/savings';
import {
  extractCategoryFromQuestion,
  isCategoryAdviceQuestion,
  isCategorySpendingQuestion,
  recommendCategoryBudget,
  buildCategoryBudgetRecommendations,
  formatCategoryBudgetRecommendation,
} from '../utils/budgetRecommendations';
import {
  buildCoachingSnapshot,
  formatEmergencyFundNote,
  formatSavingsCoachNote,
  formatPurchaseCoachNote,
  format503020BudgetHint,
  formatUnusualSpendingNote,
} from '../utils/coachingPrinciples';
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

function explainMonthlyRemaining(stats, monthLabel) {
  const { monthlyRemaining, salary, totalExpenses, upcomingDebt } = stats;

  return {
    content: `You have **${formatCurrency(monthlyRemaining)}** left this month in **${monthLabel}**.\n\n| | Amount |\n|---|---|\n| Salary | ${formatCurrency(salary)} |\n| Paid expenses | ${formatCurrency(totalExpenses)} |\n| Upcoming bills | ${formatCurrency(upcomingDebt)} |\n| **Remaining** | **${formatCurrency(monthlyRemaining)}** |`,
    followUps: ['What bills are coming up?', 'How much can I spend?', 'Where did my money go?'],
  };
}

function explainSafeToSpend(stats, monthLabel, data, monthKey) {
  const manualSavingsSetAside = getMonthlyManualSavingsNet(data.savingsHistory, monthKey);
  const safeToSpend = stats.safeBalance;
  const rows = [
    `| Salary | ${formatCurrency(stats.salary)} |`,
    `| Paid expenses | ${formatCurrency(stats.totalExpenses)} |`,
    `| Upcoming bills | ${formatCurrency(stats.upcomingDebt)} |`,
  ];

  if (manualSavingsSetAside > 0) {
    rows.push(`| Savings set aside | ${formatCurrency(manualSavingsSetAside)} |`);
  }

  rows.push(`| **Safe to spend** | **${formatCurrency(safeToSpend)}** |`);

  return {
    content: `You can safely spend up to **${formatCurrency(safeToSpend)}** this month.\n\n| | Amount |\n|---|---|\n${rows.join('\n')}\n\nThis is what's left after bills and any savings you've already set aside.`,
    followUps: ['Can I afford RM200?', 'Where did my money go?', 'How much should I save?'],
  };
}

function isSafeToSpendQuestion(q) {
  return (
    /how much can i spend|how much.*(?:safe|available).*spend|safe.?to.?spend|what can i spend/.test(q) ||
    /^can i spend\s*\??$/.test(q.trim())
  );
}

function isAffordabilityQuestion(q, categorySpending, budgets) {
  if (/afford|can i buy|can i get|should i buy/.test(q)) return true;
  if (!/can i spend/.test(q)) return false;
  // "can i spend 100?" — amount-based purchase check
  if (extractAmount(q) != null) return true;
  // "can i spend on shopping?" — category limit, not affordability
  return !extractCategoryFromQuestion(q, categorySpending, budgets);
}

function isBalanceQuestion(q) {
  if (isSafeToSpendQuestion(q)) return false;
  if (/should i save|can i save|left to spend/.test(q)) return false;
  return /what(?:'s| is) my balance|my balance|how much.*(?:have )?left|how much.*remain|money remain|remaining money|what(?:'s| is) left(?: this month)?/.test(
    q
  );
}

function explainSavingsCapacity(stats, insights, monthLabel, data, monthKey, salaryOverride = null, coachingSnapshot = null) {
  const manualSavingsSetAside = getMonthlyManualSavingsNet(data.savingsHistory, monthKey);
  const capacity = computeSavingsCapacity(stats, manualSavingsSetAside, salaryOverride);
  const { amountAvailableToSave, salary, totalExpenses, upcomingDebt } = capacity;
  const usingOverride = salaryOverride != null && salaryOverride !== stats.salary;
  const encouraged =
    coachingSnapshot?.savingsGuidance?.encouragedMonthlySavings ??
    Math.min(Math.max(0, amountAvailableToSave), Math.round(Math.max(0, amountAvailableToSave) * 0.6));

  const headline =
    amountAvailableToSave >= 0
      ? encouraged > 0 && encouraged < amountAvailableToSave
        ? `I'd aim to save **${formatCurrency(encouraged)}** this month — a realistic target without locking up every ringgit.`
        : `You can save up to **${formatCurrency(amountAvailableToSave)}** this month.`
      : `You're **${formatCurrency(Math.abs(amountAvailableToSave))}** over budget — no room to save until expenses or bills come down.`;

  const breakdown = `**${monthLabel} breakdown** (${usingOverride ? 'using your stated salary' : 'from your records'}):\n\n| | Amount |\n|---|---|\n| Salary | ${formatCurrency(salary)} |\n| Paid expenses | ${formatCurrency(totalExpenses)} |\n| Upcoming bills | ${formatCurrency(upcomingDebt)} |${
    capacity.manualSavingsSetAside > 0
      ? `\n| Savings set aside | ${formatCurrency(capacity.manualSavingsSetAside)} |`
      : ''
  }\n| **Available to save** | **${formatCurrency(amountAvailableToSave)}** |`;

  const cutsNote =
    insights.potentialSavings > 0
      ? `\n\nIf you trim discretionary spending (~15% on large categories), you could free up about **${formatCurrency(insights.potentialSavings)}** more — but that's a cut target, not guaranteed leftover.`
      : '';

  const coachNote = coachingSnapshot ? formatSavingsCoachNote(coachingSnapshot) : null;

  return {
    content: `${headline}\n\n${breakdown}${cutsNote}${coachNote ? `\n\n${coachNote}` : ''}`,
    followUps: ['Where did my money go?', 'What bills are coming up?', 'Help me cut spending'],
  };
}

function explainCategorySpendLimit(category, stats, budgets, monthLabel) {
  const spent = stats.categorySpending[category] || 0;
  const limit = Number(budgets?.[category]) || 0;
  const safeBalance = stats.safeBalance;
  const budgetRemaining = limit > 0 ? Math.max(0, limit - spent) : null;
  const maxSpend =
    budgetRemaining != null
      ? Math.max(0, Math.min(budgetRemaining, safeBalance))
      : Math.max(0, safeBalance);

  if (maxSpend <= 0) {
    const overBudget = limit > 0 && spent > limit;
    return {
      content: overBudget
        ? `You're **${formatCurrency(spent - limit)}** over your **${category}** budget (${formatCurrency(limit)}) in **${monthLabel}**. I'd pause **${category}** spending until next month.`
        : `Your safe-to-spend balance is **${formatCurrency(safeBalance)}**, so there's no room for more **${category}** spending right now.`,
      followUps: ['Where did my money go?', 'What bills are coming up?', 'Help me save money'],
    };
  }

  if (limit > 0) {
    return {
      content: `You can spend up to **${formatCurrency(maxSpend)}** more on **${category}** this month.\n\n| | Amount |\n|---|---|\n| Budget limit | ${formatCurrency(limit)} |\n| Already spent | ${formatCurrency(spent)} |\n| Budget left | ${formatCurrency(budgetRemaining)} |\n| Safe to spend (overall) | ${formatCurrency(safeBalance)} |\n\nYour cap is whichever is lower: budget left or safe balance.`,
      followUps: [`What did I spend on ${category}?`, 'Where did my money go?', 'Create a budget'],
    };
  }

  return {
    content: `No **${category}** budget set yet. Based on your **safe-to-spend balance**, you could spend up to **${formatCurrency(maxSpend)}** on **${category}** — but other categories share that same pool.\n\nSet a **${category}** limit in the **Budget** tab for a clearer cap.`,
    followUps: [`Set a ${category} budget`, 'Where did my money go?', 'Can I afford RM200?'],
  };
}

function explainAffordability(price, stats, coachingSnapshot = null) {
  const ok = stats.safeBalance >= price;
  const purchaseCoach = coachingSnapshot
    ? formatPurchaseCoachNote(price, stats, coachingSnapshot)
    : '';

  if (ok) {
    const emergencyNote =
      coachingSnapshot && coachingSnapshot.emergencyFund.gapTo3Months > 0
        ? `\n\nKeep **${formatCurrency(coachingSnapshot.emergencyFund.gapTo3Months)}** in mind for your 3-month emergency fund before big discretionary spends.`
        : '';

    return {
      content: `You *can* afford **${formatCurrency(price)}** on paper — safe-to-spend is **${formatCurrency(stats.safeBalance)}**, leaving **${formatCurrency(stats.safeBalance - price)}** after.${emergencyNote}${purchaseCoach ? `\n\n${purchaseCoach}` : ''}`,
      followUps: ['Where did my money go?', 'What bills are coming up?', 'How much should I save?'],
    };
  }

  return {
    content: `I suggested holding off on **${formatCurrency(price)}** because your **safe-to-spend** amount is only **${formatCurrency(stats.safeBalance)}**.\n\nThat purchase would exceed it by **${formatCurrency(price - stats.safeBalance)}**, leaving you short for bills or savings already counted.${purchaseCoach ? `\n\n${purchaseCoach}` : ''}\n\n**Safe to spend** = salary minus paid expenses minus upcoming bills minus savings set aside this month.`,
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
  const coachingSnapshot = buildCoachingSnapshot(data, monthKey, insights, stats);
  const prevMonth = shiftMonthKey(monthKey, -1);
  const prevSpending = getCategorySpending(data.transactions, prevMonth, data.debts);
  const monthLabel = getMonthName(monthKey);

  if (/why|explain|how come|what reason|tell me more|hold off/.test(q)) {
    const price = findAffordabilityAmount(q, previousMessages);
    if (price != null) {
      return explainAffordability(price, stats, coachingSnapshot);
    }
  }

  if (isAffordabilityQuestion(q, stats.categorySpending, data.budgets)) {
    const price = extractAmount(q) || 999;
    return explainAffordability(price, stats, coachingSnapshot);
  }

  if (isCategoryAdviceQuestion(q, stats.categorySpending, data.budgets)) {
    const category = extractCategoryFromQuestion(q, stats.categorySpending, data.budgets);
    if (category) {
      const rec = recommendCategoryBudget(
        category,
        stats,
        data.budgets,
        stats.categorySpending
      );
      return formatCategoryBudgetRecommendation(rec, stats, monthLabel, coachingSnapshot);
    }
  }

  if (
    /how much|max|maximum|limit|remaining|can i spend|left to spend/.test(q) &&
    /spend|budget|limit/.test(q)
  ) {
    const category = extractCategoryFromQuestion(q, stats.categorySpending, data.budgets);
    if (category) {
      return explainCategorySpendLimit(category, stats, data.budgets, monthLabel);
    }
  }

  if (isSafeToSpendQuestion(q)) {
    return explainSafeToSpend(stats, monthLabel, data, monthKey);
  }

  if (isBalanceQuestion(q)) {
    return explainMonthlyRemaining(stats, monthLabel);
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
      statedSalary,
      coachingSnapshot
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
        statedSalary,
        coachingSnapshot
      );
    }

    const target = extractAmount(q) || 500;
    const cat = insights.topCategory;
    return {
      content: `To save around **${formatCurrency(target)}/month**, start with **${cat}** — your largest category at **${formatCurrency(insights.topCategoryAmount)}**.\n\n**Quick wins:**\n- Set a ${cat} budget 15–20% lower\n- Review subscriptions\n- Delay non-essential purchases until safe balance grows\n\nEstimated savings potential: **${formatCurrency(insights.potentialSavings)}/month**.`,
      followUps: ['Create a budget', 'Analyze my spending', 'Can I afford a vacation?'],
    };
  }

  if (isCategorySpendingQuestion(q)) {
    const category =
      extractCategoryFromQuestion(q, stats.categorySpending, data.budgets) ||
      (() => {
        const catMatch = q.match(/on (\w+)/);
        if (!catMatch?.[1]) return insights.topCategory;
        return (
          Object.keys(stats.categorySpending).find((c) =>
            c.toLowerCase().includes(catMatch[1])
          ) || insights.topCategory
        );
      })();
    const amount = stats.categorySpending[category] || 0;
    const rec = recommendCategoryBudget(category, stats, data.budgets, stats.categorySpending);

    return {
      content: `You spent **${formatCurrency(amount)}** on **${category}** in **${monthLabel}**.\n\nWant a budget cap? I'd suggest **${formatCurrency(rec.recommended)}**/month — ask *"What budget should I set for ${category}?"* for the full breakdown.`,
      followUps: [
        `What budget should I set for ${category}?`,
        'Where did my money go?',
        'Help me cut spending',
      ],
    };
  }

  if (/^food\b|food spending/.test(q)) {
    const amount = stats.categorySpending.Food || 0;
    return {
      content: `You spent **${formatCurrency(amount)}** on **Food** in **${monthLabel}**.`,
      followUps: ['What budget for Food?', 'Where did my money go?', 'Help me save money'],
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
    const recommendations = buildCategoryBudgetRecommendations(stats, data.budgets);
    const lines = recommendations
      .filter((rec) => rec.recommended > 0 || rec.spent > 0)
      .sort((a, b) => b.recommended - a.recommended)
      .slice(0, 6)
      .map((rec) => {
        const note = rec.hasSpendingData ? 'from your spending' : 'benchmark';
        return `- **${rec.category}**: ${formatCurrency(rec.recommended)} (${note})`;
      });

    const guideNote = format503020BudgetHint(stats);
    const unusualNote = formatUnusualSpendingNote(coachingSnapshot);

    return {
      content: `Here's a starter budget for **${monthLabel}**:\n\n${lines.join('\n') || '- Add your income in **Profile** so I can suggest limits.'}${guideNote ? `\n\n${guideNote}` : ''}${unusualNote ? `\n\n${unusualNote}` : ''}\n\nAsk me about any category — e.g. *"What budget should I set for Shopping?"* — even if you haven't tracked it yet.\n\nOpen the **Budget** tab to set limits.`,
      followUps: [
        'What budget for Shopping?',
        'What budget for Food?',
        'Where did my money go?',
      ],
    };
  }

  if (/report|summary|overview/.test(q)) {
    return {
      content: `**${monthLabel} Financial Report**\n\n- **Income:** ${formatCurrency(stats.salary)}\n- **Expenses (paid):** ${formatCurrency(stats.totalExpenses)}\n- **Upcoming bills** ([[unpaid]]): ${formatCurrency(stats.upcomingDebt)}\n- **Remaining:** ${formatCurrency(stats.monthlyRemaining)}\n- **Safe to spend:** ${formatCurrency(stats.safeBalance)}\n- **Health score:** ${insights.healthScore}/100\n\n**Top category:** ${insights.topCategorySummary}`,
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
    content: `I'm **${AI_BRAND_SHORT}** (${AI_BRAND_NAME}). Ask me anything — like ChatGPT for your money:\n\n- **"What budget should I set for Shopping?"** — even with no spending data yet\n- **"Can I afford RM999?"** — affordability checks\n- **"Where did my money go?"** — spending breakdown\n- **"How much should I save?"** — savings advice\n\nYou have **${formatCurrency(stats.monthlyRemaining)}** left this month (after expenses and bills).`,
    followUps: [
      'Can I afford this?',
      'Where did my money go?',
      'Compare with last month',
      'Monthly report',
    ],
  };
}

export { streamText };

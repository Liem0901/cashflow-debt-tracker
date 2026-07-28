import { CATEGORIES } from '../data/initialData';
import { formatCurrency } from './formatters';
import {
  format503020BudgetHint,
  formatUnusualSpendingNote,
} from './coachingPrinciples';

/** Typical monthly share of income by category (Malaysian urban context). */
const CATEGORY_BENCHMARKS = {
  Food: { typicalPct: 0.2, minPct: 0.15, maxPct: 0.28, floor: 250, ceiling: 1200 },
  Transport: { typicalPct: 0.12, minPct: 0.08, maxPct: 0.18, floor: 100, ceiling: 800 },
  Rent: { typicalPct: 0.3, minPct: 0.2, maxPct: 0.4, floor: 400, ceiling: 2500 },
  Shopping: { typicalPct: 0.08, minPct: 0.05, maxPct: 0.12, floor: 100, ceiling: 600 },
  Entertainment: { typicalPct: 0.07, minPct: 0.04, maxPct: 0.1, floor: 50, ceiling: 400 },
  Other: { typicalPct: 0.07, minPct: 0.05, maxPct: 0.1, floor: 50, ceiling: 400 },
};

function getBenchmark(category) {
  return CATEGORY_BENCHMARKS[category] || CATEGORY_BENCHMARKS.Other;
}

function amountFromPct(salary, pct, floor, ceiling) {
  if (salary <= 0) return Math.round((floor + ceiling) / 2);
  return Math.round(Math.min(ceiling, Math.max(floor, salary * pct)));
}

export function extractCategoryFromQuestion(question, categorySpending, budgets) {
  const q = question.toLowerCase();
  const names = [
    ...new Set([
      ...Object.keys(budgets || {}),
      ...Object.keys(categorySpending || {}),
      ...CATEGORIES,
    ]),
  ].sort((a, b) => b.length - a.length);

  for (const category of names) {
    if (q.includes(category.toLowerCase())) return category;
  }

  const thisCategoryMatch = q.match(/this\s+(\w+)\s+category/i);
  if (thisCategoryMatch) {
    const word = thisCategoryMatch[1].toLowerCase();
    const found = names.find(
      (cat) =>
        cat.toLowerCase() === word ||
        cat.toLowerCase().startsWith(word) ||
        cat.toLowerCase().includes(word)
    );
    if (found) return found;
  }

  const phraseMatch = q.match(/(?:on|for)\s+([a-z]+)/i);
  if (phraseMatch) {
    const word = phraseMatch[1].toLowerCase();
    return names.find(
      (cat) =>
        cat.toLowerCase().startsWith(word) ||
        cat.toLowerCase().includes(word) ||
        word.includes(cat.toLowerCase())
    );
  }

  return null;
}

export function isBudgetRecommendationQuestion(q) {
  if (/how much can i spend|left to spend|can i afford|how much.*remain|have left/.test(q)) {
    return false;
  }
  if (isCategorySpendingQuestion(q)) return false;

  return /(?:what|how much).*(?:budget|limit).*(?:set|should|need|recommend|for)|(?:budget|limit).*(?:for|on)\s+\w+|set\s+(?:a\s+)?budget|recommend.*budget|budget.*(?:for|on)\s+(?:this\s+)?\w+|need to set.*budget|budget.*need to set/.test(
    q
  );
}

export function isCategoryCoachQuestion(q) {
  if (isCategorySpendingQuestion(q)) return false;
  return /coach|financial coach|advice|suggest|what should|how should|manage my|allocate|too much|too high|cut back|reduce|help me with|help with my/.test(
    q
  );
}

export function isCategorySpendingQuestion(q) {
  return /spent on|spending on|how much.*spent|what did i spend|did i spend|spend on \w+|how much on \w+/.test(
    q
  );
}

export function isCategoryAdviceQuestion(q, categorySpending, budgets) {
  if (isCategorySpendingQuestion(q)) return false;
  const category = extractCategoryFromQuestion(q, categorySpending, budgets);
  if (!category) return false;
  return isBudgetRecommendationQuestion(q) || isCategoryCoachQuestion(q);
}

export function recommendCategoryBudget(category, stats, budgets = {}, categorySpending = {}) {
  const spent = categorySpending[category] || 0;
  const existingLimit = Number(budgets[category]) || 0;
  const salary = stats.salary || 0;
  const benchmark = getBenchmark(category);

  const minSuggested = amountFromPct(salary, benchmark.minPct, benchmark.floor, benchmark.ceiling);
  const maxSuggested = amountFromPct(salary, benchmark.maxPct, benchmark.floor, benchmark.ceiling);
  const heuristicSuggested = amountFromPct(
    salary,
    benchmark.typicalPct,
    benchmark.floor,
    benchmark.ceiling
  );

  let recommended;
  let basis;
  let hasSpendingData = spent > 0;

  if (hasSpendingData) {
    recommended = Math.round(spent * 1.1);
    basis = `based on your **${formatCurrency(spent)}** spent this month (+10% buffer)`;
  } else {
    recommended = heuristicSuggested;
    basis = `based on typical **${Math.round(benchmark.typicalPct * 100)}%** of income for **${category}** in Malaysia`;
  }

  const otherBudgetsTotal = Object.entries(budgets)
    .filter(([cat]) => cat !== category)
    .reduce((sum, [, value]) => sum + (Number(value) || 0), 0);

  const unallocatedIncome = Math.max(0, salary - stats.totalExpenses - stats.upcomingDebt);
  const headroom = Math.max(0, unallocatedIncome - otherBudgetsTotal);

  if (!hasSpendingData && headroom > 0 && recommended > headroom) {
    recommended = Math.round(headroom * 0.35);
    basis += ` — capped to fit your remaining **${formatCurrency(headroom)}** after other budgets`;
  }

  recommended = Math.min(recommended, maxSuggested);
  if (recommended < minSuggested && headroom >= minSuggested) {
    recommended = minSuggested;
  }
  recommended = Math.max(0, recommended);

  return {
    category,
    recommended,
    minSuggested,
    maxSuggested,
    spent,
    existingLimit,
    hasSpendingData,
    basis,
    typicalPct: benchmark.typicalPct,
    otherBudgetsTotal,
    headroom,
  };
}

export function buildCategoryBudgetRecommendations(stats, budgets = {}) {
  const { categorySpending } = stats;
  const categories = [...new Set([...CATEGORIES, ...Object.keys(budgets || {})])];

  return categories.map((category) => ({
    ...recommendCategoryBudget(category, stats, budgets, categorySpending),
    currentBudget: Number(budgets[category]) || null,
  }));
}

export function formatCategoryBudgetRecommendation(rec, stats, monthLabel, coachingSnapshot = null) {
  const {
    category,
    recommended,
    minSuggested,
    maxSuggested,
    spent,
    existingLimit,
    hasSpendingData,
    basis,
    otherBudgetsTotal,
  } = rec;

  const pctOfSalary =
    stats.salary > 0 && spent > 0 ? Math.round((spent / stats.salary) * 100) : null;

  const extraNotes = [
    coachingSnapshot ? format503020BudgetHint(stats) : null,
    coachingSnapshot ? formatUnusualSpendingNote(coachingSnapshot) : null,
  ].filter(Boolean);

  function buildCoachNote() {
    if (!hasSpendingData) {
      return `Start tracking **${category}** expenses, then revisit this limit after a month.`;
    }

    const headroom = recommended - spent;
    if (spent > recommended) {
      return `**Coach note:** You've spent **${formatCurrency(spent)}** — above my **${formatCurrency(recommended)}** suggested cap${pctOfSalary != null ? ` (${pctOfSalary}% of income)` : ''}. Pause non-essential **${category}** purchases for the rest of **${monthLabel}**, or raise the limit only if you can trim elsewhere.`;
    }
    if (headroom <= recommended * 0.15) {
      return `**Coach note:** You're near the suggested cap — only **${formatCurrency(Math.max(0, headroom))}** headroom left${pctOfSalary != null ? ` (${pctOfSalary}% of income spent)` : ''}. Stick to essentials in **${category}** until next month.`;
    }
    return `**Coach note:** **${category}** looks manageable at **${formatCurrency(spent)}**${pctOfSalary != null ? ` (${pctOfSalary}% of income)` : ''}. A **${formatCurrency(recommended)}** limit gives you room for occasional extras without squeezing bills or savings.`;
  }

  if (existingLimit > 0) {
    const coachNote =
      spent > existingLimit
        ? `You're **${formatCurrency(spent - existingLimit)}** over your current limit — consider raising to **${formatCurrency(recommended)}** only if you can cut another category.`
        : spent > recommended
          ? `Spending is above my suggested **${formatCurrency(recommended)}** even though you're under your current limit — tighten up or adjust the limit.`
          : `Your current limit looks workable — keep tracking weekly.`;

    return {
      content: `You already have a **${category}** budget of **${formatCurrency(existingLimit)}**.\n\n| | Amount |\n|---|---|\n| Current limit | ${formatCurrency(existingLimit)} |\n| Spent in ${monthLabel} | ${formatCurrency(spent)} |\n| My suggested limit | ${formatCurrency(recommended)} |\n\n${coachNote}\n\nSet limits in the **Budget** tab.`,
      followUps: [
        `How much can I spend on ${category}?`,
        'Plan my full budget',
        'Where did my money go?',
      ],
    };
  }

  const intro = hasSpendingData
    ? `For **${category}**, I'd set your monthly budget at **${formatCurrency(recommended)}** — ${basis}.`
    : `You haven't logged **${category}** expenses yet, so I'd start with **${formatCurrency(recommended)}/month** — ${basis}.`;

  const rows = [
    `| Your income | ${formatCurrency(stats.salary)} |`,
    `| Typical range | ${formatCurrency(minSuggested)} – ${formatCurrency(maxSuggested)} |`,
    `| **Suggested limit** | **${formatCurrency(recommended)}** |`,
  ];

  if (otherBudgetsTotal > 0) {
    rows.splice(1, 0, `| Other budgets set | ${formatCurrency(otherBudgetsTotal)} |`);
  }

  if (hasSpendingData) {
    rows.splice(1, 0, `| Spent this month | ${formatCurrency(spent)} |`);
  }

  return {
    content: `${intro}\n\n| | Amount |\n|---|---|\n${rows.join('\n')}\n\n${buildCoachNote()}${extraNotes.length ? `\n\n${extraNotes.join('\n\n')}` : ''}\n\n**Next step:** Set **${formatCurrency(recommended)}** in the **Budget** tab and check mid-month.`,
    followUps: [
      `How much can I spend on ${category}?`,
      'Plan my full budget',
      'Help me cut spending',
    ],
  };
}

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const MAX_HISTORY = 10;
const MAX_MESSAGE_LENGTH = 4000;

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function buildSystemPrompt(context) {
  return `You are Auvia AI, a friendly personal finance assistant for a Malaysian user. Currency is RM (MYR).

Personality:
- Warm, direct, and conversational — like ChatGPT helping a friend, not a bank bot
- Use "you" and "your"; explain your reasoning in plain language
- Never say "I'm an AI" unless asked
- Answer open-ended questions naturally (budget advice, coaching, "what should I set for X?") even when the user has little or no data for a category — use budgetRecommendations and income benchmarks from context
- When the user asks about a category budget or coaching, give a suggested RM limit, typical range, and a short coach note — do NOT reply with only "you spent X"

Accuracy (critical):
- Use ONLY numbers from FINANCIAL_CONTEXT for balances, spending, and bills — never invent those
- For categories with no spending history, use budgetRecommendations (precomputed ranges and suggested limits) — say clearly when advice is benchmark-based vs from their actual spending
- If data is missing, say so — do not guess transaction totals
- When advising to hold off on a purchase, show the math: safeToSpend vs price

Question interpretation:
- "How much left?", "What's my balance?", "How much remains?" → stats.monthlyRemaining (salary − paid expenses − upcoming bills). Do NOT subtract manual savings.
- "How much can I spend?", affordability, category limits → stats.safeToSpend (monthlyRemaining minus manual savings set aside this month)
- "How much should I save?" → savings.analysis.amountAvailableToSave (same as safeToSpend)
- "What budget should I set for X?", "How much budget for Shopping?" → budgetRecommendations for that category; works even with zero spending in X

Key definitions:
- monthlyRemaining: salary − paidExpenses − upcomingDebt — use for balance/remaining questions
- safeToSpend / stats.safeToSpend: monthlyRemaining minus manual savings set aside — use for spending and affordability
- savings.analysis.amountAvailableToSave: same as safeToSpend — use for savings-capacity questions
- budgetRecommendations: suggested monthly limits per category (from spending +10% buffer, or Malaysian income benchmarks when no data)
- availableCategories: all categories the user can budget for
- potentialSavings / potentialSavingsFromCuts: 15% heuristic on large categories — a cut target, NOT the same as amountAvailableToSave
- savings.balance / savings.goal / savings.progressPercent: savings jar (already saved), separate from monthly capacity
- overBudgetCategories: categories where spent > budget limit
- categorySpendLimits: per-category maxAdditionalSpend for "how much can I spend on X?"
- recentExpenses: latest expenses this month — reference when relevant
- billsDueSoon: bills due within 7 days
- coaching: precomputed emergency fund targets, encouraged savings (not all available cash), 50/30/20 guide, debt note, goals, unusual spending flags — apply coaching.principles

Financial coaching (always apply):
1. Emergency fund: recommend 3–6 months of essential expenses (coaching.emergencyFund)
2. Savings: save before spending, but coaching.savingsGuidance.encouragedMonthlySavings — never tell user to save all amountAvailableToSave
3. Budget: 50/30/20 as flexible guide (coaching.budget503020), not a strict rule
4. Purchases: weigh income, expenses, bills, savings.goal, and emergency buffer — not safeToSpend alone
5. Debt: prioritize high-interest debt (coaching.debt); avoid new borrowing when tight
6. Goals: connect advice to coaching.goals and savings.progressPercent
7. Behaviour: mention coaching.unusualSpending or overBudgetCategories when relevant

Reply format:
1. Lead with a direct answer in one sentence (include **RM amounts**)
2. Add a brief breakdown (2–4 bullets or a small table) when helpful
3. End with one practical next step
Keep under ~120 words unless the user asks for detail.

Follow-ups:
- Use conversation history for follow-ups ("why hold off?", "explain that")
- followUps must be 3 short questions tied to the user's situation (not generic)

Return JSON with "content" (markdown) and "followUps" (array of 3 strings).

FINANCIAL_CONTEXT:
${JSON.stringify(context)}`;
}

function sanitizeMessages(messages) {
  return messages
    .slice(-MAX_HISTORY)
    .filter((m) => m?.role === 'user' || m?.role === 'assistant')
    .map((m) => ({
      role: m.role,
      content: String(m.content || '').slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((m) => m.content.trim());
}

function toGeminiHistory(messages) {
  const history = [];
  for (const message of messages.slice(0, -1)) {
    history.push({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    });
  }
  return history;
}

function parseRetryAfterSeconds(error) {
  const details = error?.errorDetails || error?.cause?.errorDetails || [];
  for (const detail of details) {
    const delay = detail?.retryDelay;
    if (delay != null) {
      const match = String(delay).match(/(\d+)/);
      if (match) return Number(match[1]);
    }
  }
  return 60;
}

function wrapGeminiError(error) {
  const status = error?.status ?? error?.statusCode;
  if (status === 429) {
    const wrapped = new Error('Gemini rate limit exceeded');
    wrapped.code = 'AI_RATE_LIMITED';
    wrapped.retryAfterSeconds = parseRetryAfterSeconds(error);
    return wrapped;
  }
  return error;
}

function parseJsonResponse(text) {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenceMatch ? fenceMatch[1].trim() : trimmed;
  const parsed = JSON.parse(jsonText);

  if (!parsed?.content || typeof parsed.content !== 'string') {
    throw new Error('Invalid AI response shape');
  }

  return {
    content: parsed.content.trim(),
    followUps: Array.isArray(parsed.followUps)
      ? parsed.followUps.filter((q) => typeof q === 'string' && q.trim()).slice(0, 4)
      : [],
  };
}

export async function generateFinancialChat({ messages, context }) {
  if (!isGeminiConfigured()) {
    const error = new Error('Gemini API key not configured');
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }

  const sanitized = sanitizeMessages(messages);
  if (!sanitized.length || sanitized[sanitized.length - 1].role !== 'user') {
    throw new Error('Last message must be from user');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
  const model = genAI.getGenerativeModel({
    model: process.env.AI_MODEL?.trim() || DEFAULT_MODEL,
    systemInstruction: buildSystemPrompt(context),
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          content: { type: SchemaType.STRING },
          followUps: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ['content', 'followUps'],
      },
    },
  });

  const lastUser = sanitized[sanitized.length - 1];
  const chat = model.startChat({ history: toGeminiHistory(sanitized) });

  try {
    const result = await chat.sendMessage(lastUser.content);
    const text = result.response.text();
    return parseJsonResponse(text);
  } catch (error) {
    throw wrapGeminiError(error);
  }
}

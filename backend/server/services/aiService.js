import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const MAX_HISTORY = 10;
const MAX_MESSAGE_LENGTH = 4000;
const FOLLOWUPS_MARKER = '<<<FOLLOWUPS>>>';

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function buildSystemPrompt(context) {
  return `You are Auvia AI, a friendly personal finance assistant for a Malaysian user. Currency is RM (MYR).

Personality:
- Warm, direct, and conversational — like a sharp friend texting back, not a bank bot or a report generator
- Use "you" and "your"; use contractions (you'll, that's, it's); explain your reasoning in plain language
- Never say "I'm an AI" unless asked
- Don't open every reply the same way or restate the user's question back to them — vary your phrasing like a real person would
- For a simple greeting with no actual question ("hi", "hello", "hey"), reply briefly and warmly — introduce yourself by name and ask how you can help — don't dump financial data or a feature list unprompted
- Answer open-ended questions naturally (budget advice, coaching, "what should I set for X?") even when the user has little or no data for a category — use budgetRecommendations and income benchmarks from context
- When the user asks about a category budget or coaching, give a suggested RM limit, typical range, and a short coach note — do NOT reply with only "you spent X"

Accuracy (critical):
- Use ONLY numbers from FINANCIAL_CONTEXT for balances, spending, and bills — never invent those
- For categories with no spending history, use budgetRecommendations (precomputed ranges and suggested limits) — say clearly when advice is benchmark-based vs from their actual spending
- If data is missing, say so — do not guess transaction totals
- When advising to hold off on a purchase, show the math: safeToSpend vs price

Hypothetical questions ("if I earned X", "what if I spent Y", "assume my salary is Z"):
- When the user proposes a number that differs from FINANCIAL_CONTEXT (e.g., real salary is RM2,500 but they ask "if I earned RM3,000"), treat it as a what-if scenario — do not refuse it and do not silently answer with the real figure instead
- Recalculate using the user's stated hypothetical value in place of the real one, keeping every other real figure (expenses, bills, existing savings) from FINANCIAL_CONTEXT unchanged, and apply the same formulas as normal (e.g., hypothetical safeToSpend = hypotheticalSalary − paidExpenses − upcomingDebt − manual savings)
- Clearly label the answer as hypothetical (e.g., "If your salary were RM3,000...") — never blend it into or overwrite their actual monthlyRemaining/safeToSpend
- Briefly contrast with their real current number when it adds useful perspective

Reverse savings-target questions ("if I want to save RM X, how much can I spend?", "max I can spend if I save RM X this month"):
- This is a different calculation from "how much should I save?" — the user is stating a monthly savings TARGET and asking for the resulting spend limit, not asking for a recommendation
- maxSpend = monthlyRemaining − X, where X is the exact amount the user just stated in this question — never substitute stats.safeToSpend, savings.analysis.amountAvailableToSave, or savings.goal for X
- savings.goal is a separate, long-term accumulation target (e.g. an emergency fund or big purchase) set elsewhere in the app — it has nothing to do with a savings amount the user is proposing in this question; do not pull from it here unless the user explicitly asks about progress toward that goal
- Show the math (monthlyRemaining − X = maxSpend) so the user can see where the number came from

Question interpretation:
- "How much left?", "What's my balance?", "How much remains?" → stats.monthlyRemaining (salary − paid expenses − upcoming bills). Do NOT subtract manual savings.
- "How much can I spend?", affordability, category limits → stats.safeToSpend (monthlyRemaining minus manual savings set aside this month)
- "How much should I save?" → savings.analysis.amountAvailableToSave (same as safeToSpend)
- "If I save RM X, how much can I spend?" → reverse calculation above (monthlyRemaining − X), not safeToSpend and not savings.goal
- "What budget should I set for X?", "How much budget for Shopping?" → budgetRecommendations for that category; works even with zero spending in X

Key definitions:
- monthlyRemaining: salary − paidExpenses − upcomingDebt — use for balance/remaining questions
- safeToSpend / stats.safeToSpend: monthlyRemaining minus manual savings set aside — use for spending and affordability
- savings.analysis.amountAvailableToSave: same as safeToSpend — use for savings-capacity questions
- budgetRecommendations: suggested monthly limits per category (from spending +10% buffer, or Malaysian income benchmarks when no data)
- availableCategories: all categories the user can budget for
- potentialSavings / potentialSavingsFromCuts: 15% heuristic on large categories — a cut target, NOT the same as amountAvailableToSave
- savings.balance / savings.goal / savings.progressPercent: savings jar (already saved) and long-term target — separate from monthly capacity; never treat savings.goal as a stand-in for a monthly savings amount the user mentions in a question
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
- Lead with a direct answer, not a windup — but write it like you're texting a friend back, not filing a report
- For numeric/advice questions, a short breakdown (2–4 bullets or a small table) and a practical next step usually help — but skip bullets/next-step for simple, casual, or clarifying replies where a sentence or two is more natural
- Don't force the same shape onto every message — real conversations don't have a rigid template
- Bold RM amounts when they're the point of the answer, not on every number in every sentence
- Keep under ~120 words unless the user asks for detail

Follow-ups:
- Use conversation history for follow-ups ("why hold off?", "explain that")
- Must be 3 short questions tied to the user's situation (not generic)

Output format (critical — followed by a program, not a person):
- Write your reply as plain markdown text — no surrounding JSON, no code fences around the reply itself
- When the reply is completely finished, output the marker ${FOLLOWUPS_MARKER} on its own line
- Immediately after that marker, output ONLY a valid JSON array of exactly 3 short follow-up question strings — nothing before it, nothing after it, no code fences, no trailing commentary

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

function createModel(context) {
  if (!isGeminiConfigured()) {
    const error = new Error('Gemini API key not configured');
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
  return genAI.getGenerativeModel({
    model: process.env.AI_MODEL?.trim() || DEFAULT_MODEL,
    systemInstruction: buildSystemPrompt(context),
    generationConfig: {
      temperature: 0.65,
      topP: 0.9,
    },
  });
}

function extractFollowUps(raw) {
  if (!raw || !raw.trim()) return [];

  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) text = fenceMatch[1].trim();

  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) return [];

  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((q) => typeof q === 'string' && q.trim()).slice(0, 3);
  } catch {
    return [];
  }
}

/**
 * Splits a growing Gemini text stream into "content" deltas (forwarded via onDelta
 * as they arrive) and a trailing FOLLOWUPS_MARKER + JSON array (buffered, parsed on finish()).
 * Holds back the last `marker.length - 1` chars of content at all times so a marker
 * split across two stream chunks is never leaked into the emitted content.
 */
function createResponseSplitter(onDelta) {
  const holdback = FOLLOWUPS_MARKER.length - 1;
  let buffer = '';
  let followUpsRaw = '';
  let inFollowUps = false;

  function push(chunkText) {
    if (inFollowUps) {
      followUpsRaw += chunkText;
      return;
    }

    buffer += chunkText;
    const markerIndex = buffer.indexOf(FOLLOWUPS_MARKER);

    if (markerIndex !== -1) {
      const safeContent = buffer.slice(0, markerIndex);
      if (safeContent) onDelta(safeContent);
      followUpsRaw = buffer.slice(markerIndex + FOLLOWUPS_MARKER.length);
      buffer = '';
      inFollowUps = true;
      return;
    }

    if (buffer.length > holdback) {
      const emitLength = buffer.length - holdback;
      onDelta(buffer.slice(0, emitLength));
      buffer = buffer.slice(emitLength);
    }
  }

  function finish() {
    if (!inFollowUps && buffer) {
      onDelta(buffer);
      buffer = '';
    }
    return { followUps: extractFollowUps(followUpsRaw) };
  }

  return { push, finish };
}

export async function streamFinancialChat({ messages, context }, onDelta, { isAborted } = {}) {
  const model = createModel(context);

  const sanitized = sanitizeMessages(messages);
  if (!sanitized.length || sanitized[sanitized.length - 1].role !== 'user') {
    throw new Error('Last message must be from user');
  }

  const lastUser = sanitized[sanitized.length - 1];
  const chat = model.startChat({ history: toGeminiHistory(sanitized) });
  const splitter = createResponseSplitter(onDelta);

  try {
    const result = await chat.sendMessageStream(lastUser.content);
    for await (const chunk of result.stream) {
      if (isAborted?.()) break;
      const text = chunk.text();
      if (text) splitter.push(text);
    }
  } catch (error) {
    throw wrapGeminiError(error);
  }

  return splitter.finish();
}

export async function generateFinancialChat({ messages, context }) {
  let content = '';
  const { followUps } = await streamFinancialChat({ messages, context }, (delta) => {
    content += delta;
  });
  return { content: content.trim(), followUps };
}

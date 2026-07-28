import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const DEFAULT_MODEL = 'gemini-2.0-flash';
const MAX_HISTORY = 20;
const MAX_MESSAGE_LENGTH = 4000;

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function buildSystemPrompt(context) {
  return `You are Auvia AI, a personal finance assistant for a Malaysian user. Currency is RM (MYR).

Use ONLY the numbers in FINANCIAL_CONTEXT. Never invent balances, totals, or savings figures.
If data is missing, say so — do not guess.

Definitions:
- safeBalance / savings.analysis.amountAvailableToSave: money left this month after paid expenses, upcoming bills, and manual savings set aside — this is how much you CAN save now
- savings.analysis: precomputed breakdown (salary, expenses, upcoming bills, amountAvailableToSave). Use these numbers directly.
- If the user states a salary (e.g. RM3700), recalculate: statedSalary - paidExpenses - upcomingBills - manualSavingsSetAside using expenses/bills from context (or use savings.analysis with that salary)
- potentialSavings / potentialSavingsFromCuts: heuristic = sum of 15% of each category with spending > RM100 — extra if they trim spending, NOT the same as amountAvailableToSave
- savings.balance / savings.goal: user's savings jar (already saved), separate from monthly capacity
- healthScore: 0–100 score from income, expenses, debts, and safe balance

Respond in concise markdown. Use **bold** for amounts and key terms.
When the user asks follow-up questions (e.g. "why hold off?", "explain that"), use conversation history plus FINANCIAL_CONTEXT to explain prior advice with specific numbers.
Return JSON with "content" (markdown reply) and "followUps" (3 short follow-up questions).

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
  const result = await chat.sendMessage(lastUser.content);
  const text = result.response.text();

  return parseJsonResponse(text);
}

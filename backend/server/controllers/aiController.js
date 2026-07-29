import { validateAiChatRequest } from '../schemas/aiChatSchema.js';
import { streamFinancialChat, isGeminiConfigured } from '../services/aiService.js';
import { setAiCors, resolveUserId } from '../middleware/authMiddleware.js';
import { isAdminIdentity } from '../middleware/adminMiddleware.js';
import { withErrorHandling } from '../middleware/errorMiddleware.js';
import { parseRequestBody } from '../utils/requestBody.js';
import { logger } from '../utils/logger.js';
import { flattenApiError } from '../utils/errorText.js';
import { getDb } from '../config/mongodb.js';
import { AiUsageRepository } from '../repositories/aiUsageRepository.js';

const HEARTBEAT_INTERVAL_MS = 15_000;
const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 3;

async function checkDailyLimit(req) {
  if (req.isAdmin || !process.env.MONGODB_URI) return { allowed: true };

  try {
    const db = await getDb();
    return await new AiUsageRepository(db).incrementAndCheck(req.userId, AI_DAILY_LIMIT);
  } catch (error) {
    logger.warn('AI usage check failed — allowing request:', flattenApiError(error));
    return { allowed: true };
  }
}

export async function postAiChat(req, res) {
  if (!isGeminiConfigured()) {
    return res.status(503).json({
      error: 'AI not configured',
      fallback: true,
      message: 'Set GEMINI_API_KEY in environment variables',
    });
  }

  const body = parseRequestBody(req);
  const validationErrors = validateAiChatRequest(body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Invalid request', details: validationErrors });
  }

  const { allowed } = await checkDailyLimit(req);
  if (!allowed) {
    return res.status(429).json({
      error: 'Daily AI limit reached',
      fallback: true,
      message: `Daily AI limit reached (${AI_DAILY_LIMIT}/day).`,
    });
  }

  const { messages, context } = body;

  let aborted = false;
  req.on('close', () => {
    aborted = true;
  });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendEvent = (eventName, payload) => {
    if (aborted) return;
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  const heartbeat = setInterval(() => {
    if (aborted) return;
    res.write(': keepalive\n\n');
  }, HEARTBEAT_INTERVAL_MS);

  try {
    const { followUps } = await streamFinancialChat(
      { messages, context },
      (text) => sendEvent('delta', { text }),
      { isAborted: () => aborted }
    );
    if (!aborted) sendEvent('done', { followUps });
  } catch (error) {
    if (error.code === 'AI_RATE_LIMITED') {
      logger.warn('Gemini rate limit — client falls back to offline replies', {
        retryAfterSeconds: error.retryAfterSeconds,
      });
      sendEvent('error', {
        error: 'Gemini rate limit reached',
        fallback: true,
        retryAfterSeconds: error.retryAfterSeconds ?? 60,
      });
    } else {
      logger.error('AI stream error:', flattenApiError(error));
      sendEvent('error', {
        error: 'AI request failed',
        fallback: true,
      });
    }
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
}

export async function handleAiChat(req, res) {
  setAiCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId, unauthorized, email } = await resolveUserId(req);
  if (unauthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.userId = userId;
  req.isAdmin = isAdminIdentity({ uid: userId, email });

  return withErrorHandling(res, async () => {
    if (req.method === 'POST') return postAiChat(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  });
}

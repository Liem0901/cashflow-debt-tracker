import { validateAiChatRequest } from '../schemas/aiChatSchema.js';
import { generateFinancialChat, isGeminiConfigured } from '../services/aiService.js';
import { setAiCors, resolveUserId } from '../middleware/authMiddleware.js';
import { withErrorHandling } from '../middleware/errorMiddleware.js';
import { parseRequestBody } from '../utils/requestBody.js';
import { logger } from '../utils/logger.js';

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

  const { messages, context } = body;

  try {
    const result = await generateFinancialChat({ messages, context });
    return res.status(200).json(result);
  } catch (error) {
    if (error.code === 'AI_RATE_LIMITED') {
      logger.warn('Gemini rate limit — falling back to offline replies', {
        retryAfterSeconds: error.retryAfterSeconds,
      });
      return res.status(429).json({
        error: 'Gemini rate limit reached',
        fallback: true,
        retryAfterSeconds: error.retryAfterSeconds ?? 60,
      });
    }
    throw error;
  }
}

export async function handleAiChat(req, res) {
  setAiCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId, unauthorized } = await resolveUserId(req);
  if (unauthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.userId = userId;

  return withErrorHandling(res, async () => {
    if (req.method === 'POST') return postAiChat(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  });
}

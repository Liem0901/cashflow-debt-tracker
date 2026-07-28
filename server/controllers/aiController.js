import { validateAiChatRequest } from '../schemas/aiChatSchema.js';
import { generateFinancialChat, isGeminiConfigured } from '../services/aiService.js';
import { setAiCors, resolveUserId } from '../middleware/authMiddleware.js';
import { withErrorHandling } from '../middleware/errorMiddleware.js';

export async function postAiChat(req, res) {
  if (!isGeminiConfigured()) {
    return res.status(503).json({
      error: 'AI not configured',
      fallback: true,
      message: 'Set GEMINI_API_KEY in environment variables',
    });
  }

  const validationErrors = validateAiChatRequest(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Invalid request', details: validationErrors });
  }

  const { messages, context } = req.body;
  const result = await generateFinancialChat({ messages, context });

  return res.status(200).json(result);
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

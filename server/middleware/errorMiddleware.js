import { logger } from '../utils/logger.js';

export async function withErrorHandling(res, handler) {
  try {
    return await handler();
  } catch (error) {
    logger.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

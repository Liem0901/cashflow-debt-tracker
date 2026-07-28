import { logger } from '../utils/logger.js';

function isMongoConnectivityError(error) {
  const name = error?.name || '';
  return (
    name === 'MongoServerSelectionError' ||
    name === 'MongoNetworkError' ||
    name === 'MongoTimeoutError'
  );
}

export async function withErrorHandling(res, handler) {
  try {
    return await handler();
  } catch (error) {
    logger.error('API error:', error);

    if (isMongoConnectivityError(error)) {
      return res.status(503).json({
        error: 'Database unavailable',
        message:
          'Could not reach MongoDB. Check Atlas Network Access allows 0.0.0.0/0 for Vercel.',
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}

import { logger } from '../utils/logger.js';

function isMongoConnectivityError(error) {
  const name = error?.name || '';
  return (
    name === 'MongoServerSelectionError' ||
    name === 'MongoNetworkError' ||
    name === 'MongoTimeoutError'
  );
}

function isMongoDuplicateKeyError(error) {
  return error?.code === 11000 || error?.code === 11001;
}

export async function withErrorHandling(res, handler) {
  try {
    return await handler();
  } catch (error) {
    logger.error('API error:', error?.message || error, error?.code ? { code: error.code } : '');

    if (isMongoConnectivityError(error)) {
      return res.status(503).json({
        error: 'Database unavailable',
        message:
          'Could not reach MongoDB. Check Atlas Network Access allows 0.0.0.0/0 for Vercel.',
      });
    }

    if (isMongoDuplicateKeyError(error)) {
      return res.status(400).json({
        error: 'Duplicate record ids',
        message: 'Some items were missing unique ids. Refresh the page and try again.',
      });
    }

    if (error?.name === 'MongoServerError' || error?.name === 'MongoError') {
      return res.status(500).json({ error: 'Database error' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}

import { logger } from '../utils/logger.js';
import { flattenApiError } from '../utils/errorText.js';

function isMongoSslError(error) {
  const flat = flattenApiError(error);
  return (
    flat.includes('ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR') ||
    flat.includes('tlsv1 alert internal error') ||
    flat.includes('SSL routines')
  );
}

function isMongoConnectivityError(error) {
  const name = error?.name || '';
  const flat = flattenApiError(error);

  return (
    name === 'MongoServerSelectionError' ||
    name === 'MongoNetworkError' ||
    name === 'MongoTimeoutError' ||
    isMongoSslError(error) ||
    /MONGODB_URI not configured/i.test(flat) ||
    /MongoDB client unavailable/i.test(flat) ||
    /reading 'db'/i.test(flat)
  );
}

function isMongoDuplicateKeyError(error) {
  return error?.code === 11000 || error?.code === 11001;
}

export async function withErrorHandling(res, handler) {
  try {
    return await handler();
  } catch (error) {
    logger.error('API error:', flattenApiError(error));

    if (isMongoConnectivityError(error)) {
      const sslHint = isMongoSslError(error)
        ? 'Atlas often returns this SSL error when Vercel IPs are blocked — open Network Access and allow 0.0.0.0/0.'
        : 'Check Atlas Network Access allows 0.0.0.0/0 for Vercel.';

      return res.status(503).json({
        error: 'Database unavailable',
        message: `Could not reach MongoDB. ${sslHint}`,
      });
    }

    if (isMongoDuplicateKeyError(error)) {
      return res.status(400).json({
        error: 'Duplicate record ids',
        message: 'Some items were missing unique ids. Refresh the page and try again.',
      });
    }

    if (error instanceof TypeError && /reading 'db'|MongoDB client/i.test(String(error.message))) {
      return res.status(503).json({
        error: 'Database unavailable',
        message:
          'MongoDB connection failed. Check Atlas Network Access allows 0.0.0.0/0, then redeploy and retry.',
      });
    }

    if (error?.name === 'MongoServerError' || error?.name === 'MongoError') {
      return res.status(500).json({
        error: 'Database error',
        message: 'MongoDB rejected the request. Check Atlas cluster status and credentials.',
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong on the server. Check Vercel function logs for details.',
    });
  }
}

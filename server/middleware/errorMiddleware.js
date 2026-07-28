import { logger } from '../utils/logger.js';

function flattenError(error) {
  const parts = [];
  let current = error;

  while (current) {
    if (current.message) parts.push(String(current.message));
    if (current.code) parts.push(String(current.code));
    if (current.name) parts.push(String(current.name));
    current = current.cause;
  }

  return parts.join(' ');
}

function isMongoSslError(error) {
  const flat = flattenError(error);
  return (
    flat.includes('ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR') ||
    flat.includes('tlsv1 alert internal error') ||
    flat.includes('SSL routines')
  );
}

function isMongoConnectivityError(error) {
  const name = error?.name || '';
  const flat = flattenError(error);

  return (
    name === 'MongoServerSelectionError' ||
    name === 'MongoNetworkError' ||
    name === 'MongoTimeoutError' ||
    isMongoSslError(error) ||
    /MONGODB_URI not configured/i.test(flat) ||
    /MongoDB client unavailable/i.test(flat)
  );
}

function isMongoDuplicateKeyError(error) {
  return error?.code === 11000 || error?.code === 11001;
}

export async function withErrorHandling(res, handler) {
  try {
    return await handler();
  } catch (error) {
    logger.error('API error:', flattenError(error));

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

    if (error instanceof TypeError && String(error.message).includes("'db'")) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB connection failed. Retry in a few seconds.',
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

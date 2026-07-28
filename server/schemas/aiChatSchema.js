const MAX_CONTEXT_BYTES = 32_000;

export function validateAiChatRequest(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return ['Request body required'];
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    errors.push('messages must be a non-empty array');
  } else {
    for (const [index, message] of body.messages.entries()) {
      if (!message || typeof message !== 'object') {
        errors.push(`messages[${index}] must be an object`);
        continue;
      }
      if (message.role !== 'user' && message.role !== 'assistant') {
        errors.push(`messages[${index}].role must be user or assistant`);
      }
      if (typeof message.content !== 'string' || !message.content.trim()) {
        errors.push(`messages[${index}].content must be a non-empty string`);
      }
    }
  }

  if (!body.context || typeof body.context !== 'object') {
    errors.push('context must be an object');
  } else {
    try {
      const size = JSON.stringify(body.context).length;
      if (size > MAX_CONTEXT_BYTES) {
        errors.push('context is too large');
      }
    } catch {
      errors.push('context must be JSON-serializable');
    }
  }

  return errors;
}

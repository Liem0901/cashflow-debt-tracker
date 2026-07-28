const CHAT_KEY_PREFIX = 'cashflow_ai_chat';
export const MAX_STORED_CHAT_MESSAGES = 50;

/** In-memory only — survives SPA navigation, clears on full page reload. */
const memorySessions = new Map();

export function getChatStorageKey(userId = 'default-user') {
  return `${CHAT_KEY_PREFIX}_${userId}`;
}

export function readChatSession(userId) {
  const key = getChatStorageKey(userId);
  return memorySessions.get(key) ?? { messages: [], followUps: [] };
}

export function writeChatSession(userId, session) {
  memorySessions.set(getChatStorageKey(userId), {
    messages: Array.isArray(session.messages) ? session.messages : [],
    followUps: Array.isArray(session.followUps) ? session.followUps : [],
  });
}

export function clearChatSession(userId) {
  memorySessions.delete(getChatStorageKey(userId));
}

export function hasChatHistory(userId) {
  return readChatSession(userId).messages.length > 0;
}

export function toStoredMessages(messages) {
  return messages
    .filter((message) => message.role === 'user' || message.done)
    .slice(-MAX_STORED_CHAT_MESSAGES)
    .map(({ role, content, id }) => ({ role, content, id, done: true }));
}

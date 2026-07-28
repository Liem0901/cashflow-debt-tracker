const CHAT_KEY_PREFIX = 'cashflow_ai_chat';
export const MAX_STORED_CHAT_MESSAGES = 50;

export function getChatStorageKey(userId = 'default-user') {
  return `${CHAT_KEY_PREFIX}_${userId}`;
}

export function readChatSession(userId) {
  try {
    const raw = window.localStorage.getItem(getChatStorageKey(userId));
    if (!raw) return { messages: [], followUps: [] };

    const parsed = JSON.parse(raw);
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      followUps: Array.isArray(parsed.followUps) ? parsed.followUps : [],
    };
  } catch {
    return { messages: [], followUps: [] };
  }
}

export function writeChatSession(userId, session) {
  try {
    window.localStorage.setItem(getChatStorageKey(userId), JSON.stringify(session));
  } catch (error) {
    console.warn('Chat history save failed:', error);
  }
}

export function clearChatSession(userId) {
  try {
    window.localStorage.removeItem(getChatStorageKey(userId));
  } catch (error) {
    console.warn('Chat history clear failed:', error);
  }
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

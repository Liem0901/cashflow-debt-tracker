import { useState, useEffect, useCallback } from 'react';
import {
  readChatSession,
  writeChatSession,
  clearChatSession,
  toStoredMessages,
  getChatStorageKey,
} from '../utils/chatStorage';

function attachFollowUpsToMessages(messages, followUps) {
  if (!followUps.length || !messages.length) return messages;

  const lastIndex = messages.length - 1;
  if (messages[lastIndex].role !== 'assistant') return messages;

  return messages.map((message, index) =>
    index === lastIndex ? { ...message, followUps } : message
  );
}

function loadChatSession(userId) {
  const session = readChatSession(userId);
  return {
    messages: attachFollowUpsToMessages(session.messages, session.followUps),
    followUps: session.followUps,
  };
}

export function useChatHistory(userId) {
  const [messages, setMessages] = useState(() => loadChatSession(userId).messages);
  const [followUps, setFollowUps] = useState(() => loadChatSession(userId).followUps);
  useEffect(() => {
    try {
      window.localStorage.removeItem(getChatStorageKey(userId));
    } catch {
      // ignore legacy cleanup
    }

    const session = loadChatSession(userId);
    setMessages(session.messages);
    setFollowUps(session.followUps);  }, [userId]);

  useEffect(() => {
    const storedMessages = toStoredMessages(messages);
    if (storedMessages.length === 0 && followUps.length === 0) {
      clearChatSession(userId);
      return;
    }

    writeChatSession(userId, {
      messages: storedMessages,
      followUps,
    });
  }, [messages, followUps, userId]);

  const clearChat = useCallback(() => {
    clearChatSession(userId);
    setMessages([]);
    setFollowUps([]);
  }, [userId]);

  return {
    messages,
    setMessages,
    followUps,
    setFollowUps,
    clearChat,
  };
}

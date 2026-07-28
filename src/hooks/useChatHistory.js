import { useState, useEffect, useCallback } from 'react';
import {
  readChatSession,
  writeChatSession,
  clearChatSession,
  toStoredMessages,
} from '../utils/chatStorage';

export function useChatHistory(userId) {
  const [messages, setMessages] = useState(() => readChatSession(userId).messages);
  const [followUps, setFollowUps] = useState(() => readChatSession(userId).followUps);

  useEffect(() => {
    const session = readChatSession(userId);
    setMessages(session.messages);
    setFollowUps(session.followUps);
  }, [userId]);

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

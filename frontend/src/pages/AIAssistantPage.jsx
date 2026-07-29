import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRegisterAINewChat } from '../context/AIChatActionsContext';
import { useChatHistory } from '../hooks/useChatHistory';
import { hasChatHistory } from '../utils/chatStorage';
import AILandingHero from '../components/ai/AILandingHero';
import ChatInterface from '../components/ai/ChatInterface';

export default function AIAssistantPage() {
  const { user } = useAuth();
  const userId = user?.uid || 'default-user';
  const chat = useChatHistory(userId);
  const [conversationStarted, setConversationStarted] = useState(() => hasChatHistory(userId));
  const [prompt, setPrompt] = useState(null);
  const handledPromptRef = useRef(null);

  useEffect(() => {
    setConversationStarted(hasChatHistory(userId));
    handledPromptRef.current = null;
    setPrompt(null);
  }, [userId]);

  useEffect(() => {
    if (chat.messages.length > 0) {
      setConversationStarted(true);
    }
  }, [chat.messages.length]);

  const handleQuickAction = (label) => {
    if (handledPromptRef.current === label) return;
    setConversationStarted(true);
    setPrompt(label);
  };

  const handleInitialPromptHandled = useCallback(() => {
    setPrompt(null);
  }, []);

  const handleNewChat = useCallback(() => {
    handledPromptRef.current = null;
    chat.clearChat();
    setConversationStarted(false);
    setPrompt(null);
  }, [chat.clearChat]);

  useRegisterAINewChat(handleNewChat);

  const handleConversationStart = () => {
    setConversationStarted(true);
  };

  return (
    <div className="ai-page-shell flex h-full min-h-0 flex-col overflow-hidden">
      {!conversationStarted ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <AILandingHero onPrimaryAction={handleQuickAction} />
        </div>
      ) : null}

      <ChatInterface        mode={conversationStarted ? 'active' : 'landing'}
        onConversationStart={handleConversationStart}
        initialPrompt={prompt}
        onInitialPromptHandled={handleInitialPromptHandled}
        handledPromptRef={handledPromptRef}
        messages={chat.messages}
        setMessages={chat.setMessages}
        setFollowUps={chat.setFollowUps}
      />
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChatHistory } from '../hooks/useChatHistory';
import { hasChatHistory } from '../utils/chatStorage';
import AIAssistantHeader from '../components/ai/AIAssistantHeader';
import AILandingHero from '../components/ai/AILandingHero';
import ChatInterface from '../components/ai/ChatInterface';

export default function AIAssistantPage() {
  const { user } = useAuth();
  const userId = user?.uid || 'default-user';
  const chat = useChatHistory(userId);
  const [conversationStarted, setConversationStarted] = useState(() => hasChatHistory(userId));
  const [prompt, setPrompt] = useState(null);
  const promptSent = useRef(false);

  useEffect(() => {
    setConversationStarted(hasChatHistory(userId));
    promptSent.current = false;
    setPrompt(null);
  }, [userId]);

  const handleQuickAction = (label) => {
    if (promptSent.current) return;
    promptSent.current = true;
    setConversationStarted(true);
    setPrompt(label);
  };

  const handleNewChat = () => {
    promptSent.current = false;
    chat.clearChat();
    setConversationStarted(false);
    setPrompt(null);
  };

  const handleConversationStart = () => {
    setConversationStarted(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AIAssistantHeader onNewChat={handleNewChat} compact={conversationStarted} />

      {!conversationStarted ? <AILandingHero onPrimaryAction={handleQuickAction} /> : null}

      <div className={conversationStarted ? 'flex min-h-0 flex-1 flex-col' : 'shrink-0'}>
        <ChatInterface
          mode={conversationStarted ? 'active' : 'landing'}
          onConversationStart={handleConversationStart}
          initialPrompt={prompt}
          messages={chat.messages}
          setMessages={chat.setMessages}
          followUps={chat.followUps}
          setFollowUps={chat.setFollowUps}
        />
      </div>
    </div>
  );
}

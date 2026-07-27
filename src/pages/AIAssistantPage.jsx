import { useState, useRef } from 'react';
import AIAssistantHeader from '../components/ai/AIAssistantHeader';
import AILandingHero from '../components/ai/AILandingHero';
import ChatInterface from '../components/ai/ChatInterface';

export default function AIAssistantPage() {
  const [conversationStarted, setConversationStarted] = useState(false);
  const [prompt, setPrompt] = useState(null);
  const [chatKey, setChatKey] = useState(0);
  const promptSent = useRef(false);

  const handleQuickAction = (label) => {
    if (promptSent.current) return;
    promptSent.current = true;
    setConversationStarted(true);
    setPrompt(label);
  };

  const handleNewChat = () => {
    promptSent.current = false;
    setConversationStarted(false);
    setPrompt(null);
    setChatKey((k) => k + 1);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AIAssistantHeader onNewChat={handleNewChat} compact={conversationStarted} />

      {!conversationStarted ? <AILandingHero onPrimaryAction={handleQuickAction} /> : null}

      <div className={conversationStarted ? 'flex min-h-0 flex-1 flex-col' : 'shrink-0'}>
        <ChatInterface
          key={chatKey}
          mode={conversationStarted ? 'active' : 'landing'}
          onConversationStart={() => setConversationStarted(true)}
          initialPrompt={prompt}
        />
      </div>
    </div>
  );
}

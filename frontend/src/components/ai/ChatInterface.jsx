import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiSend } from '@mdi/js';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { generateFinancialResponse, streamText } from '../../hooks/useFinancialAI';
import { sendAiChat } from '../../services/aiApi';
import { buildAIChatContext } from '../../utils/buildAIChatContext';
import { AI_BRAND_NAME } from '../../constants/aiBrand';
import ChatMessage from './ChatMessage';

export default function ChatInterface({
  onConversationStart,
  initialPrompt,
  onInitialPromptHandled,
  handledPromptRef,
  mode = 'landing',
  messages,
  setMessages,
  setFollowUps,
}) {
  const { data, monthKey } = useApp();
  const { getIdToken, isGuest, isLocalOnly, user } = useAuth();
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);
  const isActive = mode === 'active';

  useEffect(() => {
    if (!isActive) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming, isActive]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    onConversationStart?.();
    setFollowUps([]);
    setMessages((prev) => prev.map((m) => ({ ...m, followUps: undefined })));
    const userMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setStreaming(true);

    let content;
    let chips = [];

    const canUseGemini = !isLocalOnly && !isGuest && user;

    if (canUseGemini) {
      try {
        const context = buildAIChatContext(data, monthKey);
        const apiMessages = nextMessages.map(({ role, content: messageContent }) => ({
          role,
          content: messageContent,
        }));
        const response = await sendAiChat({
          messages: apiMessages,
          context,
          getIdToken,
        });
        content = response.content;
        chips = response.followUps;
      } catch (error) {
        console.warn('AI API fallback:', error);
      }
    }

    if (!content) {
      const fallback = generateFinancialResponse(
        trimmed,
        data,
        monthKey,
        nextMessages.slice(0, -1)
      );
      content = fallback.content;
      chips = fallback.followUps;
    }

    const assistantId = Date.now();
    setMessages((prev) => [...prev, { role: 'assistant', content: '', id: assistantId }]);

    streamText(
      content,
      (partial) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: partial } : m))
        );
      },
      () => {
        setStreaming(false);
        setFollowUps(chips);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content, done: true, followUps: chips }
              : m.role === 'assistant'
                ? { ...m, followUps: undefined }
                : m
          )
        );
      }
    );
  };

  useEffect(() => {
    if (!initialPrompt || handledPromptRef?.current === initialPrompt) return;

    handledPromptRef.current = initialPrompt;
    sendMessage(initialPrompt);
    onInitialPromptHandled?.(initialPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const lastAssistantMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.role === 'assistant' && message.done) {
        return message.id;
      }
    }
    return null;
  }, [messages]);

  return (
    <div className={`flex min-h-0 flex-col ${isActive ? 'flex-1' : 'shrink-0'}`}>
      {isActive ? (
        <div
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-2 pt-3"
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-portfolio-gray">Starting conversation…</p>
          ) : null}
          <AnimatePresence>
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id || index}
                role={msg.role}
                content={msg.content}
                isStreaming={streaming && msg.role === 'assistant' && !msg.done}
                showActions={msg.role === 'assistant' && msg.done && msg.id === lastAssistantMessageId}
                followUps={msg.id === lastAssistantMessageId ? msg.followUps : undefined}
                onFollowUpClick={sendMessage}
              />
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-portfolio-border/80 bg-black/90 px-4 py-3 backdrop-blur-xl"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-portfolio-border bg-portfolio-elevated/90 p-2 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Attach file"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-portfolio-gray hover:bg-portfolio-muted hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a2.25 2.25 0 003.182 3.182l7.693-7.693" />
            </svg>
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about your finances…"
            rows={1}
            className="max-h-24 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-sm text-white placeholder:text-portfolio-gray focus:outline-none"
            aria-label={`Message to ${AI_BRAND_NAME}`}
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black transition-transform hover:scale-105 disabled:opacity-40"
          >
            <Icon path={mdiSend} size={1} className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

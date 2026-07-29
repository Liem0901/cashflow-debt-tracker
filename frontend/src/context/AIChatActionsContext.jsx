import { createContext, useCallback, useContext, useEffect, useRef } from 'react';

const AIChatActionsContext = createContext(null);

export function AIChatActionsProvider({ children }) {
  const newChatRef = useRef(null);

  const registerNewChatHandler = useCallback((handler) => {
    newChatRef.current = handler;
    return () => {
      if (newChatRef.current === handler) {
        newChatRef.current = null;
      }
    };
  }, []);

  const triggerNewChat = useCallback(() => {
    newChatRef.current?.();
  }, []);

  return (
    <AIChatActionsContext.Provider value={{ registerNewChatHandler, triggerNewChat }}>
      {children}
    </AIChatActionsContext.Provider>
  );
}

export function useAIChatActions() {
  const context = useContext(AIChatActionsContext);
  if (!context) {
    throw new Error('useAIChatActions must be used within AIChatActionsProvider');
  }
  return context;
}

export function useRegisterAINewChat(handler) {
  const { registerNewChatHandler } = useAIChatActions();

  useEffect(() => registerNewChatHandler(handler), [registerNewChatHandler, handler]);
}

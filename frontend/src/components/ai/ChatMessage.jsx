import { motion } from 'framer-motion';
import { AI_BRAND_SHORT } from '../../constants/aiBrand';
import MarkdownText from './MarkdownText';

function TypingIndicator() {
  return (
    <div className="flex gap-1 px-1 py-2" aria-label={`${AI_BRAND_SHORT} is typing`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-portfolio-gray"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function ChatMessage({
  role,
  content,
  isStreaming,
  showActions,
  followUps,
  onFollowUpClick,
}) {  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[88%] min-w-0 rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-white text-black'
            : 'border border-portfolio-border bg-portfolio-card/90 backdrop-blur-sm'
        }`}
      >
        {!isUser && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-portfolio-gray">
            {AI_BRAND_SHORT}
          </p>
        )}
        {isStreaming && !content ? (
          <TypingIndicator />
        ) : isUser ? (
          <p className="text-sm leading-relaxed">{content}</p>
        ) : (
          <MarkdownText content={content} />
        )}

        {!isUser && showActions && content && !isStreaming && followUps?.length > 0 ? (
          <div className="mt-3 min-w-0 border-t border-portfolio-border pt-3">
            <div className="grid min-w-0 grid-cols-1 gap-2">
              {followUps.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onFollowUpClick?.(label)}
                  className="w-full min-w-0 rounded-full border border-portfolio-border bg-portfolio-elevated px-3 py-2 text-center text-xs leading-snug text-portfolio-light whitespace-normal transition-colors hover:border-white/30 hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>    </motion.div>
  );
}

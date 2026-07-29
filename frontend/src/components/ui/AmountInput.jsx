import { useCallback, useRef } from 'react';
import {
  appendDigit,
  centsToDisplay,
  deleteDigit,
  parsePastedAmount,
} from '../../utils/amountInput';

export default function AmountInput({
  cents,
  onCentsChange,
  className,
  autoFocus,
  onValueChange,
  sizeToContent = false,
  minWidthCh = 4,
}) {
  const display = centsToDisplay(cents);
  const handledRef = useRef(false);
  const contentWidth = `${Math.max(display.length, minWidthCh)}ch`;

  const applyDigit = useCallback(
    (digit) => {
      onCentsChange((current) => appendDigit(current, digit));
      onValueChange?.();
    },
    [onCentsChange, onValueChange],
  );

  const applyBackspace = useCallback(() => {
    onCentsChange((current) => deleteDigit(current));
    onValueChange?.();
  }, [onCentsChange, onValueChange]);

  const handleBeforeInput = useCallback(
    (e) => {
      handledRef.current = false;

      if (e.inputType === 'insertText' && e.data && /^\d$/.test(e.data)) {
        e.preventDefault();
        applyDigit(Number(e.data));
        handledRef.current = true;
        return;
      }

      if (e.inputType === 'deleteContentBackward') {
        e.preventDefault();
        applyBackspace();
        handledRef.current = true;
      }
    },
    [applyDigit, applyBackspace],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (handledRef.current) {
        handledRef.current = false;
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        applyDigit(Number(e.key));
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        applyBackspace();
      }
    },
    [applyDigit, applyBackspace],
  );

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      onCentsChange(parsePastedAmount(e.clipboardData.getData('text')));
      onValueChange?.();
    },
    [onCentsChange, onValueChange],
  );

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onBeforeInput={handleBeforeInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onChange={() => {}}
      className={`amount-input ${className ?? ''}`}
      style={sizeToContent ? { width: contentWidth } : undefined}
      autoFocus={autoFocus}
      aria-label="Amount"
    />
  );
}

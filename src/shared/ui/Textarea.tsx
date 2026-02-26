import * as React from 'react';
import TextField from '@mui/material/TextField';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const BULLET_LINE_RE = /^(\s*)([-*•●▪◦])\s+/;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  ...props
}, ref) => {
  const { rows, onKeyDown, ...rest } = props;

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event as React.KeyboardEvent<HTMLTextAreaElement>);
    if (event.defaultPrevented) {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }

    const value = target.value;
    const cursor = target.selectionStart;
    const selectionEnd = target.selectionEnd;
    if (cursor === null || selectionEnd === null) {
      return;
    }

    if (event.key === ' ' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
      if (cursor !== selectionEnd) {
        return;
      }
      const lineStart = value.lastIndexOf('\n', Math.max(0, cursor - 1)) + 1;
      const line = value.slice(lineStart, cursor);
      if (line === '-' || line === '*') {
        event.preventDefault();
        target.setRangeText('• ', lineStart, cursor, 'end');
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }

    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if (cursor !== selectionEnd) {
      return;
    }
    const lineStart = value.lastIndexOf('\n', Math.max(0, cursor - 1)) + 1;
    const line = value.slice(lineStart, cursor);
    const match = line.match(BULLET_LINE_RE);
    if (!match) {
      return;
    }

    const bulletPrefix = `${match[1]}${match[2]} `;
    const lineContent = line.slice(bulletPrefix.length).trim();
    event.preventDefault();

    const insertText = lineContent.length > 0 ? `\n${bulletPrefix}` : '\n';
    target.setRangeText(insertText, cursor, cursor, 'end');
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }, [onKeyDown]);

  return (
    <TextField
      multiline
      minRows={rows ?? 4}
      fullWidth
      size="small"
      variant="outlined"
      className={className}
      inputRef={ref}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  );
});

Textarea.displayName = 'Textarea';

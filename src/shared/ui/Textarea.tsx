import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  const { rows, ...rest } = props;

  return (
    <OutlinedInput
      inputRef={ref}
      multiline
      minRows={rows ?? 4}
      fullWidth
      className={cn(
        'ui-textarea',
        className,
      )}
      {...rest}
    />
  );
});

Textarea.displayName = 'Textarea';

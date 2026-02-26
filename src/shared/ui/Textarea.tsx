import * as React from 'react';
import TextField from '@mui/material/TextField';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  ...props
}, ref) => {
  const { rows, ...rest } = props;

  return (
    <TextField
      multiline
      minRows={rows ?? 4}
      fullWidth
      size="small"
      variant="outlined"
      className={className}
      inputRef={ref}
      {...rest}
    />
  );
});

Textarea.displayName = 'Textarea';

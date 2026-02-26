import * as React from 'react';
import TextField from '@mui/material/TextField';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  ...props
}, ref) => {
  const { list, min, max, step, inputMode, ...rest } = props;

  return (
    <TextField
      size="small"
      fullWidth
      variant="outlined"
      className={className}
      inputRef={ref}
      inputProps={{ list, min, max, step, inputMode }}
      {...rest}
    />
  );
});

Input.displayName = 'Input';

import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  const { list, min, max, step, inputMode, ...rest } = props;

  return (
    <OutlinedInput
      inputRef={ref}
      size="small"
      fullWidth
      className={cn(
        'ui-input',
        className,
      )}
      inputProps={{ list, min, max, step, inputMode }}
      {...rest}
    />
  );
});

Input.displayName = 'Input';

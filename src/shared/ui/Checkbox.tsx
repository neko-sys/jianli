import * as React from 'react';
import CheckboxMui, { type CheckboxProps as MuiCheckboxProps } from '@mui/material/Checkbox';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends MuiCheckboxProps {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => {
  return <CheckboxMui inputRef={ref} className={cn('ui-checkbox', className)} size="small" {...props} />;
});

Checkbox.displayName = 'Checkbox';

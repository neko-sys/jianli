import * as React from 'react';
import CheckboxMui, { type CheckboxProps as MuiCheckboxProps } from '@mui/material/Checkbox';

export interface CheckboxProps extends MuiCheckboxProps {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => {
  return <CheckboxMui inputRef={ref} className={className} size="small" {...props} />;
});

Checkbox.displayName = 'Checkbox';

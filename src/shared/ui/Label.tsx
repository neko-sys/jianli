import * as React from 'react';
import FormLabel from '@mui/material/FormLabel';
import { cn } from '../../lib/utils';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <FormLabel
      component="label"
      ref={ref}
      className={cn('text-xs font-medium text-[var(--muted)]', className)}
      {...props}
    />
  ),
);

Label.displayName = 'Label';

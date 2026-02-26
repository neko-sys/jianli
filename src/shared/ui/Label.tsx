import * as React from 'react';
import FormLabel from '@mui/material/FormLabel';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <FormLabel
      component="label"
      ref={ref}
      className={className}
      {...props}
    />
  ),
);

Label.displayName = 'Label';

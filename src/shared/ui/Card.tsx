import type { PropsWithChildren, ReactNode } from 'react';
import { Card as MuiCard, Box } from '@mui/material';
import { cn } from '../../lib/utils';

interface CardProps extends PropsWithChildren {
  title?: string;
  actions?: ReactNode;
  className?: string;
}

export const Card = ({ title, actions, children, className }: CardProps) => (
  <MuiCard className={cn('card', className)} elevation={0}>
    {(title || actions) && (
      <Box className="card-header">
        {title ? <h3>{title}</h3> : <span />}
        <div>{actions}</div>
      </Box>
    )}
    {children}
  </MuiCard>
);

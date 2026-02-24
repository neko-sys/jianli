import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends PropsWithChildren {
  title?: string;
  actions?: ReactNode;
  className?: string;
}

export const Card = ({ title, actions, children, className }: CardProps) => (
  <section className={cn('card', className)}>
    {(title || actions) && (
      <header className="card-header">
        <h3>{title}</h3>
        <div>{actions}</div>
      </header>
    )}
    {children}
  </section>
);

import * as React from 'react';
import { Select as BaseSelect } from '../Select';

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextValue>({});

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const Select = ({ value, onValueChange, children }: SelectProps) => (
  <SelectContext.Provider value={{ value, onValueChange }}>{children}</SelectContext.Provider>
);

const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <option value="" disabled>{placeholder ?? ''}</option>
);

const SelectTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { value, onValueChange } = React.useContext(SelectContext);
  return (
    <BaseSelect
      className={className}
      value={value ?? ''}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      {children}
    </BaseSelect>
  );
};

const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const SelectLabel = ({ children }: { children: React.ReactNode }) => (
  <optgroup label={typeof children === 'string' ? children : undefined}>{children}</optgroup>
);

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
);

const SelectSeparator = () => null;
const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

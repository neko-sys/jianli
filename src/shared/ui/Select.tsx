import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import SelectMui, { type SelectChangeEvent } from '@mui/material/Select';
import { type SelectProps as MuiSelectProps } from '@mui/material/Select';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const renderSelectChildren = (children: React.ReactNode): React.ReactNode[] =>
  React.Children.toArray(children).flatMap((node, index) => {
    if (!React.isValidElement(node)) {
      return [];
    }

    if (node.type === 'option') {
      const optionProps = node.props as React.OptionHTMLAttributes<HTMLOptionElement>;
      return (
        <MenuItem key={optionProps.value ?? index} value={optionProps.value ?? ''} disabled={optionProps.disabled}>
          {optionProps.children}
        </MenuItem>
      );
    }

    if (node.type === 'optgroup') {
      const groupProps = node.props as React.OptgroupHTMLAttributes<HTMLOptGroupElement>;
      const groupItems = React.Children.toArray(groupProps.children).flatMap((child, childIndex) => {
        if (!React.isValidElement(child) || child.type !== 'option') {
          return [];
        }
        const optionProps = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
        return (
          <MenuItem
            key={`${groupProps.label ?? 'group'}-${optionProps.value ?? childIndex}`}
            value={optionProps.value ?? ''}
            disabled={optionProps.disabled}
          >
            {optionProps.children}
          </MenuItem>
        );
      });

      return [
        <ListSubheader key={`${groupProps.label ?? index}-header`}>{groupProps.label}</ListSubheader>,
        ...groupItems,
      ];
    }

    return [node];
  });

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  onChange,
  children,
  ...props
}, ref) => {
  const emitValueChange = (nextValue: string) => {
    if (!onChange) {
      return;
    }

    onChange({
      target: {
        ...(props as Record<string, unknown>),
        value: nextValue,
      },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);
  };

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    emitValueChange(String(event.target.value));
  };

  return (
    <FormControl fullWidth size="small" className={className}>
      <SelectMui
        ref={ref as unknown as React.Ref<HTMLDivElement>}
        onChange={handleChange}
        {...(props as unknown as MuiSelectProps<unknown>)}
      >
        {renderSelectChildren(children)}
      </SelectMui>
    </FormControl>
  );
});

Select.displayName = 'Select';

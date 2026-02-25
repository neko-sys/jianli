import ButtonMui, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'default' | 'sm' | 'lg';
}

const muiVariantMap: Record<NonNullable<ButtonProps['variant']>, NonNullable<MuiButtonProps['variant']>> = {
  primary: 'contained',
  secondary: 'outlined',
  danger: 'outlined',
};

const muiSizeMap: Record<NonNullable<ButtonProps['size']>, NonNullable<MuiButtonProps['size']>> = {
  default: 'medium',
  sm: 'small',
  lg: 'large',
};

export const Button = ({ variant = 'primary', size = 'default', color, ...props }: ButtonProps) => (
  <ButtonMui
    variant={muiVariantMap[variant]}
    size={muiSizeMap[size]}
    color={variant === 'danger' ? 'error' : color}
    {...props}
  />
);

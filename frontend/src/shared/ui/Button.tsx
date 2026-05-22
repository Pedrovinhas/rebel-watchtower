import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-bold uppercase tracking-wide transition-colors disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:bg-yellow-400',
        danger: 'border border-error text-error hover:bg-error/10',
        ghost: 'border border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, children, ...props }: ButtonProps) {
  return (
    <button className={clsx(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
}

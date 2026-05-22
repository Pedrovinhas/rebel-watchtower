import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium uppercase tracking-wide border',
  {
    variants: {
      variant: {
        active: 'text-primary border-primary',
        suspended: 'text-error border-error bg-error-container/20',
        warning: 'text-yellow-400 border-yellow-500',
        info: 'text-blue-400 border-blue-500',
        critical: 'text-error border-error',
        default: 'text-on-surface-variant border-on-surface-variant',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const dotVariants = cva('w-1.5 h-1.5 rounded-full flex-shrink-0', {
  variants: {
    variant: {
      active: 'bg-primary',
      suspended: 'bg-error',
      warning: 'bg-yellow-400',
      info: 'bg-blue-400',
      critical: 'bg-error',
      default: 'bg-on-surface-variant',
    },
  },
  defaultVariants: { variant: 'default' },
});

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export function Badge({ variant = 'default', dot, pulse, className, children }: BadgeProps) {
  return (
    <span className={clsx(badgeVariants({ variant }), className)}>
      {dot && (
        <span className={clsx(dotVariants({ variant: variant as BadgeVariant }), pulse && 'animate-pulse')} />
      )}
      {children}
    </span>
  );
}

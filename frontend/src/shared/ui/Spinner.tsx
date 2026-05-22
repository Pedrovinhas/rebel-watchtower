interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = 'Loading…' }: SpinnerProps) {
  return (
    <div className="flex items-center gap-2 text-on-surface-variant py-8 justify-center">
      <div
        className="w-4 h-4 rounded-full border-2 border-on-surface-variant/30 border-t-primary animate-spin"
        role="status"
        aria-label={label}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}

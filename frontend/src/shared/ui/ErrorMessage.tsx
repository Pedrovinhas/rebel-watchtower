import clsx from 'clsx';

interface ErrorMessageProps {
  message: string | null;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <p
      className={clsx(
        'text-sm text-error border border-error/40 bg-error-container/20 px-3 py-2',
        className,
      )}
    >
      {message}
    </p>
  );
}

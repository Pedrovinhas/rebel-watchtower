interface EmptyStateProps {
  message: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-sm text-on-surface-variant">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="text-xs text-primary hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

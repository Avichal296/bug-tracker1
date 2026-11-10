export function Notice({ children, tone = 'error', onDismiss }) {
  if (!children) return null;

  const tones = {
    error: 'border-rose-200 bg-rose-50 text-rose-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };

  return (
    <div className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}>
      <p>{children}</p>
      {onDismiss && (
        <button className="font-semibold opacity-70 hover:opacity-100" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}

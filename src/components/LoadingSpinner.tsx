export default function LoadingSpinner() {
  return (
    <div
      className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-dotted border-brand-default border-t-transparent"
      role="status"
      aria-live="polite"
      aria-label="Laster inn"
    >
      <span className="sr-only">Laster inn...</span>
    </div>
  );
}

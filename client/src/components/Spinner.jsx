/**
 * Spinner — a small loading spinner for use inside buttons.
 * Renders a w-4 h-4 spinning circle.
 */
export default function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

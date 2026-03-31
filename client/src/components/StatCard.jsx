import { useCountUp } from '../hooks/useCountUp'

function StatCard({ title, value, subtitle, icon, badgeText, badgeColor = '' }) {
  // If value is a number, animate it with count-up; otherwise, use it as-is (e.g., currency string)
  const displayValue = typeof value === 'number' ? useCountUp(value) : value

  return (
    <article className="editorial-shadow rounded-xl bg-surface-container-lowest p-8">
      <header className="flex items-start justify-between gap-4">
        <div className="rounded-lg bg-primary/5 p-3 text-primary">
          <span className="material-symbols-outlined">{icon}</span>
        </div>

        {badgeText ? (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeColor}`}
          >
            {badgeText}
          </span>
        ) : null}
      </header>

      <div className="mt-6">
        <p className="text-sm font-medium text-on-surface-variant">{title}</p>
        <p className="mt-2 font-headline text-4xl font-extrabold tracking-tighter text-on-surface">
          {displayValue}
        </p>
        {subtitle ? <p className="mt-2 text-sm text-on-surface-variant">{subtitle}</p> : null}
      </div>
    </article>
  )
}

export default StatCard

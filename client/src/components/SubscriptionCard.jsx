import { motion } from 'framer-motion'
import StatusBadge from './StatusBadge'

function getCategoryIcon(category) {
  if (category === 'OTT') return 'smart_display'
  if (category === 'Music') return 'music_note'
  if (category === 'Food') return 'restaurant'
  if (category === 'Productivity') return 'work'
  if (category === 'Cloud') return 'cloud'
  if (category === 'Fitness') return 'fitness_center'
  if (category === 'Gaming') return 'sports_esports'
  return 'category'
}

function SubscriptionCard({
  id,
  name,
  category,
  amount,
  billingCycle,
  nextRenewalDate,
  status,
  riskLevel,
  onView,
  onRemind,
  onCancel,
  index = 0,
}) {
  const badgeVariant =
    status === 'cancelled' || status === 'canceled'
      ? 'cancelled'
      : riskLevel === 'high' || status === 'risk'
        ? 'risk'
        : 'active'

  return (
    <motion.article
      data-subscription-id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      role="region"
      aria-label={`${name} subscription card`}
      className="editorial-shadow rounded-xl border border-transparent bg-surface-container-lowest p-6 transition-all duration-200 hover:shadow-md hover:border-outline-variant/20 focus-within:ring-2 focus-within:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="rounded-lg bg-primary/5 p-3 text-primary">
            <span className="material-symbols-outlined">{getCategoryIcon(category)}</span>
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-headline text-lg font-bold text-on-surface">{name}</h3>
            <p className="text-sm text-on-surface-variant">{category}</p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            {amount}
          </p>
          <p className="text-sm text-on-surface-variant">{billingCycle}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-on-surface-variant">Next Renewal</p>
          <p className="mt-1 text-sm font-medium text-on-surface">{nextRenewalDate}</p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge variant={badgeVariant} />

          <button
            type="button"
            aria-label="View subscription"
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-all duration-200 hover:bg-surface-container hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-outline-variant/10 pt-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onView()
          }}
          className="rounded-full px-3 py-1 text-xs font-semibold text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
        >
          View
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemind()
          }}
          className="rounded-full px-3 py-1 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
        >
          Remind
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onCancel()
          }}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${
            status === 'cancelled'
              ? 'text-primary bg-primary/10'
              : 'text-tertiary bg-tertiary-fixed'
          }`}
        >
          {status === 'cancelled' ? 'Activate' : 'Cancel'}
        </button>
      </div>
    </motion.article>
  )
}

export default SubscriptionCard

function StatusBadge({ variant = 'active' }) {
  const config =
    variant === 'cancelled'
      ? {
          bg: 'bg-surface-container-highest text-on-surface-variant',
          dot: 'bg-outline',
          label: 'Cancelled',
        }
      : variant === 'risk'
        ? {
            bg: 'bg-tertiary-fixed text-on-tertiary-fixed',
            dot: 'bg-tertiary',
            label: 'Risk/High',
          }
        : {
            bg: 'bg-secondary-container text-on-secondary-container',
            dot: 'bg-secondary',
            label: 'Active',
          }

  return (
    <span
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} ${variant === 'active' ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  )
}

export default StatusBadge


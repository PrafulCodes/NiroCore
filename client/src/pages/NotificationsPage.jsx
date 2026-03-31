import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import PageTransition from '../components/PageTransition'
import api from '../api/client'
import Skeleton from '../components/Skeleton'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatDate, formatINR } from '../utils/formatUtils'

/* ─── Toggle pill ─── */
function TogglePill({ isOn, onToggle, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isOn}
      onClick={onToggle}
      className={`relative h-6 w-12 rounded-full transition-colors ${isOn ? 'bg-primary' : 'bg-outline-variant/30'} hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all duration-200`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  )
}

/* ─── Channel badge ─── */
function ChannelBadge({ channel }) {
  if (channel === 'email') return <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{channel}</span>
  if (channel === 'sms')   return <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">{channel}</span>
  return <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold text-outline">simulated</span>
}

function formatRelativeTime(dateString) {
  const d = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return formatDate(dateString)
}

function NotificationsPage() {
  useDocumentTitle('Reminders — NiroCore')
  const navigate = useNavigate()

  const [emailDigest, setEmailDigest] = useState(true)
  const [smsAlerts,   setSmsAlerts]   = useState(true)
  const [inAppPush,   setInAppPush]   = useState(false)

  const [reminders,    setReminders]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    api.get('/api/reminders')
      .then(r => setReminders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredReminders = useMemo(() => {
    if (activeFilter === 'All') return reminders
    return reminders.filter(r => r.channel.toLowerCase() === activeFilter.toLowerCase())
  }, [reminders, activeFilter])

  return (
    <PageLayout activePage="reminders">
      <PageTransition>
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 pb-16">

          {/* Back + header */}
          <div className="mt-8 mb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </button>
            <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">
              Reminder Center
            </h1>
            <p className="mt-2 text-base md:text-lg text-on-surface-variant">
              Stay ahead of every subscription and renewal.
            </p>
          </div>

          {/* ── Mobile: stacked layout. Desktop: 2-col grid ── */}
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-8">

            {/* Delivery channels — TOP on mobile */}
            <aside className="space-y-6 lg:col-span-4 order-1">
              <article className="w-full rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-[0_32px_48px_-4px_rgba(25,27,36,0.06)]">
                <h3 className="font-headline text-xl md:text-2xl font-bold tracking-tight text-on-surface">Delivery Channels</h3>
                <div className="mt-5 space-y-3">
                  {[
                    { icon: 'mail', label: 'Email Digest', sub: 'Weekly report & alerts', isOn: emailDigest, onToggle: () => setEmailDigest(p => !p), ariaLabel: 'Toggle Email Digest', color: 'text-primary bg-primary-container/20' },
                    { icon: 'sms', label: 'SMS Alerts', sub: 'Instant payment failures', isOn: smsAlerts, onToggle: () => setSmsAlerts(p => !p), ariaLabel: 'Toggle SMS Alerts', color: 'text-secondary bg-secondary-container/20' },
                    { icon: 'notifications_active', label: 'In-app Push', sub: 'Daily smart summaries', isOn: inAppPush, onToggle: () => setInAppPush(p => !p), ariaLabel: 'Toggle In-app Push', color: 'text-tertiary bg-tertiary-container/20' },
                  ].map(ch => (
                    <div key={ch.label} className="flex min-h-[56px] items-center justify-between rounded-xl bg-surface-container p-4">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined rounded-lg p-2 ${ch.color}`}>{ch.icon}</span>
                        <div>
                          <p className="font-semibold text-on-surface">{ch.label}</p>
                          <p className="text-xs text-on-surface-variant">{ch.sub}</p>
                        </div>
                      </div>
                      <TogglePill isOn={ch.isOn} onToggle={ch.onToggle} label={ch.ariaLabel} />
                    </div>
                  ))}
                </div>
              </article>

              {/* Smart prediction — BOTTOM on mobile */}
              <article className="relative w-full overflow-hidden rounded-2xl bg-primary p-6 md:p-8 text-white shadow-xl order-last">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary-container/30 blur-3xl" />
                <div className="relative z-10">
                  <span className="material-symbols-outlined mb-4 block text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h3 className="font-headline text-xl md:text-2xl font-bold">Smart Prediction</h3>
                  <p className="mt-3 text-sm md:text-base text-white/90 leading-relaxed">
                    We detect spending trends and highlight months where renewal clusters may impact your balance.
                  </p>
                  <button
                    type="button"
                    className="mt-6 w-full md:w-auto rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all duration-200"
                  >
                    Set Buffer Alert
                  </button>
                </div>
              </article>
            </aside>

            {/* ── Timeline ── */}
            <div className="w-full lg:col-span-8 order-2 min-h-[300px] overflow-hidden">
              {/* Filter chips */}
              <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {['All', 'Email', 'SMS', 'Simulated'].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setActiveFilter(chip)}
                    className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${activeFilter === chip ? 'bg-on-surface text-surface' : 'bg-surface-container text-on-surface-variant'}`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="space-y-4 py-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-outline-variant/10">
                      <Skeleton className="h-5 w-[60%] mb-3" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-[28%]" />
                      </div>
                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <Skeleton className="h-5 w-20 rounded-xl" />
                        <Skeleton className="h-3 w-[30%] rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reminders.length === 0 ? (
                <div className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-16 flex flex-col items-center justify-center text-center min-h-[300px] w-full">
                  <span className="material-symbols-outlined text-5xl text-outline mb-4">
                    notifications_off
                  </span>
                  <h5 className="font-headline font-bold text-lg text-on-surface mb-2">
                    No reminders yet
                  </h5>
                  <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed mb-6">
                    Add a subscription to start tracking renewals.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/add')}
                    className="px-6 py-3 rounded-full signature-gradient text-white font-bold text-sm tracking-wider uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    Add Subscription
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReminders.map(log => (
                    <div key={log.id} className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-outline-variant/10">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-headline text-base font-bold text-on-surface truncate">
                          {log.subscription?.serviceName || 'Unknown Service'}
                        </h4>
                        {log.subscription?.amount && (
                          <p className="font-headline text-base font-bold text-on-surface shrink-0">
                            {formatINR(Number(log.subscription.amount))}
                          </p>
                        )}
                      </div>
                      {/* Bottom row */}
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <ChannelBadge channel={log.channel} />
                        <span className="text-[10px] text-on-surface-variant">{formatRelativeTime(log.sentAt)}</span>
                        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${log.status === 'sent' ? 'bg-secondary-container text-on-secondary-container' : 'bg-red-100 text-red-600'}`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {filteredReminders.length === 0 && (
                    <div className="py-10 text-center text-sm text-on-surface-variant">No reminders match this filter.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </PageLayout>
  )
}

export default NotificationsPage

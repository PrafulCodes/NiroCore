import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import PageLayout from '../components/PageLayout'
import PageTransition from '../components/PageTransition'
import StatCard from '../components/StatCard'
import SubscriptionCard from '../components/SubscriptionCard'
import Skeleton from '../components/Skeleton'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatDate, formatINR } from '../utils/formatUtils'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const filterChips = ['All', 'OTT', 'Music', 'Food', 'Productivity', 'Risky']

function getCategoryIcon(category) {
  const map = {
    OTT: 'smart_display', Music: 'music_note', Food: 'restaurant',
    Productivity: 'work', Cloud: 'cloud', Fitness: 'fitness_center',
    Gaming: 'sports_esports',
  }
  return map[category] || 'category'
}

/* ─── skeleton loaders ─────────────────────────────────────────── */
function StatCardSkeleton() {
  return (
    <Skeleton className="h-28 w-full" />
  )
}

function SubscriptionCardSkeleton() {
  return (
    <Skeleton className="h-40 w-full" />
  )
}

/* ─── scroll dots for mobile stat strip ─────────────────────────── */
function ScrollDots({ count, activeIndex }) {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-3 md:hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-200 ${
            i === activeIndex ? 'w-4 bg-primary' : 'w-1.5 bg-outline/30'
          }`}
        />
      ))}
    </div>
  )
}

function DashboardPage() {
  useDocumentTitle('Dashboard — NiroCore')
  const navigate = useNavigate()
  const [subscriptions, setSubscriptions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [statScrollIndex, setStatScrollIndex] = useState(0)

  // Fetch from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subsRes, statsRes] = await Promise.all([
          api.get('/api/subscriptions'),
          api.get('/api/subscriptions/stats'),
        ])
        setSubscriptions(subsRes.data)
        setStats(statsRes.data)
      } catch {
        // network error toast is handled by the axios interceptor
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredSubscriptions = useMemo(() => {
    if (activeFilter === 'All') return subscriptions
    if (activeFilter === 'Risky')
      return subscriptions.filter((s) => s.riskLevel === 'high')
    return subscriptions.filter((s) => s.category === activeFilter)
  }, [activeFilter, subscriptions])

  const handleCancel = async (id) => {
    try {
      await api.patch(`/api/subscriptions/${id}`, { status: 'cancelled' })
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'cancelled' } : s)),
      )
      toast.success('Marked as cancelled.')
    } catch {
      toast.error('Failed to cancel subscription.')
    }
  }

  const handleRemind = () => {
    toast('Reminder sent! 📬', { icon: '🔔' })
  }

  // Handle stat strip scroll for dots
  const handleStatScroll = (e) => {
    const el = e.currentTarget
    const cardWidth = el.firstChild?.offsetWidth || 1
    const index = Math.round(el.scrollLeft / cardWidth)
    setStatScrollIndex(index)
  }

  /* ─── empty state ────────────────────────────────────────────── */
  if (!loading && subscriptions.length === 0) {
    return (
      <PageLayout activePage="dashboard">
        <PageTransition>
          <section className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center px-8 py-10">
          <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <motion.div
              className="relative"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="editorial-shadow relative min-h-[420px] overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-8">
                <div className="absolute left-8 top-8 rotate-[-8deg] rounded-2xl bg-primary/10 p-4 text-primary">
                  <span className="material-symbols-outlined text-4xl">smart_display</span>
                </div>
                <div className="absolute right-10 top-20 rotate-[9deg] rounded-2xl bg-secondary/10 p-4 text-secondary">
                  <span className="material-symbols-outlined text-4xl">music_note</span>
                </div>
                <div className="absolute left-16 bottom-28 rotate-[6deg] rounded-2xl bg-tertiary/10 p-4 text-tertiary">
                  <span className="material-symbols-outlined text-4xl">restaurant</span>
                </div>
                <div className="absolute right-20 bottom-32 rotate-[-7deg] rounded-2xl bg-primary-fixed p-4 text-primary">
                  <span className="material-symbols-outlined text-4xl">fitness_center</span>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary-fixed/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-tertiary animate-pulse">
                  <span className="mr-1 material-symbols-outlined text-sm align-middle">warning</span>
                  Invisible Spending Detected
                </div>

                <div className="glass-effect absolute inset-x-6 bottom-6 rounded-xl border border-white/40 bg-white/50 p-4">
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                    Potential Savings
                  </p>
                  <p className="mt-1 font-headline text-2xl font-extrabold text-on-surface">
                    {formatINR(0)} /mo
                  </p>
                </div>
              </div>
            </motion.div>

            <div>
              <span className="inline-flex rounded-sm bg-tertiary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-tertiary-container">
                Financial Audit Required
              </span>
              <h1 className="mt-5 font-headline text-5xl font-extrabold tracking-tighter text-on-surface">
                No subscriptions <span className="text-primary">added yet</span>.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-on-surface-variant">
                Scan a screenshot or manually add recurring payments to start tracking hidden
                expenses and renewal patterns.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/scan')}
                  className="signature-gradient rounded-full px-8 py-4 text-sm font-bold uppercase tracking-widest text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all duration-200"
                >
                  Scan Screenshot
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/add')}
                  className="rounded-full border border-outline-variant/20 bg-surface-container-lowest px-8 py-4 text-sm font-bold tracking-wider text-primary hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all duration-200"
                >
                  Add Manually
                </button>
              </div>
            </div>
          </div>
        </section>
        </PageTransition>

        <button
          type="button"
          onClick={() => navigate('/add')}
          className="signature-gradient fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 flex items-center justify-center text-white shadow-2xl"
          aria-label="Add Subscription"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </PageLayout>
    )
  }

  /* ─── stat cards data ────────────────────────────────────────── */
  const statCards = stats
    ? [
        { title: 'Monthly Spend', value: formatINR(stats.monthlyTotal), subtitle: 'Active subscriptions', icon: 'payments' },
        { title: 'Yearly Spend', value: formatINR(stats.yearlyTotal), subtitle: 'Cycle adjusted', icon: 'calendar_month' },
        { title: 'Upcoming Renewals', value: `${stats.upcomingCount}`, subtitle: 'Within next 7 days', icon: 'event_repeat' },
        { title: 'High Risk', value: `${stats.highRiskCount}`, subtitle: 'Renewing in 3 days', icon: 'warning',
          badgeText: stats.highRiskCount > 0 ? 'Urgent' : undefined,
          badgeColor: 'bg-tertiary-container text-on-tertiary-container' },
      ]
    : []

  return (
    <PageLayout activePage="dashboard">
      <PageTransition>
        <section className="mx-auto w-full max-w-screen-2xl px-4 md:px-8 lg:px-12 py-12">
        <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
            Financial Overview
          </h1>
          <p className="mt-2 text-lg text-on-surface-variant">
            Tracking {stats?.activeCount ?? '—'} active subscriptions.
          </p>
        </header>

        {/* Renewal warning banner */}
        {stats?.highRiskCount > 0 ? (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-tertiary/20 bg-tertiary-fixed/20 p-4 text-tertiary">
            <span className="material-symbols-outlined">warning</span>
            <p className="font-medium">⚠ {stats.highRiskCount} subscription(s) renew within 3 days.</p>
          </div>
        ) : null}

        {/* Stat cards: bleed to edges on mobile, scrollable */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            <div
              className="-mx-4 flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-4"
              onScroll={handleStatScroll}
            >
              {statCards.map((card) => (
                <div key={card.title} className="min-w-[200px] flex-shrink-0 md:min-w-0">
                  <StatCard {...card} />
                </div>
              ))}
            </div>
            <ScrollDots count={statCards.length} activeIndex={statScrollIndex} />
          </>
        )}

        {/* Filter chips — scrollable on mobile */}
        <div className="mt-8 -mx-4 flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2 md:mx-0 md:px-0">
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip
            return (
              <button
                type="button"
                key={chip}
                onClick={() => setActiveFilter(chip)}
                  className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${
                  isActive
                    ? 'bg-on-surface text-surface'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {chip}
              </button>
            )
          })}
        </div>

        {!loading && activeFilter !== 'All' && filteredSubscriptions.length === 0 ? (
          <div className="mt-4 flex items-center gap-2 px-2">
            <p className="text-sm text-on-surface-variant">No subscriptions in this category.</p>
            <button
              type="button"
              onClick={() => setActiveFilter('All')}
              className="text-sm font-semibold text-primary underline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 rounded-sm px-1 py-0.5 transition-all duration-200 hover:brightness-110"
            >
              Clear filter
            </button>
          </div>
        ) : null}

        {/* ─── Subscription cards ─────────────────────────────────── */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => <SubscriptionCardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {/* Unified responsive grid (1 col mobile → 2 tablet → 3 desktop) */}
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredSubscriptions.map((subscription, index) => (
                <SubscriptionCard
                  key={subscription.id}
                  index={index}
                  id={subscription.id}
                  name={subscription.serviceName}
                  category={subscription.category}
                  amount={formatINR(subscription.amount)}
                  billingCycle={subscription.billingCycle}
                  nextRenewalDate={formatDate(subscription.nextRenewalDate)}
                  status={subscription.status}
                  daysUntilRenewal={subscription.daysUntilRenewal}
                  riskLevel={subscription.riskLevel}
                  onView={() => navigate(`/subscription/${subscription.id}`)}
                  onRemind={() => handleRemind()}
                  onCancel={() => handleCancel(subscription.id)}
                />
              ))}
            </div>
          </>
        )}
        </section>
      </PageTransition>

      <button
        type="button"
        onClick={() => navigate('/add')}
        className="signature-gradient fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 flex items-center justify-center text-white shadow-2xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all duration-200"
        aria-label="Add Subscription"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </PageLayout>
  )
}

export default DashboardPage

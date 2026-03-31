import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import PageLayout from '../components/PageLayout'
import PageTransition from '../components/PageTransition'
import Spinner from '../components/Spinner'
import Skeleton from '../components/Skeleton'
import StatusBadge from '../components/StatusBadge'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatDate, formatINR, getDaysRemainingText } from '../utils/formatUtils'


const knownServiceSteps = {
  netflix: [
    'Open Netflix and go to Account from your profile menu.',
    'Under Membership & Billing, choose Cancel Membership.',
    'Confirm cancellation and keep a screenshot of confirmation.',
  ],
  spotify: [
    'Sign in at spotify.com/account in a browser.',
    'Open Your Plan and select Change Plan.',
    'Choose Cancel Premium and confirm the downgrade.',
  ],
  amazon: [
    'Go to Amazon account settings and open Memberships & Subscriptions.',
    'Select the active membership you want to stop.',
    'Click Cancel Subscription and follow final confirmation.',
  ],
  hotstar: [
    'Open Disney+ Hotstar and visit My Account.',
    'Navigate to Plans & Payments for the active plan.',
    'Select Cancel Plan and confirm your cancellation request.',
  ],
}

function getCategoryIcon(category) {
  const map = {
    OTT: 'smart_display', Music: 'music_note', Food: 'restaurant',
    Productivity: 'work', Cloud: 'cloud', Fitness: 'fitness_center',
    Gaming: 'sports_esports',
  }
  return map[category] || 'category'
}

function SubscriptionDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [subscription, setSubscription] = useState(null)
  
  useDocumentTitle(`${subscription?.serviceName || 'Subscription'} — NiroCore`)

  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [showSavingsBlast, setShowSavingsBlast] = useState(false)

  const fetchSubscription = async () => {
    try {
      const res = await api.get(`/api/subscriptions/${id}`)
      setSubscription(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setSubscription(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchReminders = async () => {
    try {
      const res = await api.get(`/api/reminders/${id}`)
      setReminders(res.data)
    } catch (err) {
      // It's okay if reminders fail, just don't show any
    }
  }

  useEffect(() => {
    fetchSubscription()
    fetchReminders()
  }, [id])

  const amountValue = subscription ? subscription.amount : 0

  const timelineSteps = useMemo(() => {
    if (!subscription) return []
    const key = subscription.serviceName?.trim().toLowerCase()
    if (knownServiceSteps[key]) return knownServiceSteps[key]
    return [
      `Go to ${subscription.serviceName}'s website.`,
      'Find Account or Settings.',
      'Look for Subscription -> Cancel.',
    ]
  }, [subscription])

  const handleMarkCancelled = async () => {
    if (!subscription) return
    setCancelling(true)
    try {
      const res = await api.patch(`/api/subscriptions/${id}`, { status: 'cancelled' })
      setSubscription(res.data)
      setShowSavingsBlast(true)
      const yearlyAmount = formatINR(
        amountValue *
          (subscription.billingCycle === 'Yearly'
            ? 1
            : subscription.billingCycle === 'Quarterly'
              ? 4
              : 12),
      )
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0040e0', '#006d42', '#62feaf', '#b8c3ff', '#3ee095'],
      })
      toast.custom(
        (t) => (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-secondary-container text-on-secondary-container px-6 py-4 rounded-2xl font-bold text-center shadow-2xl text-sm"
          >
            🎉 Cancelled! You're saving {yearlyAmount}/year
          </motion.div>
        ),
        { duration: 3000 },
      )
      window.setTimeout(() => setShowSavingsBlast(false), 2600)
    } catch {
      toast.error('Failed to cancel subscription.')
    } finally {
      setCancelling(false)
    }
  }

  const handleRemindMe = async () => {
    try {
      toast.loading('Sending reminder...', { id: 'remind' })
      await api.post(`/api/reminders/trigger/${id}`)
      toast.success('Reminder sent!', { id: 'remind' })
      fetchReminders() // Refetch history
    } catch (err) {
      toast.error('Failed to send reminder', { id: 'remind' })
    }
  }

  /* ─── loading state ────────────────────────────────────────── */
  if (loading) {
    return (
      <PageLayout activePage="dashboard">
        <PageTransition>
          <section className="mx-auto w-full max-w-screen-2xl px-4 md:px-8 lg:px-12 py-12">
            <div className="space-y-6">
              <Skeleton className="h-8 w-56" />
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-7">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-40 w-[85%]" />
                </div>
                <div className="space-y-6 lg:col-span-5">
                  <Skeleton className="h-48 w-[92%]" />
                  <Skeleton className="h-36 w-[70%]" />
                </div>
              </div>
            </div>
          </section>
        </PageTransition>
      </PageLayout>
    )
  }

  /* ─── not found ────────────────────────────────────────────── */
  if (!subscription) {
    return (
      <PageLayout activePage="dashboard">
        <PageTransition>
          <section className="mx-auto mt-24 flex w-full max-w-2xl flex-col items-center px-4 text-center">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Subscription not found.</h2>
            <button type="button" onClick={() => navigate('/dashboard')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface-container px-5 py-3 text-sm font-semibold text-on-surface-variant hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all duration-200">
              <span className="material-symbols-outlined text-base">arrow_back</span>Back to Dashboard
            </button>
          </section>
        </PageTransition>
      </PageLayout>
    )
  }

  return (
    <PageLayout activePage="dashboard">
      <PageTransition>
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 pb-28 md:pb-28 pb-[88px]">
          {/* Sticky back button on mobile */}
          <div className="sticky top-[72px] z-10 bg-surface/80 backdrop-blur-sm py-3 mb-6 -mx-4 px-4 md:static md:bg-transparent md:backdrop-blur-none md:py-0 md:mx-0 md:px-0">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 rounded-md px-2 py-1"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Dashboard
            </button>
          </div>
          <div className="mb-8">
          <p className="text-sm text-on-surface-variant">Subscriptions / Detail</p>
          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
              {subscription.serviceName}
            </h1>
            <button
              onClick={handleRemindMe}
              disabled={subscription.status === 'cancelled'}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
            >
              <span className="material-symbols-outlined text-sm">notifications</span>
              Remind Me
            </button>
          </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Service header first */}
          <div className="space-y-6 lg:col-span-7 order-1">
            <article className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-8 shadow-[0_32px_48px_-12px_rgba(25,27,36,0.04)]">
              <span className="material-symbols-outlined absolute -right-2 top-0 text-8xl opacity-10 text-on-surface">
                {getCategoryIcon(subscription.category)}
              </span>

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-4 text-primary">
                    <span className="material-symbols-outlined text-3xl">
                      {getCategoryIcon(subscription.category)}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-headline text-2xl font-extrabold text-on-surface">
                      {subscription.serviceName}
                    </h2>
                    <p className="text-sm text-on-surface-variant">{subscription.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
                    {formatINR(amountValue)}
                  </p>
                  <div className="mt-2">
                    <StatusBadge
                      variant={
                        subscription.status === 'cancelled'
                          ? 'cancelled'
                          : subscription.riskLevel === 'high'
                            ? 'risk'
                            : 'active'
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-surface-container p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Billing Cycle
                  </p>
                  <p className="mt-1 font-semibold text-on-surface">{subscription.billingCycle}</p>
                </div>
                <div className="rounded-lg bg-surface-container p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Next Renewal
                  </p>
                  <p className="mt-1 font-semibold text-on-surface">
                    {formatDate(subscription.nextRenewalDate)}
                  </p>
                </div>
                <div className="rounded-lg bg-surface-container p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Days Until Renewal
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-semibold text-on-surface">
                    {getDaysRemainingText(
                      Number(subscription.daysUntilRenewal),
                      subscription.nextRenewalDate,
                    )}
                    <StatusBadge variant={subscription.riskLevel === 'high' ? 'risk' : 'active'} />
                  </p>
                </div>
                <div className="rounded-lg bg-surface-container p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Source Type
                  </p>
                  <p className="mt-1 font-semibold text-on-surface capitalize">
                    {subscription.sourceType || 'manual'}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-xl bg-surface-container p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">notifications_active</span>
                <h3 className="font-headline text-xl font-bold text-on-surface">Reminder Preferences</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-surface-container-lowest p-4">
                  <p className="font-medium text-on-surface">Email Notifications</p>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={emailEnabled}
                      onChange={() => setEmailEnabled((prev) => !prev)}
                      className="peer sr-only focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:border-transparent border-transparent"
                    />
                    <span className="h-6 w-11 rounded-full bg-outline/40 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-5" />
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-surface-container-lowest p-4">
                  <p className="font-medium text-on-surface">SMS Alerts</p>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={smsEnabled}
                      onChange={() => setSmsEnabled((prev) => !prev)}
                      className="peer sr-only focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:border-transparent border-transparent"
                    />
                    <span className="h-6 w-11 rounded-full bg-outline/40 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-5" />
                  </label>
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary">cancel</span>
                <h3 className="font-headline text-xl font-bold text-on-surface">
                  How to Cancel {subscription.serviceName}
                </h3>
              </div>

              <div className="relative">
                <div className="absolute bottom-0 left-4 top-2 w-px bg-outline-variant/30" />

                <div className="space-y-6">
                  {timelineSteps.map((step, index) => {
                    const active = index === 0

                    return (
                      <div key={step} className="relative pl-10">
                        <span
                          className={`absolute left-1 top-1 h-6 w-6 rounded-full ring-4 ${
                            active
                              ? 'bg-primary ring-primary/10'
                              : 'bg-outline ring-outline/10'
                          }`}
                        />
                        <p className="font-medium text-on-surface">Step {index + 1}</p>
                        <p className="mt-1 text-sm text-on-surface-variant">{step}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </article>
          </div>

          <div className="space-y-6 lg:col-span-5">
            {/* Quick actions second on mobile */}
            <article className="relative rounded-xl bg-surface-container-lowest p-8 order-2 lg:order-2">
              <h3 className="font-headline text-xl font-bold text-on-surface">Quick Actions</h3>

              {showSavingsBlast ? (
                <div className="mt-4 rounded-lg bg-secondary-container/30 p-4 text-secondary">
                  <div className="relative">
                    <span className="absolute -left-2 -top-2 h-2 w-2 animate-ping rounded-full bg-primary" />
                    <span className="absolute right-6 top-1 h-2 w-2 animate-ping rounded-full bg-tertiary" />
                    <span className="absolute bottom-0 left-1/2 h-2 w-2 animate-ping rounded-full bg-secondary" />
                    <p className="font-semibold">
                      You're saving {formatINR(annualCost)}/year!
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex flex-row lg:flex-col gap-3 overflow-x-auto scrollbar-hide">
                <button
                  type="button"
                  className="signature-gradient flex-shrink-0 rounded-full px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                >
                  Manage on {subscription.serviceName}
                </button>
                <button
                  type="button"
                  onClick={handleMarkCancelled}
                  disabled={cancelling || subscription.status === 'cancelled'}
                  className={`flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-surface-container px-6 py-3 text-sm font-semibold text-on-surface transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${
                    cancelling || subscription.status === 'cancelled'
                      ? 'opacity-70 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {cancelling ? (
                    <Spinner className="border-on-surface border-t-transparent" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      {subscription.status === 'cancelled' ? 'Cancelled' : 'Mark as Cancelled'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="flex-shrink-0 rounded-full border-2 border-tertiary/20 px-6 py-3 text-sm font-semibold text-tertiary transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                >
                  Report Issue
                </button>
              </div>
            </article>

            {/* Info grid cards third, insight fourth, cancel guide fifth, reminder prefs sixth, history seventh */}
            <article className="relative overflow-hidden rounded-xl bg-indigo-900 p-8 text-white">
              <span className="material-symbols-outlined pointer-events-none absolute -right-8 -top-10 text-[160px] opacity-20">
                trending_up
              </span>
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-widest text-indigo-200">Annual Cost</p>
                <p className="mt-2 font-headline text-3xl font-extrabold tracking-tight">
                  {formatINR(annualCost)}
                </p>
                <div className="mt-4 rounded-lg bg-indigo-800/50 p-4 text-sm text-indigo-100">
                  Consider comparing this yearly spend against alternatives or bundled plans.
                </div>
              </div>
            </article>

            <article className="rounded-xl bg-surface-container-lowest p-6">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-headline text-lg font-bold text-on-surface">Reminder History</h3>
                 <span className="material-symbols-outlined text-on-surface-variant text-xl">history</span>
              </div>
              
              {reminders.length === 0 ? (
                <div className="rounded-lg bg-surface-container p-6 text-center text-on-surface-variant border border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4 min-h-[140px]">
                  <span className="material-symbols-outlined text-3xl text-outline">history</span>
                  <p className="text-sm">No reminders sent for this subscription yet.</p>
                  <button
                    type="button"
                    onClick={handleRemindMe}
                    disabled={subscription.status === 'cancelled'}
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                  >
                    Remind Me
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                   {reminders.map(log => (
                     <div key={log.id} className="flex justify-between items-center rounded-lg bg-surface-container p-3 border border-outline-variant/10">
                        <div className="flex items-center gap-3">
                           <span className="material-symbols-outlined text-primary/80">
                              {log.channel === 'email' ? 'mail' : log.channel === 'sms' ? 'sms' : 'smart_toy'}
                           </span>
                           <div>
                             <p className="text-xs font-semibold text-on-surface uppercase tracking-wider">{log.channel}</p>
                             <p className="text-[10px] text-on-surface-variant">{formatDate(log.sentAt)}</p>
                           </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'sent' ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'
                        }`}>
                          {log.status}
                        </span>
                     </div>
                   ))}
                </div>
              )}
            </article>
          </div>
        </div>

          {/* Fixed bottom cancel bar — mobile only, active subs only */}
          {subscription.status === 'active' && (
            <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 bg-white/90 backdrop-blur-sm p-4 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={handleMarkCancelled}
                disabled={cancelling}
                className={`w-full flex items-center justify-center gap-2 rounded-full bg-surface-container px-6 py-3.5 text-sm font-bold text-on-surface transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${
                  cancelling ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {cancelling ? <Spinner className="w-4 h-4 border-on-surface border-t-transparent" /> : (
                  <><span className="material-symbols-outlined text-base">check_circle</span>Mark as Cancelled</>)}
              </button>
            </div>
          )}
        </div>
      </PageTransition>
    </PageLayout>
  )
}

export default SubscriptionDetailPage

import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import PageTransition from '../components/PageTransition'
import api from '../api/client'
import Skeleton from '../components/Skeleton'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatDate, formatINR } from '../utils/formatUtils'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

/* ─── Toggle pill ─── */
function TogglePill({ isOn, onToggle, label, disabled }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isOn}
      disabled={disabled}
      onClick={onToggle}
      className={`relative h-6 w-12 rounded-full transition-all duration-200 ${
        isOn ? 'bg-primary' : 'bg-outline-variant/30'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'} focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  )
}

/* ─── Channel badge ─── */
function ChannelBadge({ channel }) {
  if (channel === 'email') return <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary capitalize">{channel}</span>
  if (channel === 'sms')   return <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary capitalize">{channel}</span>
  return <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold text-outline">Push</span>
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
  useDocumentTitle('Reminder Center — NiroCore')
  const navigate = useNavigate()

  const [subscriptions, setSubscriptions] = useState([])
  const [reminders,      setReminders]     = useState([])
  const [loading,        setLoading]       = useState(true)
  const [updatingId,     setUpdatingId]    = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subsRes, logsRes] = await Promise.all([
          api.get('/api/subscriptions'),
          api.get('/api/reminders')
        ])
        setSubscriptions(subsRes.data.filter(s => s.status === 'active'))
        setReminders(logsRes.data)
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleToggle = async (subId, channel) => {
    const sub = subscriptions.find(s => s.id === subId)
    if (!sub) return

    const newReminders = {
      ...sub.reminders,
      [channel]: !sub.reminders[channel]
    }

    setUpdatingId(`${subId}-${channel}`)
    try {
      await api.patch(`/api/subscriptions/${subId}`, { reminders: newReminders })
      setSubscriptions(prev => prev.map(s => 
        s.id === subId ? { ...s, reminders: newReminders } : s
      ))
      toast.success(`${channel.toUpperCase()} preference updated.`)
    } catch {
      toast.error('Failed to update preference.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <PageLayout activePage="reminders">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 pb-24 relative z-10">

        {/* Header */}
        <div className="mt-8 mb-10">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Dashboard
          </button>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
            Reminder Center
          </h1>
          <p className="mt-2 text-lg text-on-surface-variant max-w-2xl">
            Manage how and when you're notified about upcoming renewals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── SECTION 1: SUBSCRIPTION SETTINGS ── */}
          <div className="lg:col-span-12 xl:col-span-8 order-2 xl:order-1">
            <section className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-[0_8px_32px_-4px_rgba(25,27,36,0.06)] overflow-hidden relative z-20">
              <div className="p-6 md:p-8 border-b border-outline-variant/10 flex items-center justify-between">
                <h3 className="font-headline text-2xl font-bold text-on-surface">Manage Subscriptions</h3>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-3 py-1 bg-surface-container rounded-full">
                  {subscriptions.length} Linked
                </span>
              </div>

              <div className="divide-y divide-outline-variant/10">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="p-6 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-surface-container" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-32 bg-surface-container rounded" />
                          <div className="h-3 w-16 bg-surface-container rounded" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-6 w-10 bg-surface-container rounded-full" />
                          <div className="h-6 w-10 bg-surface-container rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : subscriptions.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-3xl">notifications_off</span>
                    </div>
                    <div>
                      <h4 className="font-headline text-xl font-bold text-on-surface">No active subscriptions</h4>
                      <p className="text-on-surface-variant text-sm mt-1">Add your first subscription to configure alerts.</p>
                    </div>
                    <button 
                      onClick={() => navigate('/add')}
                      className="mt-2 signature-gradient px-8 py-3 rounded-full text-white font-bold text-sm tracking-widest uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      Add Subscription
                    </button>
                  </div>
                ) : (
                  subscriptions.map(sub => (
                    <div 
                      key={sub.id} 
                      className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-container/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">
                            {sub.category === 'OTT' ? 'smart_display' : sub.category === 'Music' ? 'music_note' : 'category'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-headline text-lg font-bold text-on-surface truncate">{sub.serviceName}</h4>
                          <p className="text-xs text-on-surface-variant font-medium">Renews {formatDate(sub.nextRenewalDate)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                        {[
                          { id: 'push',  label: 'Push',  icon: 'notifications_active' },
                          { id: 'email', label: 'Email', icon: 'mail' },
                          { id: 'sms',   label: 'SMS',   icon: 'sms' },
                        ].map(channel => (
                          <div key={channel.id} className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">{channel.icon}</span>
                            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest w-12">{channel.label}</span>
                            <TogglePill 
                              isOn={sub.reminders?.[channel.id] ?? false} 
                              onToggle={() => handleToggle(sub.id, channel.id)}
                              label={`Toggle ${channel.label} for ${sub.serviceName}`}
                              disabled={updatingId === `${sub.id}-${channel.id}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* ── SECTION 2: RECENT HISTORY ── */}
          <div className="lg:col-span-12 xl:col-span-4 order-1 xl:order-2 space-y-6">
            <aside className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant/10 shadow-sm overflow-hidden relative z-20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline text-xl font-bold text-on-surface">Recent Activity</h3>
                <span className="material-symbols-outlined text-on-surface-variant">history</span>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                {loading ? (
                  [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                ) : reminders.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-on-surface-variant italic">No interactions yet.</p>
                  </div>
                ) : (
                  reminders.map(log => (
                    <div key={log.id} className="bg-surface-container-lowest border border-outline-variant/5 rounded-xl p-4 flex items-start gap-3">
                      <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${log.status === 'sent' ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
                          <span className="material-symbols-outlined text-sm">{log.status === 'sent' ? 'done' : 'error'}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-on-surface truncate">
                          {log.subscription?.serviceName || 'Reminder Sent'}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                            <ChannelBadge channel={log.channel} />
                            <span className="text-[10px] text-on-surface-variant font-medium">
                              {formatRelativeTime(log.sentAt)}
                            </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-indigo-900 text-white relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                  <div className="relative z-10">
                    <span className="material-symbols-outlined mb-2 text-primary-fixed">auto_awesome</span>
                    <h4 className="font-headline font-bold text-lg">Smart Buffers</h4>
                    <p className="text-xs text-white/70 mt-1 leading-relaxed">
                      We detect spending clusters and warn you about high-impact renewal months.
                    </p>
                  </div>
              </div>
            </aside>
          </div>

        </div>
      </div>
    </PageLayout>
  )
}

export default NotificationsPage

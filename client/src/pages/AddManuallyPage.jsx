import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'
import PageLayout from '../components/PageLayout'
import PageTransition from '../components/PageTransition'
import PhoneInputModal from '../components/PhoneInputModal'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const CATEGORIES = [
  { label: 'OTT',          icon: 'smart_display' },
  { label: 'Music',        icon: 'music_note' },
  { label: 'Food',         icon: 'restaurant' },
  { label: 'Productivity', icon: 'work' },
  { label: 'Cloud',        icon: 'cloud' },
  { label: 'Fitness',      icon: 'fitness_center' },
  { label: 'Gaming',       icon: 'sports_esports' },
  { label: 'Other',        icon: 'category' },
]

const REMINDER_OPTIONS = [
  { label: '3 days before', value: '3day' },
  { label: '1 day before',  value: '1day' },
  { label: 'Same day',      value: 'same' },
  { label: 'All three',     value: 'all'  },
]

/* ─── inline error ──────────────────────────────────────────── */
function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="mt-1.5 ml-1 flex items-center gap-1 text-xs text-red-500">
      <span className="material-symbols-outlined text-[14px]">error</span>
      {message}
    </p>
  )
}

/* ─── section label ─────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p className="mb-4 border-b border-outline-variant/10 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
      {children}
    </p>
  )
}

/* ─── shared input class ─────────────────────────────────────── */
const inputBase =
  'w-full bg-surface-container-low border border-transparent rounded-xl px-4 py-3.5 text-on-surface font-medium placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:border-transparent transition-all duration-200'

function inputClass(errors, field) {
  return `${inputBase} ${errors[field] ? 'ring-2 ring-red-400' : ''}`
}

/* ══════════════════════════════════════════════ */

function AddManuallyPage() {
  useDocumentTitle('Add Subscription — NiroCore')
  const navigate = useNavigate()
  const firstErrorRef = useRef(null)

  const [formData, setFormData] = useState({
    serviceName:     '',
    amount:          '',
    billingCycle:    'Monthly',
    nextRenewalDate: new Date().toISOString().split('T')[0], // Default to today
    category:        'OTT',
    notes:           '',
    reminders: { push: true, email: false, sms: false, whatsapp: false },
  })

  // Local state for phone validation
  const { user } = useAuth()
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [pendingSubmit, setShowPendingSubmit] = useState(false)
  const [userPhone, setUserPhone] = useState(user?.user_metadata?.phone || null)

  const [selectedReminder, setSelectedReminder] = useState('1day')
  const [errors,           setErrors]           = useState({})
  const [submitting,       setSubmitting]        = useState(false)
  const [shake,            setShake]             = useState(false)

  /* ── handlers ─────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleCategorySelect = (label) => {
    setFormData(prev => ({ ...prev, category: label }))
    if (errors.category) setErrors(prev => ({ ...prev, category: '' }))
  }

  const handleReminderChange = (key) => {
    setFormData(prev => ({
      ...prev,
      reminders: { ...prev.reminders, [key]: !prev.reminders[key] },
    }))
  }

  const triggerShake = () => {
    setShake(false)
    setTimeout(() => setShake(true), 10)
    setTimeout(() => firstErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nextErrors = {}
    if (!formData.serviceName.trim()) nextErrors.serviceName     = 'Service name is required.'
    if (!formData.amount || Number(formData.amount) <= 0)        nextErrors.amount = 'Amount must be greater than 0.'
    if (!formData.nextRenewalDate)    nextErrors.nextRenewalDate = 'Renewal date is required.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      triggerShake()
      return
    }

    // Check if phone number is required but missing
    const needsPhone = formData.reminders.sms || formData.reminders.whatsapp
    if (needsPhone && !userPhone) {
      setShowPhoneModal(true)
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/subscriptions', {
        serviceName:     formData.serviceName,
        amount:          Number(formData.amount),
        billingCycle:    formData.billingCycle,
        nextRenewalDate: new Date(formData.nextRenewalDate).toISOString(),
        category:        formData.category,
        sourceType:      'manual',
        notes:           formData.notes || null,
        reminders:       formData.reminders,
        userEmail:       user?.email
      })
      toast.success('Subscription added!')
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        const fieldErrors = {}
        for (const e of err.response.data.errors) {
          if (e.field) fieldErrors[e.field] = e.message
        }
        setErrors(fieldErrors)
        triggerShake()
      }
    } finally {
      setSubmitting(false)
    }
  }

  /* ── render ───────────────────────────────────── */
  return (
    <PageLayout activePage="home">
      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 md:px-8 pb-16 min-h-screen">

          {/* ── Header ── */}
          <div className="mt-8 mb-10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </button>

            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
              Add Subscription
            </h1>
            <p className="mt-2 text-base text-on-surface-variant">
              Track a new recurring expense.
            </p>
          </div>

          {/* ── Form card ── */}
          <form
            onSubmit={handleSubmit}
            className={`bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-[0_8px_32px_-4px_rgba(25,27,36,0.06)] p-6 md:p-10 mt-6 space-y-8 ${shake ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}
          >

            {/* ── SECTION A: Basic Info ── */}
            <section>
              <SectionLabel>Basic Info</SectionLabel>

              {/* Service name */}
              <div className="mb-5" ref={errors.serviceName ? firstErrorRef : null}>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">
                  Service Name *
                </label>
                  <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  placeholder="e.g. Netflix, Spotify, Adobe..."
                  className={`${inputClass(errors, 'serviceName')} text-base md:text-sm min-h-[48px]`}
                />
                <FieldError message={errors.serviceName} />
              </div>

              {/* Amount + Billing Cycle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div ref={errors.amount ? firstErrorRef : null}>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">
                    Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold select-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      className={`${inputClass(errors, 'amount')} text-base md:text-sm min-h-[48px] pl-8`}
                    />
                  </div>
                  <FieldError message={errors.amount} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">
                    Billing Cycle
                  </label>
                  <div className="relative">
                    <select
                      name="billingCycle"
                      value={formData.billingCycle}
                      onChange={handleChange}
                      className={`${inputClass(errors, 'billingCycle')} appearance-none cursor-pointer text-base md:text-sm min-h-[48px]`}
                    >
                      <option>Monthly</option>
                      <option>Quarterly</option>
                      <option>Yearly</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── SECTION B: Renewal & Category ── */}
            <section>
              <SectionLabel>Renewal &amp; Category</SectionLabel>

              {/* Date */}
              <div className="mb-5" ref={errors.nextRenewalDate ? firstErrorRef : null}>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">
                  Next Renewal Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="nextRenewalDate"
                    value={formData.nextRenewalDate}
                    onChange={handleChange}
                    onClick={(e) => e.target.showPicker?.()}
                    className={`${inputClass(errors, 'nextRenewalDate')} pr-12 text-base md:text-sm min-h-[48px] cursor-pointer`}
                  />
                  <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    calendar_month
                  </span>
                </div>
                <FieldError message={errors.nextRenewalDate} />
              </div>

              {/* Category visual picker */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-3">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => {
                    const isSelected = formData.category === cat.label
                    return (
                      <motion.button
                        key={cat.label}
                        type="button"
                        onClick={() => handleCategorySelect(cat.label)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                            : 'border-transparent bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:border-outline-variant/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                        <span className="text-[10px] font-bold leading-tight">{cat.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* ── SECTION C: Reminder Preference ── */}
            <section>
              <SectionLabel>Reminder Preference</SectionLabel>

              {/* Timing pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {REMINDER_OPTIONS.map(opt => {
                  const isSelected = selectedReminder === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedReminder(opt.value)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-on-surface text-surface border-transparent'
                          : 'bg-surface-container text-on-surface-variant border-outline-variant/10 hover:bg-surface-container-high'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {/* Notification channels */}
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {[
                  { key: 'push',  label: 'Push Notification' },
                  { key: 'email', label: 'Email' },
                  { key: 'sms',   label: 'SMS' },
                  { key: 'whatsapp', label: 'WhatsApp' },
                ].map(ch => (
                  <label key={ch.key} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reminders[ch.key]}
                      onChange={() => handleReminderChange(ch.key)}
                      className="w-5 h-5 rounded border-2 border-outline-variant accent-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:border-transparent border-transparent cursor-pointer"
                    />
                    <span className="text-sm font-medium text-on-surface">{ch.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* ── SECTION D: Notes ── */}
            <section>
              <SectionLabel>Notes (optional)</SectionLabel>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                maxLength={200}
                placeholder="Any extra notes about this subscription..."
                className={`${inputBase} resize-none`}
              />
              <p className="text-xs text-outline text-right mt-1">
                {formData.notes.length}/200
              </p>
            </section>

            {/* ── Footer ── */}
            <div className="border-t border-outline-variant/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-outline">* Required fields</p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container hover:brightness-110 transition-all"
                >
                  Cancel
                </button>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : {}}
                  whileTap={!submitting ? { scale: 0.97 } : {}}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest text-white signature-gradient shadow-lg shadow-primary/20 transition-all hover:brightness-110 ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Subscription'
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </div>
        <PhoneInputModal 
          isOpen={showPhoneModal} 
          onClose={() => setShowPhoneModal(false)}
          userEmail={user?.email}
          onPhoneUpdated={(phone) => {
            setUserPhone(phone)
            // Optional: immediately trigger submit or let user click again
            toast.success('Phone updated. You can now save your subscription.')
          }}
        />
      </PageTransition>
    </PageLayout>
  )
}

export default AddManuallyPage

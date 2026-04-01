import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'
import PageLayout from '../components/PageLayout'
import PageTransition from '../components/PageTransition'
import Spinner from '../components/Spinner'
import confetti from 'canvas-confetti'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatDate } from '../utils/formatUtils'

const categoryOptions = ['OTT', 'Music', 'Food', 'Productivity', 'Cloud', 'Fitness', 'Gaming', 'Other']

function getCategoryIcon(category) {
  const map = {
    OTT: 'smart_display', Music: 'music_note', Food: 'restaurant',
    Productivity: 'work', Cloud: 'cloud', Fitness: 'fitness_center',
    Gaming: 'sports_esports',
  }
  return map[category] || 'category'
}

function getConfidenceStyles(level) {
  if (level === 'High')   return 'bg-secondary-container text-on-secondary-container'
  if (level === 'Low')    return 'bg-tertiary-fixed text-on-tertiary-fixed'
  return 'bg-primary-fixed text-on-primary-fixed'
}

const inputBase =
  'w-full bg-surface-container rounded-xl border border-transparent px-4 py-3.5 font-medium text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:border-transparent transition-all duration-200'

function ConfirmPage() {
  useDocumentTitle('Confirm Subscription — NiroCore')
  const navigate = useNavigate()
  const location = useLocation()
  const stateData = location.state
  const data = stateData

  console.log('[Confirm Subscription] Incoming data:', data)

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [shake, setShake] = useState(false)
  const [formData, setFormData] = useState({
    serviceName:     stateData?.serviceName     || '',
    category:        stateData?.category        || 'OTT',
    amount:          stateData?.amount ?? '',
    billingCycle:    stateData?.billingCycle && stateData?.billingCycle !== 'Unknown' ? stateData?.billingCycle : '',
    nextRenewalDate: stateData?.nextRenewalDate ?? '',
    confidence:      stateData?.confidence      || 'Medium',
  })

  const confidenceClassName = useMemo(() => getConfidenceStyles(formData.confidence), [formData.confidence])
  const hasAmount = formData.amount !== null && formData.amount !== undefined && formData.amount !== ''
  const amountDisplay = formData.amount !== null && formData.amount !== undefined && formData.amount !== '' ? `₹${formData.amount}` : 'Not detected'
  const billingCycleDisplay = formData.billingCycle && formData.billingCycle !== 'Unknown' ? formData.billingCycle : 'Not detected'
  const renewalDisplay = formData.nextRenewalDate ? formatDate(formData.nextRenewalDate) : 'Not available'
  const showMissingDataWarning = stateData?.amount === null || stateData?.nextRenewalDate === null

  /* ── Empty state guard ── */
  if (!stateData) {
    return (
      <PageLayout activePage="home">
        <PageTransition>
          <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 md:px-8 text-center">
            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-10 shadow-[0_24px_40px_-12px_rgba(25,27,36,0.08)]">
              <span className="material-symbols-outlined text-4xl text-tertiary">warning</span>
              <h1 className="mt-4 font-headline text-3xl font-extrabold tracking-tight text-on-surface">
                No extraction data found
              </h1>
              <p className="mt-2 text-base text-on-surface-variant">
                Upload a screenshot first so we can pre-fill your subscription details.
              </p>
              <button
                type="button"
                onClick={() => navigate('/scan')}
                className="mt-6 rounded-full bg-on-surface px-6 py-3 text-sm font-bold uppercase tracking-widest text-white"
              >
                Back to Scan
              </button>
            </div>
          </section>
        </PageTransition>
      </PageLayout>
    )
  }

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const triggerShake = () => {
    setShake(false)
    setTimeout(() => setShake(true), 10)
  }

  const handleConfirmTrack = async (e) => {
    if (e) e.preventDefault()

    const rawErrors = {}
    if (!formData.serviceName)     rawErrors.serviceName     = 'Service Name is required'
    if (!formData.amount)          rawErrors.amount          = 'Amount is required'
    if (!formData.billingCycle || formData.billingCycle === 'Unknown' || formData.billingCycle === 'Variable') {
      rawErrors.billingCycle = 'Please select Monthly, Quarterly, or Yearly.'
    }
    if (!formData.nextRenewalDate) rawErrors.nextRenewalDate = 'Renewal Date is required'

    if (Object.keys(rawErrors).length > 0) {
      setErrors(rawErrors)
      triggerShake()
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
        sourceType:      'ocr',
      })
      toast.success('Subscription saved!')
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#0040e0', '#006d42', '#62feaf'] })
      setTimeout(() => navigate('/dashboard'), 500)
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        const fieldErrors = {}
        err.response.data.errors.forEach(e => { if (e.field) fieldErrors[e.field] = e.message })
        setErrors(fieldErrors)
        triggerShake()
      } else {
        toast.error('Failed to confirm subscription.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) => `${inputBase} ${errors[field] ? 'ring-2 ring-red-400' : ''}`

  return (
    <PageLayout activePage="home">
      <PageTransition>
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 pb-16">
          {/* Back + header */}
          <div className="mt-8 mb-8">
            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Scan
            </button>

            <span className="inline-flex rounded-sm bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
              AI Detection
            </span>
            <h1 className="mt-4 font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">
              Confirm Subscription
            </h1>
            <p className="mt-2 text-base md:text-lg text-on-surface-variant">
              Verify the detected details before we start tracking this recurring charge.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* ── Insights aside (desktop only) ── */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="rounded-2xl bg-surface-container-low p-8 space-y-4">
                <div className="flex items-start gap-4 rounded-xl border border-outline-variant/10 bg-white p-4 shadow-sm">
                  <span className="material-symbols-outlined rounded-lg bg-tertiary-container p-2 text-tertiary">event_repeat</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Upcoming renewal</p>
                    <p className="mt-1 text-sm text-on-surface-variant">Your account will be debited soon via OCR detection.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-xl border border-outline-variant/10 bg-white p-4 shadow-sm">
                  <span className="material-symbols-outlined rounded-lg bg-secondary-container p-2 text-secondary">hourglass_empty</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Trial ending soon</p>
                    <p className="mt-1 text-sm text-on-surface-variant">Double check conditions if this is an introductory cycle.</p>
                  </div>
                </div>
                <div className="relative mt-4 overflow-hidden rounded-xl">
                  <div className="aspect-video bg-surface-container flex items-center justify-center opacity-50">
                    <span className="material-symbols-outlined text-5xl">document_scanner</span>
                  </div>
                  <div className="glass-effect absolute inset-x-0 bottom-0 bg-white/60 px-4 py-3 text-sm font-medium text-on-surface-variant">
                    Curating your digital life, one subscription at a time.
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Main card ── */}
            <div className="w-full lg:col-span-8">
              <article className={`rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 md:p-10 shadow-[0_32px_48px_-8px_rgba(25,27,36,0.06)] ${shake ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>

                {/* Service header */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-on-surface text-white shrink-0">
                      <span className="material-symbols-outlined text-3xl">{getCategoryIcon(formData.category)}</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-headline text-xl md:text-2xl font-extrabold tracking-tight text-on-surface truncate">
                        {formData.serviceName || 'Detected Service'}
                      </h2>
                      <p className="text-xs uppercase tracking-wide text-on-surface-variant mt-0.5">Extracted subscription</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter text-on-surface">
                      {amountDisplay}
                    </p>
                    <p className="text-sm text-on-surface-variant">Cycle: {billingCycleDisplay}</p>
                    <p className="text-sm text-on-surface-variant">Next renewal: {renewalDisplay}</p>
                  </div>
                </div>

                {/* Confidence badge — prominent placement with tooltip */}
                <div className="mb-6 flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${confidenceClassName}`}>
                    Confidence: {formData.confidence}
                  </span>
                  <span className="group relative cursor-help">
                    <span className="material-symbols-outlined text-sm text-outline">info</span>
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-xl bg-on-surface px-3 py-2 text-xs text-surface opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      How accurately we read your screenshot
                    </span>
                  </span>
                </div>

                {formData.confidence === 'Low' && (
                  <div className="mb-5 rounded-xl bg-tertiary-fixed/30 p-3 text-sm text-tertiary">
                    OCR wasn't perfect — please fill in any missing information before saving.
                  </div>
                )}

                {showMissingDataWarning && (
                  <div className="mb-5 rounded-xl bg-tertiary-fixed/30 p-3 text-sm text-tertiary">
                    Some details could not be detected. Please verify before confirming.
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleConfirmTrack} className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Service name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">Service Name</label>
                    <div className="relative group">
                      <input type="text" name="serviceName" value={formData.serviceName || ''} onChange={handleChange} className={`${inputClass('serviceName')} text-base md:text-sm min-h-[48px]`} />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline/40 text-sm opacity-0 group-focus-within:opacity-100 transition-opacity">edit</span>
                    </div>
                    {errors.serviceName && <p className="mt-1.5 ml-1 text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.serviceName}</p>}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">Category</label>
                    <div className="relative">
                      <select name="category" value={formData.category} onChange={handleChange} className={`${inputClass('category')} appearance-none cursor-pointer text-base md:text-sm min-h-[48px]`}>
                        {categoryOptions.map(o => <option key={o}>{o}</option>)}
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">expand_more</span>
                    </div>
                    {errors.category && <p className="mt-1.5 ml-1 text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.category}</p>}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">Billing Amount</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold select-none">₹</span>
                      <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className={`${inputClass('amount')} pl-8 text-base md:text-sm min-h-[48px]`} />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline/40 text-sm opacity-0 group-focus-within:opacity-100 transition-opacity">edit</span>
                    </div>
                    {errors.amount && <p className="mt-1.5 ml-1 text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.amount}</p>}
                  </div>

                  {/* Billing cycle */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">Billing Cycle</label>
                    <div className="relative">
                      <select name="billingCycle" value={formData.billingCycle} onChange={handleChange} className={`${inputClass('billingCycle')} appearance-none cursor-pointer text-base md:text-sm min-h-[48px]`}>
                        <option value="">Not detected</option>
                        <option>Variable</option>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                        <option>Yearly</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">expand_more</span>
                    </div>
                    {errors.billingCycle && <p className="mt-1.5 ml-1 text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.billingCycle}</p>}
                  </div>

                  {/* Renewal date */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">Next Renewal Date</label>
                    <div className="relative group">
                      <input type="date" name="nextRenewalDate" value={formData.nextRenewalDate || ''} onChange={handleChange} className={`${inputClass('nextRenewalDate')} pr-12 text-base md:text-sm min-h-[48px]`} />
                      <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">calendar_month</span>
                    </div>
                    {errors.nextRenewalDate && <p className="mt-1.5 ml-1 text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.nextRenewalDate}</p>}
                  </div>

                  <button type="submit" className="hidden" />
                </form>

                {/* Footer actions */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-outline-variant/10 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container hover:brightness-110 transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    onClick={handleConfirmTrack}
                    disabled={submitting}
                    whileHover={!submitting ? { scale: 1.02 } : {}}
                    whileTap={!submitting ? { scale: 0.97 } : {}}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest text-white signature-gradient shadow-lg shadow-primary/20 transition-all hover:brightness-110 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? <Spinner className="w-5 h-5" /> : 'CONFIRM & TRACK'}
                  </motion.button>
                </div>
              </article>
            </div>
          </div>
        </div>
      </PageTransition>
    </PageLayout>
  )
}

export default ConfirmPage

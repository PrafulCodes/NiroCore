import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import PageLayout from '../components/PageLayout'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import toast from 'react-hot-toast'
import FeatureCards from '../components/FeatureCards'

function LandingPage() {
  useDocumentTitle('NiroCore — Track Subscriptions')
  const navigate = useNavigate()

  const handleAction = (key) => {
    navigate(`/${key}`)
  }

  const handleAsk = (question) => {
    toast.success(`We've queued your question! ${question}`, {
      icon: '🙋',
      style: {
        borderRadius: '1rem',
        background: '#333',
        color: '#fff',
      },
    })
  }

  return (
    <PageLayout activePage="home">
      <PageTransition>
          {/* ── Hero ── */}
          <section className="hero-gradient mx-auto grid max-w-screen-2xl grid-cols-12 items-center gap-8 px-4 md:px-8 lg:px-12 py-12 md:py-20">
            {/* Left copy */}
            <div className="col-span-12 space-y-6 lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-sm bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
                <span className="material-symbols-outlined text-sm">verified</span>
                Intelligent Subscription Auditor
              </div>

              <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-on-surface leading-[1.05]">
                Find hidden{' '}
                <span className="text-primary italic">subscriptions</span>{' '}
                before they drain your money.
              </h1>

              <p className="max-w-xl text-base md:text-lg text-on-surface-variant leading-relaxed">
                NiroCore uses OCR and intelligent pattern recognition to audit your
                spending habits from a simple screenshot.
              </p>

              {/* CTA buttons — stack on mobile */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/scan')}
                  className="signature-gradient inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold tracking-widest text-white shadow-xl"
                >
                  <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                  SCAN SCREENSHOT
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/add')}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-lowest px-8 py-4 text-sm font-bold tracking-wider text-primary"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  ADD MANUALLY
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex -space-x-3">
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-primary-container" />
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-secondary-container" />
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-tertiary-fixed-dim" />
                </div>
                <p className="text-sm text-on-surface-variant">Never miss what matters, again.</p>
              </div>
            </div>

            {/* Right — Dashboard mockup (no external images) */}
            <div className="relative col-span-12 lg:col-span-6">
              <div className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]" />

              <div className="group bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0_32px_64px_-12px_rgba(25,27,36,0.12)] border border-outline-variant/20">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                      Your Spending, Simplified
                    </p>
                    <p className="font-headline text-2xl font-extrabold text-on-surface tracking-tight">
                      Subscription Tracker
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                  </div>
                </div>

                {/* 3 Feature Rows */}
                <div className="space-y-3">
                  
                  <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl group-hover:translate-x-1 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        qr_code_scanner
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-on-surface">
                        Scan any screenshot
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        UPI, bank statement, app store
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-outline text-[18px]">
                      check_circle
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl group-hover:translate-x-1 transition-all duration-300 delay-75">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[20px]">
                        notifications_active
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-on-surface">
                        Renewal alerts
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        3 days, 1 day, same day
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-outline text-[18px]">
                      check_circle
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl group-hover:translate-x-1 transition-all duration-300 delay-150">
                    <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary text-[20px]">
                        contract_delete
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-on-surface">
                        Step-by-step cancel guide
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        For every major service
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-outline text-[18px]">
                      check_circle
                    </span>
                  </div>

                </div>

                {/* Bottom CTA strip */}
                <div className="mt-6 p-4 bg-primary/5 rounded-xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">shield</span>
                  <p className="text-xs font-semibold text-on-surface">
                    No bank login. No card details. 
                    <span className="text-primary"> Zero friction.</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <FeatureCards onAction={handleAction} onAsk={handleAsk} />
      </PageTransition>
    </PageLayout>
  )
}

export default LandingPage

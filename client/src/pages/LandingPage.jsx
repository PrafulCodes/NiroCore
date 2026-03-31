import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import PageLayout from '../components/PageLayout'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatINR } from '../utils/formatUtils'

const MOCK_SUBSCRIPTIONS = [
  { icon: 'smart_display', color: 'text-primary', bg: 'bg-primary/10', name: 'Netflix', category: 'OTT', days: '4 days', amount: 649 },
  { icon: 'cloud',         color: 'text-secondary', bg: 'bg-secondary/10', name: 'Google One', category: 'Cloud', days: '8 days', amount: 130 },
  { icon: 'music_note',    color: 'text-tertiary', bg: 'bg-tertiary/10', name: 'Spotify', category: 'Music', days: '12 days', amount: 119 },
]

function LandingPage() {
  useDocumentTitle('NiroCore — Track Subscriptions')
  const navigate = useNavigate()

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
                <p className="text-sm text-on-surface-variant">Trusted by 12,000+ meticulous savers.</p>
              </div>
            </div>

            {/* Right — Dashboard mockup (no external images) */}
            <div className="relative col-span-12 lg:col-span-6">
              <div className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]" />

              <div className="group glass-effect relative rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_32px_64px_-12px_rgba(25,27,36,0.12)]">
                {/* Header stat */}
                <div className="rounded-2xl bg-surface-container-low p-6">
                  <p className="text-sm text-on-surface-variant">Total Monthly Burn</p>
                  <p className="mt-2 font-headline text-5xl font-extrabold tracking-tighter text-on-surface">
                    {formatINR(898)}
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant">3 active subscriptions tracked</p>
                </div>

                {/* Subscription rows */}
                <div className="mt-5 space-y-3">
                  {MOCK_SUBSCRIPTIONS.map((item, i) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl bg-surface-container p-4 group-hover:translate-x-1 transition-all duration-300"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined rounded-lg ${item.bg} p-2 ${item.color}`}>
                          {item.icon}
                        </span>
                        <div>
                          <p className="font-semibold text-on-surface">{item.name}</p>
                          <p className="text-xs text-on-surface-variant">Renews in {item.days}</p>
                        </div>
                      </div>
                      <p className="font-headline text-lg font-extrabold text-on-surface">
                        {formatINR(item.amount)}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-high px-6 py-3 text-sm font-semibold text-on-surface"
                >
                  Generate Cancel Guide
                </button>
              </div>
            </div>
          </section>

          {/* ── Feature strip ── */}
          <section className="mx-auto mt-20 md:mt-32 grid max-w-screen-2xl grid-cols-1 gap-4 md:gap-6 px-4 md:px-8 lg:px-12 pb-8 md:grid-cols-3">
            {[
              {
                icon: 'photo_camera', color: 'text-primary',
                bg: 'rounded-[1.5rem] bg-surface-container-low p-8 md:p-10',
                title: 'Screenshot capture',
                body: 'Upload spending screenshots in seconds and instantly begin your audit.',
              },
              {
                icon: 'notification_important', color: 'text-secondary',
                bg: 'rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-8 md:p-10',
                title: 'Renewal reminders',
                body: 'Receive proactive nudges before every renewal window and avoid silent charges.',
              },
              {
                icon: 'contract_delete', color: 'text-tertiary',
                bg: 'rounded-[1.5rem] bg-surface-container-low p-8 md:p-10',
                title: 'Cancel guides',
                body: 'Follow clear cancellation playbooks tailored to each subscription type.',
              },
            ].map(card => (
              <article
                key={card.title}
                className={`${card.bg} hover:-translate-y-1 transition-transform duration-200`}
              >
                <span className={`material-symbols-outlined text-3xl ${card.color}`}>{card.icon}</span>
                <h3 className="mt-6 font-headline text-xl md:text-2xl font-bold tracking-tight text-on-surface">{card.title}</h3>
                <p className="mt-3 text-sm md:text-base text-on-surface-variant leading-relaxed">{card.body}</p>
                <button type="button" className="mt-5 inline-block text-sm font-semibold text-on-surface underline">
                  Learn more →
                </button>
              </article>
            ))}
          </section>
      </PageTransition>
    </PageLayout>
  )
}

export default LandingPage

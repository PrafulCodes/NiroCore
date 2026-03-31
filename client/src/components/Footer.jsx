import { useNavigate } from 'react-router-dom'

function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="border-t border-slate-200/20 bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">NiroCore</h2>
          <p className="mt-2 text-sm text-slate-500">
            © 2026 NiroCore. Editorial Precision in Fintech.
          </p>
        </div>

        <div className="flex items-center gap-3 lg:justify-end">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
            Get Started
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/20 text-on-surface-variant text-xs font-bold uppercase tracking-wider hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            Dashboard
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer

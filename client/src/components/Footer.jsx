function Footer() {
  return (
    <footer className="border-t border-slate-200/20 bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">NiroCore</h2>
          <p className="mt-2 text-sm text-slate-500">
            © 2026 NiroCore. Editorial Precision in Fintech.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
          <button type="button" className="text-sm text-slate-500 underline transition-colors hover:text-indigo-500">
            Privacy Policy
          </button>
          <button type="button" className="text-sm text-slate-500 underline transition-colors hover:text-indigo-500">
            Terms of Service
          </button>
          <button type="button" className="text-sm text-slate-500 underline transition-colors hover:text-indigo-500">
            Support
          </button>
          <button type="button" className="text-sm text-slate-500 underline transition-colors hover:text-indigo-500">
            Security
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer

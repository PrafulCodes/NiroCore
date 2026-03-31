import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { label: 'Home', key: 'home', to: '/' },
  { label: 'Dashboard', key: 'dashboard', to: '/dashboard' },
  { label: 'Reminders', key: 'reminders', to: '/notifications' },
]

function TopNavBar({
  activePage,
  isDemo,
  onAddManually,
  onScanScreenshot,
  onNotifications,
}) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleAddManually = onAddManually || (() => navigate('/add'))
  const handleScanScreenshot = onScanScreenshot || (() => navigate('/scan'))
  const handleNotifications = onNotifications || (() => navigate('/notifications'))

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.relative')) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 w-full z-[9999] bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_-4px_rgba(25,27,36,0.08)] border-b border-slate-100/80"
      style={{ top: isDemo ? '32px' : '0px' }}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-headline text-2xl font-bold tracking-tight text-indigo-900"
          >
            NiroCore
          </Link>

          <div className="hidden items-center gap-6 md:flex" role="navigation">
            {navItems.map((item) => {
              const isActive = item.key === activePage

              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`relative pb-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 ${
                    isActive
                      ? 'font-semibold text-primary after:w-full'
                      : 'border-transparent text-on-surface-variant hover:text-slate-900 after:w-0 hover:after:w-full'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddManually}
            className="hidden rounded-full border border-outline-variant/20 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 md:inline-flex"
          >
            Add Manually
          </button>

          <button
            type="button"
            onClick={handleScanScreenshot}
            className="signature-gradient hidden rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 md:inline-flex"
          >
            Scan Screenshot
          </button>

          <button
            type="button"
            onClick={handleNotifications}
            aria-label="Notifications"
            className="hidden h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 md:flex"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>



          {/* User profile dropdown or Sign In button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url}
                    className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
                    alt="User profile"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-[0_16px_48px_-8px_rgba(25,27,36,0.12)] border border-outline-variant/10 overflow-hidden z-[10000]">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-outline-variant/10">
                    <p className="font-semibold text-sm text-on-surface truncate">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  
                  {/* Menu items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/account')
                        setDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                      My Account
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/dashboard')
                        setDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-[20px]">dashboard</span>
                      Dashboard
                    </button>
                    
                    <div className="border-t border-outline-variant/10 mt-1 pt-1">
                      <button
                        onClick={async () => {
                          await signOut()
                          navigate('/')
                          setDropdownOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-error hover:bg-error/5 transition-colors cursor-pointer text-left"
                      >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
            >
              <span className="material-symbols-outlined">person</span>
            </button>
          )}

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 md:hidden"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
      <div
        className={`overflow-hidden border-t border-slate-100/60 bg-white transition-all duration-200 md:hidden ${
          menuOpen ? 'max-h-64 py-3' : 'max-h-0 py-0'
        }`}
      >
        <div className="flex flex-col px-4" role="navigation">
          {navItems.map((item) => {
            const isActive = item.key === activePage
            return (
              <Link
                key={item.key}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              handleAddManually()
            }}
            className="mt-2 rounded-full border border-outline-variant/20 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
          >
            Add Manually
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              handleScanScreenshot()
            }}
            className="signature-gradient mt-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
          >
            Scan Screenshot
          </button>
        </div>
      </div>
      <div className="h-[1px] bg-slate-100/50" />
    </nav>
  )
}

export default TopNavBar

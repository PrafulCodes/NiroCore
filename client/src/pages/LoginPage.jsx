import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import toast from 'react-hot-toast'

function LoginPage() {
  useDocumentTitle('Sign In — NiroCore')
  const [isLoading, setIsLoading] = useState(false)
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
    } catch (error) {
      toast.error('Sign in failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="max-w-sm w-full mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-[0_32px_64px_-12px_rgba(25,27,36,0.10)] p-8 md:p-10">
        {/* LOGO + BRAND */}
        <div className="text-center mb-8">
          <span className="font-headline text-3xl font-extrabold tracking-tight text-indigo-900">
            NiroCore
          </span>
          <p className="text-on-surface-variant text-sm mt-2">
            Track subscriptions before they drain your money.
          </p>
        </div>

        {/* ILLUSTRATION */}
        <div className="bg-surface-container rounded-2xl p-6 mb-8 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">smart_display</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">music_note</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary">restaurant</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-on-surface">
            Stop overpaying for subscriptions
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            Average user saves ₹2,400/year
          </p>
        </div>

        {/* SIGN IN BUTTON */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-surface-container-lowest border-2 border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-low active:scale-[0.98] transition-all duration-200 font-semibold text-on-surface text-sm shadow-sm hover:shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* DIVIDER + TERMS */}
        <p className="text-center text-xs text-on-surface-variant mt-6 leading-relaxed">
          By signing in, you agree to track your subscriptions responsibly.
          <br/>No bank access. No card details.
        </p>
      </div>
    </div>
  )
}

export default LoginPage

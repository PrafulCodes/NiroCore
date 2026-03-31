import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import api from '../api/client'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'

function DemoResetPage() {
  const navigate = useNavigate()
  const [resetting, setResetting] = useState(false)

  const handleReset = async () => {
    setResetting(true)
    try {
      await api.get('/api/demo/reset')
      toast.success('App reset. Ready for demo!')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Failed to reset app.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <PageLayout activePage="home">
      <div className="page-enter">
        <section className="mx-auto flex w-full max-w-lg flex-col items-center px-4 pt-20 text-center">
          <div className="w-full rounded-2xl border-2 border-dashed border-error/30 bg-error/5 p-10">
            <span className="material-symbols-outlined text-6xl text-error mb-4">gavel</span>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface">
              NiroCore Demo
            </h1>
            <p className="mt-3 text-on-surface-variant">
              This action will permanently delete all subscriptions and reminder logs from the database.
            </p>
            
            <button
              onClick={handleReset}
              disabled={resetting}
              className={`mt-8 w-full rounded-xl flex items-center justify-center gap-2 bg-error px-6 py-4 font-bold tracking-widest text-white shadow-xl transition-opacity hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${
                resetting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {resetting ? <Spinner /> : 'RESET ALL DATA'}
            </button>
            <button
               onClick={() => navigate('/dashboard')}
               className="mt-4 w-full rounded-xl bg-surface-container py-4 font-semibold text-on-surface-variant hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}

export default DemoResetPage

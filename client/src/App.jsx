import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import ScrollToTop from './components/ScrollToTop'
import AddManuallyPage from './pages/AddManuallyPage'
import ConfirmPage from './pages/ConfirmPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import NotificationsPage from './pages/NotificationsPage'
import ScanPage from './pages/ScanPage'
import SubscriptionDetailPage from './pages/SubscriptionDetailPage'
import DemoResetPage from './pages/DemoResetPage'

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-body text-sm font-medium',
          style: {
            background: '#ffffff',
            color: '#191b24',
            border: '1px solid #e1e1ef',
            borderRadius: '0.75rem',
            boxShadow: '0 8px 32px -4px rgba(25,27,36,0.12)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#006d42', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ba1a1a', secondary: '#ffffff' },
          },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/add" element={<AddManuallyPage />} />
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subscription/:id" element={<SubscriptionDetailPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/demo" element={<DemoResetPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App

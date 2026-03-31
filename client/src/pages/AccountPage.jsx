import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/client'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import PageLayout from '../components/PageLayout'
import PageTransition from '../components/PageTransition'
import Skeleton from '../components/Skeleton'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatDate } from '../utils/formatUtils'

function StatBlock({ icon, label, value, loading }) {
  return (
    <div className="bg-surface-container-low rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
      {loading ? (
        <Skeleton className="h-10 w-16 rounded-lg mb-2" />
      ) : (
        <>
          <span className="material-symbols-outlined text-primary text-2xl mb-1">{icon}</span>
          <p className="font-headline text-xl font-bold text-on-surface">{value}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant mt-1">{label}</p>
        </>
      )}
    </div>
  )
}

function AccountPage() {
  useDocumentTitle('Account — NiroCore')
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
  })

  const [prefs, setPrefs] = useState({
    emailReminders: user?.user_metadata?.prefs?.emailReminders ?? true,
    smsReminders: user?.user_metadata?.prefs?.smsReminders ?? false,
    inAppAlerts: user?.user_metadata?.prefs?.inAppAlerts ?? true,
  })

  const [stats, setStats] = useState({ subs: 0, reminders: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  // Initial load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [subsRes, remRes] = await Promise.all([
          api.get('/api/subscriptions'),
          api.get('/api/reminders'),
        ])
        setStats({
          subs: Array.isArray(subsRes.data) ? subsRes.data.length : 0,
          reminders: Array.isArray(remRes.data) ? remRes.data.length : 0,
        })
      } catch (err) {
        console.error('Failed to fetch stats', err)
      } finally {
        setLoadingStats(false)
      }
    }
    fetchStats()
  }, [])

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: formData.fullName,
          phone: formData.phone
        }
      })
      if (error) throw error

      // Also sync to our backend
      await api.post('/api/user/update-phone', {
        email: user.email,
        phone: formData.phone,
        name: formData.fullName
      })

      toast.success('Profile updated!')
      setIsEditing(false)
    } catch (err) {
      toast.error('Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePref = async (key) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] }
    setPrefs(newPrefs)
    try {
      await supabase.auth.updateUser({
        data: { prefs: newPrefs }
      })
    } catch (err) {
      toast.error('Failed to update preferences.')
    }
  }

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        await api.get('/api/demo/reset')
        toast.success('All data cleared.')
        navigate('/dashboard')
      } catch (err) {
        toast.error('Failed to reset data.')
      }
    }
  }

  const initial = formData.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <PageLayout activePage="account">
      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 md:px-8 pt-6 pb-20">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6 cursor-pointer group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back
          </button>

          <header className="mb-10">
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
              My Account
            </h1>
            <p className="text-on-surface-variant text-base mt-2">
              Manage your profile and preferences.
            </p>
          </header>

          {/* SECTION 1 — PROFILE CARD */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/10 shadow-[0_8px_32px_-4px_rgba(25,27,36,0.06)] mb-6">
            <div className="flex items-center gap-5">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                  alt="Profile"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-extrabold text-2xl font-headline border-4 border-white shadow-lg">
                  {initial}
                </div>
              )}
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">
                  {formData.fullName || 'Your Name'}
                </h2>
                <p className="text-on-surface-variant text-sm mt-0.5">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Connected via Google
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2 — EDITABLE DETAILS FORM */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/10 shadow-[0_8px_32px_-4px_rgba(25,27,36,0.06)] mb-6">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-6">Personal Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">FULL NAME</label>
                <input 
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full rounded-xl px-4 py-3.5 text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-base md:text-sm ${
                    isEditing ? 'bg-surface border-2 border-outline-variant' : 'bg-surface-container-low border-none'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">EMAIL ADDRESS</label>
                  <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">From Google</span>
                </div>
                <input 
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 text-on-surface-variant font-medium opacity-70 text-base md:text-sm"
                />
                <p className="text-[10px] text-on-surface-variant mt-2 italic">Email is managed by your Google account</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">MOBILE NUMBER</label>
                <input 
                  type="tel"
                  placeholder="+919876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\s/g, '');
                    if (val.length <= 13) { // +91 + 10 digits
                      setFormData({...formData, phone: val});
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ') e.preventDefault();
                  }}
                  disabled={!isEditing}
                  className={`w-full rounded-xl px-4 py-3.5 text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-base md:text-sm ${
                    isEditing ? 'bg-surface border-2 border-outline-variant' : 'bg-surface-container-low border-none'
                  }`}
                />
                <p className="text-[10px] text-on-surface-variant mt-2 italic">Format: +91XXXXXXXXXX (no spaces)</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 border-2 border-outline-variant/20 rounded-full px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          fullName: user?.user_metadata?.full_name || '',
                          email: user?.email || '',
                          phone: user?.user_metadata?.phone || '',
                        })
                      }}
                      className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-full transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="signature-gradient px-8 py-2.5 text-sm font-bold text-white rounded-full transition-all hover:brightness-110 shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                      {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 3 — NOTIFICATION PREFERENCES */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/10 mb-6">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-6">Notification Preferences</h3>
            
            <div className="space-y-4">
              {[
                { key: 'emailReminders', label: 'Email reminders', icon: 'mail' },
                { key: 'smsReminders', label: 'SMS reminders', icon: 'sms' },
                { key: 'inAppAlerts', label: 'In-app alerts', icon: 'notifications' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer group" onClick={() => handleTogglePref(item.key)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className="font-medium text-on-surface">{item.label}</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-colors relative ${prefs[item.key] ? 'bg-primary' : 'bg-outline-variant/30'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${prefs[item.key] ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4 — ACCOUNT STATS */}
          <section className="grid grid-cols-3 gap-3 mb-6">
            <StatBlock 
              icon="calendar_today" 
              label="MEMBER SINCE" 
              value={formatDate(user?.created_at)} 
              loading={loadingStats}
            />
            <StatBlock 
              icon="receipt_long" 
              label="TRACKED" 
              value={stats.subs} 
              loading={loadingStats}
            />
            <StatBlock 
              icon="notifications" 
              label="REMINDERS" 
              value={stats.reminders} 
              loading={loadingStats}
            />
          </section>

          {/* SECTION 5 — DANGER ZONE */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border-2 border-error/10 mb-8 overflow-hidden">
            <h3 className="font-headline font-bold text-lg text-error mb-8">Danger Zone</h3>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-error/5 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined">logout</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Sign Out</h4>
                    <p className="text-xs text-on-surface-variant">Sign out of NiroCore on this device</p>
                  </div>
                </div>
                <button 
                  onClick={signOut}
                  className="px-5 py-2.5 rounded-full border-2 border-error/20 text-error font-bold text-sm hover:bg-error/5 transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-error/5 pt-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-error/5 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined">delete_forever</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Clear All Data</h4>
                    <p className="text-xs text-on-surface-variant">Remove all tracked subscriptions</p>
                  </div>
                </div>
                <button 
                  onClick={handleClearData}
                  className="px-5 py-2.5 rounded-full border-2 border-error/20 text-error font-bold text-sm hover:bg-error/5 transition-all cursor-pointer"
                >
                  Clear Data
                </button>
              </div>
            </div>
          </section>
        </div>
      </PageTransition>
    </PageLayout>
  )
}

export default AccountPage

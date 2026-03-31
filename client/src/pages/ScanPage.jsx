import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import PageTransition from '../components/PageTransition'
import api from '../api/client'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function ScanPage() {
  useDocumentTitle('Scan Screenshot — NiroCore')
  const navigate = useNavigate()
  const timeoutRef = useRef(null)
  const fileInputRef = useRef(null)
  const [progressKey, setProgressKey] = useState(0)

  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      toast.error("Only PNG/JPG images supported.")
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.")
      return
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setFile(selectedFile)
    setImagePreview(URL.createObjectURL(selectedFile))
    setIsLoading(false)
  }

  const clearSelection = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleExtract = async () => {
    if (!file) {
      toast.error("Please select an image first.")
      return
    }
    setIsLoading(true)
    setProgressKey(k => k + 1)

    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await api.post('/api/ocr/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/confirm', { state: response.data })
    } catch (err) {
      if (err.response?.status === 422) {
        toast.error("Couldn't read screenshot. Try manual entry.")
      } else {
        toast.error("Server error. Please try again.")
      }
      navigate('/add')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageLayout activePage="home">
      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 md:px-8 pb-16 min-h-screen">

          {/* Header */}
          <div className="mt-8 mb-10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </button>

            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
              Scan Screenshot
            </h1>
            <p className="mt-2 text-base text-on-surface-variant hidden md:block">
              Upload a billing screenshot and we'll auto-detect your subscription details.
            </p>
          </div>

          {/* ── Loading overlay ── */}
          {isLoading && (
            <div className="fixed inset-0 bg-surface/90 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-surface-container-lowest rounded-2xl p-10 text-center shadow-2xl max-w-xs w-full mx-4">
                <p className="font-headline text-4xl font-extrabold tracking-tighter animate-shimmer text-primary">
                  NiroCore
                </p>
                <p className="mt-3 text-sm text-on-surface-variant">Reading your screenshot...</p>
                {/* Animated progress bar */}
                <div className="mt-6 h-1.5 w-full rounded-full bg-surface-container overflow-hidden">
                  <div
                    key={progressKey}
                    className="h-1.5 rounded-full signature-gradient animate-progress-fill"
                  />
                </div>
                <p className="mt-3 text-xs text-outline">This may take a few seconds</p>
              </div>
            </div>
          )}

          {/* ── Upload area ── */}
          {!isLoading && (
            <>
              {/* Image preview after selection */}
              {file && imagePreview ? (
                <div className="relative rounded-2xl bg-surface-container p-2 mb-6">
                  <img
                    src={imagePreview}
                    alt="Selected screenshot preview"
                    className="w-full max-h-64 object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-on-surface/80 text-white text-sm font-bold hover:bg-on-surface transition-colors"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                  <p className="mt-2 text-xs text-on-surface-variant text-center truncate px-2">{file.name}</p>
                </div>
              ) : (
                <>
              {/* Mobile: tap-to-upload */}
              <div className="block md:hidden mb-6">
                <label
                  htmlFor="mobile-upload"
                  className="flex flex-col items-center justify-center h-48 w-full rounded-2xl cursor-pointer active:scale-[0.98] transition-all signature-gradient"
                >
                  <span className="material-symbols-outlined text-white text-5xl mb-3">
                    photo_camera
                  </span>
                  <span className="text-white font-bold text-base tracking-wide uppercase">
                    Tap to Upload
                  </span>
                  <span className="text-white/70 text-xs mt-1">
                    PNG, JPG supported
                  </span>
                </label>
                <input
                  id="mobile-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {/* Desktop: dashed drag-and-drop zone */}
              <div className="hidden md:block relative mb-6">
                    <div className="relative cursor-pointer rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest p-20 text-center transition-colors hover:border-primary/40 hover:bg-surface-container-low">
                      <input
                        ref={fileInputRef}
                        type="file"
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:border-transparent border-transparent"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                      />
                      <div className="pointer-events-none flex flex-col items-center">
                        <div className="h-20 w-20 flex items-center justify-center rounded-full bg-primary-container/10 text-primary">
                          <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                        </div>
                        <h3 className="mt-6 font-headline text-2xl font-bold text-on-surface">
                          Drop your screenshot here
                        </h3>
                        <p className="mt-2 text-on-surface-variant">PNG, JPG. Max 10MB.</p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                          {['UPI AUTOPAY', 'SUBSCRIPTION APP', 'PAYMENT RECEIPT'].map(tag => (
                            <span key={tag} className="rounded-sm border border-outline-variant/10 bg-surface-container px-4 py-1.5 text-xs font-medium tracking-wide text-on-surface-variant">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Extract button */}
              {file && (
                <button
                  type="button"
                  onClick={handleExtract}
                  className="signature-gradient w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20"
                >
                  Extract Subscriptions
                </button>
              )}

              {/* Fallback */}
              <div className="mt-8 text-center">
                <p className="text-sm text-on-surface-variant">Prefer to enter details manually?</p>
                <button
                  type="button"
                  onClick={() => navigate('/add')}
                  className="mt-3 rounded-full bg-surface-container-highest px-7 py-3 text-sm font-bold uppercase tracking-widest text-on-surface"
                >
                  ADD MANUALLY
                </button>
              </div>
            </>
          )}

          {/* Info cards */}
          <section className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-secondary/10 bg-secondary-container/20 p-6 md:p-8">
              <span className="material-symbols-outlined text-3xl text-secondary">security</span>
              <h2 className="mt-4 font-headline text-xl font-bold text-on-surface">Privacy First</h2>
              <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">We redact sensitive data automatically.</p>
            </article>
            <article className="rounded-xl border border-outline-variant/10 bg-surface-container-highest p-6 md:p-8">
              <span className="material-symbols-outlined text-3xl text-primary">auto_awesome</span>
              <h2 className="mt-4 font-headline text-xl font-bold text-on-surface">Smart Reminders</h2>
              <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">Scanning helps us set up precise recurring alerts.</p>
            </article>
          </section>
        </div>
      </PageTransition>
    </PageLayout>
  )
}

export default ScanPage

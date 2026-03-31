import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../api/client'

export default function PhoneInputModal({ isOpen, onClose, onShow, userEmail, onPhoneUpdated }) {
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Simple validation for +91XXXXXXXXXX
    const phoneRegex = /^\+91\d{10}$/
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid phone number (+91XXXXXXXXXX)')
      return
    }

    setIsSubmitting(true)
    try {
      await api.post('/api/user/update-phone', {
        email: userEmail,
        phone: phone
      })
      toast.success('Phone number linked!')
      onPhoneUpdated(phone)
      onClose()
    } catch (err) {
      console.error('Failed to update phone:', err)
      toast.error('Failed to save phone number.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[1000] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container-lowest w-full max-w-sm rounded-[32px] p-8 shadow-2xl pointer-events-auto border border-outline-variant/10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">sms</span>
                </div>
                
                <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
                  SMS & WhatsApp
                </h2>
                <p className="text-on-surface-variant text-sm mb-8 leading-relaxed px-2">
                  We need your phone number to send renewal reminders directly to your device.
                </p>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <div className="relative group text-left">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                      Phone Number
                    </label>
                    <input
                      autoFocus
                      type="tel"
                      placeholder="+91 99999 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-5 py-4 text-on-surface font-medium focus:outline-none focus:border-primary/50 transition-all text-base tracking-wider placeholder:text-outline/40"
                    />
                    <p className="text-[10px] text-outline mt-2 ml-1">Example: +919876543210</p>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full signature-gradient py-4 rounded-2xl text-white font-bold text-sm tracking-widest uppercase shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Link Phone Number'
                      )}
                    </motion.button>
                    
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-3 rounded-2xl text-on-surface-variant font-bold text-xs uppercase tracking-widest hover:bg-surface-container transition-all"
                    >
                      Maybe Later
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

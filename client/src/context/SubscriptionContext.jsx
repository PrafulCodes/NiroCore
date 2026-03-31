import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'nirocore-subscriptions'

const SubscriptionContext = createContext(null)

function getInitialSubscriptions() {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)
    if (!rawValue) return []

    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function createSubscriptionId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
}

export function SubscriptionProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState(() => getInitialSubscriptions())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
  }, [subscriptions])

  const addSubscription = useCallback((subscription) => {
    setSubscriptions((prev) => {
      const nextSubscription = {
        id: subscription.id || createSubscriptionId(),
        status: subscription.status || 'active',
        sourceType: subscription.sourceType || 'Manual',
        lastReminder: subscription.lastReminder || 'No reminder sent',
        ...subscription,
      }

      return [...prev, nextSubscription]
    })
  }, [])

  const updateSubscription = useCallback((id, updates) => {
    setSubscriptions((prev) =>
      prev.map((subscription) =>
        String(subscription.id) === String(id) ? { ...subscription, ...updates } : subscription,
      ),
    )
  }, [])

  const removeSubscription = useCallback((id) => {
    setSubscriptions((prev) => prev.filter((subscription) => String(subscription.id) !== String(id)))
  }, [])

  const value = useMemo(
    () => ({
      subscriptions,
      addSubscription,
      updateSubscription,
      removeSubscription,
    }),
    [addSubscription, removeSubscription, subscriptions, updateSubscription],
  )

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSubscriptions() {
  const context = useContext(SubscriptionContext)

  if (!context) {
    throw new Error('useSubscriptions must be used within SubscriptionProvider')
  }

  return context
}

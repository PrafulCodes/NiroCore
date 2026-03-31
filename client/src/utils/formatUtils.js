export const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export const getDaysRemainingText = (days, nextRenewalDate) => {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days >= 2 && days <= 6) return `In ${days} days`
  return formatDate(nextRenewalDate)
}

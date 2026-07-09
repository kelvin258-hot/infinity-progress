// Generate a stable session ID for anonymous visitors (for saved items, cart)
const SESSION_KEY = 'ip_session_id'

export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

// Format price in MZN
export function formatPrice(price) {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

// Generate order number
export function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'IP-'
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Countdown helper
export function getTimeRemaining(targetDate) {
  const total = new Date(targetDate).getTime() - Date.now()
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, centiseconds: 0 }
  }
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const seconds = Math.floor((total / 1000) % 60)
  const centiseconds = Math.floor((total % 1000) / 10)
  return { total, days, hours, minutes, seconds, centiseconds }
}

// Slugify
export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}

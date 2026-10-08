import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'IDR'): string {
  if (currency === 'IDR') return `Rp ${price.toLocaleString('id-ID')}`
  return price.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' })
}

/**
 * Format crypto USD prices with precision tailored to coin scale (e.g. PEPE $0.00000950 vs SUI $1.85 vs BTC $68,450.00)
 */
export function formatCryptoPrice(price: number): string {
  if (price === 0 || !price || isNaN(price)) return '$0.00'
  if (price < 0.00001) {
    return `$${price.toFixed(8)}`
  }
  if (price < 0.01) {
    return `$${price.toFixed(6)}`
  }
  if (price < 1) {
    return `$${price.toFixed(4)}`
  }
  if (price < 100) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
  }
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format equivalent IDR value with decimal support for sub-rupiah crypto valuations (e.g. PEPE Rp 0.15 vs SUI Rp 29.600)
 */
export function formatIDREquivalent(idr: number): string {
  if (idr === 0 || !idr || isNaN(idr)) return 'Rp 0'
  if (idr < 1 && idr > 0) {
    return `Rp ${idr.toFixed(2)}`
  }
  return `Rp ${Math.round(idr).toLocaleString('id-ID')}`
}

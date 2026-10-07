import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'IDR'): string {
  if (currency === 'IDR') return `Rp ${price.toLocaleString('id-ID')}`
  return price.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' })
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount?: number | null): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function normalizePhone(phone: string): string {
  return phone
    .replace(/\+/g, '')
    .replace(/^0/, '62')
    .replace(/[\s\-]/g, '')
}

export function getSizeSurcharge(size: string | null | undefined): number {
  if (!size) return 0
  const s = size.toUpperCase().replace(/\s+/g, '').trim()
  if (s === 'XXL' || s === '2XL' || s === '2X') return 5000
  if (s === 'XXXL' || s === '3XL' || s === '3X') return 10000
  if (s === 'XXXXL' || s === '4XL' || s === '4X') return 15000
  return 0
}

export interface ParsedItem {
  name: string;
  size: string | null;
  quantity: number;
}

export function parseOrderItemType(itemTypeStr: string): ParsedItem[] {
  if (!itemTypeStr) return []
  return itemTypeStr.split(itemTypeStr.includes("; ") ? "; " : ", ").map((part) => {
    const qtyMatch = part.match(/\s+x(\d+)$/)
    const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1
    let cleanItemName = qtyMatch ? part.replace(/\s+x\d+$/, "") : part

    const sizeMatch = cleanItemName.match(/\(Ukuran\s+([^)]+)\)/i)
    const size = sizeMatch ? sizeMatch[1] : null
    if (sizeMatch) {
      cleanItemName = cleanItemName.replace(/\s*\(Ukuran\s+[^)]+\)/i, "").trim()
    }

    return {
      name: cleanItemName.trim(),
      size,
      quantity,
    }
  })
}
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

export const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL"];

export type SizeStockMap = Record<string, number>;

export function parseSizeStocks(available_sizes: string[] | null | undefined, totalStock: number, size_stocks?: any): SizeStockMap {
  const result: SizeStockMap = {};
  
  if (size_stocks && typeof size_stocks === 'object' && Object.keys(size_stocks).length > 0) {
    DEFAULT_SIZES.forEach(sz => {
      result[sz] = typeof size_stocks[sz] === 'number' ? Math.max(0, size_stocks[sz]) : 0;
    });
    return result;
  }

  if (Array.isArray(available_sizes) && available_sizes.length > 0) {
    let hasFormattedSize = false;
    available_sizes.forEach(item => {
      if (typeof item === 'string' && item.includes(':')) {
        const [sz, qtyStr] = item.split(':');
        const cleanSz = sz.trim().toUpperCase();
        const qty = parseInt(qtyStr.trim(), 10);
        if (!isNaN(qty)) {
          result[cleanSz] = Math.max(0, qty);
          hasFormattedSize = true;
        }
      }
    });

    if (hasFormattedSize) {
      DEFAULT_SIZES.forEach(sz => {
        if (result[sz] === undefined) result[sz] = 0;
      });
      return result;
    }
  }

  // Fallback for legacy products: distribute totalStock or default
  const perSize = Math.max(0, Math.floor((totalStock || 0) / (available_sizes?.length || DEFAULT_SIZES.length)));
  DEFAULT_SIZES.forEach(sz => {
    result[sz] = perSize;
  });
  return result;
}

export function serializeSizeStocksToArray(sizeStocks: SizeStockMap): string[] {
  return DEFAULT_SIZES.map(sz => `${sz}:${Math.max(0, sizeStocks[sz] ?? 0)}`);
}

export interface ParsedItem {
  name: string;
  size: string | null;
  quantity: number;
}

export function splitItemType(itemTypeStr: string | null | undefined): string[] {
  if (!itemTypeStr) return []
  if (itemTypeStr.includes("; ")) {
    return itemTypeStr.split("; ")
  }
  return itemTypeStr.split(/(?<=x\d+),\s+/)
}

export function parseOrderItemType(itemTypeStr: string): ParsedItem[] {
  return splitItemType(itemTypeStr).map((part) => {
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
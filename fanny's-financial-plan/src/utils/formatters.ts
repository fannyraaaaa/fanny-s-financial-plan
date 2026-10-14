/**
 * Formatting utilities & Financial calculations for Fanny's Financial Plan
 */

export const PALETTE = {
  cream: '#F8E9E4',     // Tone 1
  softPink: '#F3AEC5',  // Tone 2
  rosePink: '#E07DA4',  // Tone 3
  berryRose: '#CB497C', // Tone 4
  deepRose: '#A93361',  // Tone 5
  richPlum: '#6D1B3E',  // Tone 6
  darkCherry: '#390F1E' // Tone 7
};

export const PALETTE_LIST = [
  { name: 'Berry Rose', hex: '#CB497C', text: '#FFFFFF' },
  { name: 'Rich Plum', hex: '#6D1B3E', text: '#FFFFFF' },
  { name: 'Deep Rose', hex: '#A93361', text: '#FFFFFF' },
  { name: 'Rose Pink', hex: '#E07DA4', text: '#390F1E' },
  { name: 'Soft Blush', hex: '#F3AEC5', text: '#390F1E' },
  { name: 'Cream Peach', hex: '#F8E9E4', text: '#390F1E' },
  { name: 'Dark Cherry', hex: '#390F1E', text: '#FFFFFF' },
];

export function formatIDR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactIDR(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Rp 0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    const val = (abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
    return `${sign}Rp ${val} B`;
  }
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${sign}Rp ${val} M`;
  }
  if (abs >= 1_000) {
    const val = (abs / 1_000).toFixed(0);
    return `${sign}Rp ${val} K`;
  }
  return `${sign}Rp ${abs.toLocaleString('en-US')}`;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


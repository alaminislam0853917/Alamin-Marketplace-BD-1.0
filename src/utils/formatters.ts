/**
 * Utility functions for Bengali numbering, currency and date formatting
 */

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/**
 * Converts English digits to Bengali numerals
 */
export function toBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '০';
  return val
    .toString()
    .replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

/**
 * Formats a number with commas and currency symbol: e.g. ৳১,২৫০
 */
export function formatPrice(price: number | string | undefined | null): string {
  const num = typeof price === 'number' ? price : parseFloat(String(price)) || 0;
  // Format with standard thousands separator
  const formattedEnglish = num.toLocaleString('en-IN'); // or standard Intl
  return `৳${toBengaliNumber(formattedEnglish)}`;
}

/**
 * Calculates discount percentage
 */
export function calculateDiscount(price: number, oldPrice?: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/**
 * Formats timestamp to readable Bengali date string
 */
export function formatBengaliDate(timestamp: number | undefined): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  
  const day = toBengaliNumber(date.getDate());
  const month = months[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'বিকাল' : 'সকাল';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  
  return `${day} ${month} ${year}, ${period} ${toBengaliNumber(hours)}:${toBengaliNumber(minutes)}`;
}

/**
 * Bangladeshi phone number validation
 * Must be 11 digits starting with 013-019
 */
export function isValidBDPhone(phone: string): boolean {
  const cleaned = phone.trim().replace(/^(\+88)?01/, '01');
  return /^01[3-9]\d{8}$/.test(cleaned);
}

/**
 * Order Status Mapping
 * pending=পেন্ডিং, confirmed=কনফার্মড, processing=প্রসেসিং, shipped=কুরিয়ারে আছে, delivered=ডেলিভারড, cancelled=বাতিল
 */
export const orderStatusMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: {
    label: 'পেন্ডিং',
    color: 'text-amber-800',
    bg: 'bg-amber-100',
    border: 'border-amber-300'
  },
  confirmed: {
    label: 'কনফার্মড',
    color: 'text-blue-800',
    bg: 'bg-blue-100',
    border: 'border-blue-300'
  },
  processing: {
    label: 'প্রসেসিং',
    color: 'text-indigo-800',
    bg: 'bg-indigo-100',
    border: 'border-indigo-300'
  },
  shipped: {
    label: 'কুরিয়ারে আছে',
    color: 'text-purple-800',
    bg: 'bg-purple-100',
    border: 'border-purple-300'
  },
  delivered: {
    label: 'ডেলিভারড',
    color: 'text-emerald-800',
    bg: 'bg-emerald-100',
    border: 'border-emerald-300'
  },
  cancelled: {
    label: 'বাতিল',
    color: 'text-rose-800',
    bg: 'bg-rose-100',
    border: 'border-rose-300'
  }
};


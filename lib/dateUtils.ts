/**
 * Lightweight date formatter to avoid pulling in date-fns.
 * Supports 'MMM dd, yyyy' and 'yyyy-MM-dd' patterns.
 */
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDate(date: Date | string, pattern: string = 'MMM dd, yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  switch (pattern) {
    case 'yyyy-MM-dd':
      return `${year}-${mm}-${dd}`;
    case 'MMM dd, yyyy':
    default:
      return `${MONTHS_SHORT[month]} ${dd}, ${year}`;
  }
}


/**
 * Formats a number as a price with the specified currency
 */
export const formatPrice = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a number as a compact price (e.g., $1.2M)
 */
export const formatCompactPrice = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  
  return formatter.format(amount);
};

/**
 * Formats a number with commas for thousands
 */
export const formatNumber = (
  number: number,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale).format(number);
};

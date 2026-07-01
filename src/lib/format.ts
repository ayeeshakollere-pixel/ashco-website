// Currency + number formatting for the Ashco order app.

const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export function formatNaira(value: number): string {
  return naira.format(Math.round(value));
}

const litreFmt = new Intl.NumberFormat('en-NG');

export function formatLitres(value: number): string {
  return `${litreFmt.format(value)} L`;
}

export function formatNumber(value: number): string {
  return litreFmt.format(value);
}

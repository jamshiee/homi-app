/** Format rupee amounts for display (Indian grouping). */
export function formatPrice(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)} Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2)} L`;
  if (amount >= 1e3) return `₹${(amount / 1e3).toFixed(2)}k`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

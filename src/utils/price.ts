/** Format rupee amounts for display (Indian grouping). */
export function formatPrice(amount: string): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '₹0';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(2)}k`;
  return `₹${n.toLocaleString('en-IN')}`;
}

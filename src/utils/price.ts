/** Format rupee amounts for display (Indian grouping). */
export function formatPrice(amount: string): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '₹0';
  return `₹${n.toLocaleString('en-IN')}`;
}

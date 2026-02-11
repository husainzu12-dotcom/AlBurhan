/**
 * Utility functions for GST calculations (18% for India)
 */

const GST_RATE = 0.18

/**
 * Calculate GST amount from subtotal
 * @param subtotal Amount before GST
 * @returns GST amount (18%)
 */
export function calculateGST(subtotal: number): number {
  return Math.round(subtotal * GST_RATE * 100) / 100
}

/**
 * Calculate total amount including GST
 * @param subtotal Amount before GST
 * @returns Total amount including GST
 */
export function calculateTotal(subtotal: number): number {
  return Math.round(subtotal * (1 + GST_RATE) * 100) / 100
}

/**
 * Calculate profit from selling and purchase prices
 * @param sellingPrice Price at which item is sold
 * @param purchasePrice Original cost price
 * @param quantity Number of items (optional, for total profit)
 * @returns Profit amount
 */
export function calculateProfit(
  sellingPrice: number,
  purchasePrice: number,
  quantity: number = 1
): number {
  return (sellingPrice - purchasePrice) * quantity
}

/**
 * Format currency for Indian Rupees
 * @param amount Amount to format
 * @returns Formatted string with ₹ symbol
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

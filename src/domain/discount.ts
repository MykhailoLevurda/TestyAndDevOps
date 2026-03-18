import { DiscountType } from './types';

export function isDiscountValid(
  discount: { type: DiscountType; value: number; minOrderAmount: number; validFrom: Date; validTo: Date },
  totalPrice: number,
  now: Date
): boolean {
  if (now < discount.validFrom || now > discount.validTo) {
    return false;
  }
  if (totalPrice < discount.minOrderAmount) {
    return false;
  }
  return true;
}

export function applyDiscount(
  subtotal: number,
  discount: { type: DiscountType; value: number }
): number {
  if (discount.type === DiscountType.PERCENT) {
    return subtotal * (1 - discount.value / 100);
  }
  // FIXED
  return Math.max(0, subtotal - discount.value);
}

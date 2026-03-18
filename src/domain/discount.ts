// Stub — implementace bude doplněna v GREEN fázi
import { DiscountType } from './types';

export function isDiscountValid(
  _discount: { type: DiscountType; value: number; minOrderAmount: number; validFrom: Date; validTo: Date },
  _totalPrice: number,
  _now: Date
): boolean {
  throw new Error('Not implemented');
}

export function applyDiscount(
  _subtotal: number,
  _discount: { type: DiscountType; value: number }
): number {
  throw new Error('Not implemented');
}

// Stub — implementace bude doplněna v GREEN fázi
import { OrderStatus, DiscountType, DiscountInput } from './types';

export function transitionOrderStatus(_from: OrderStatus, _to: OrderStatus): OrderStatus {
  throw new Error('Not implemented');
}

export function calculateTotalWithDiscount(
  _items: { quantity: number; unitPrice: number }[],
  _discount: (DiscountInput & { minOrderAmount: number; validFrom: Date; validTo: Date }) | null,
  _now: Date
): number {
  throw new Error('Not implemented');
}

export function validateStockForItems(
  _items: { productId: string; quantity: number }[],
  _products: { id: string; stockQty: number }[]
): void {
  throw new Error('Not implemented');
}

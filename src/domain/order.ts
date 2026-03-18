import { OrderStatus, DiscountType, DiscountInput } from './types';

// ─── Stavový automat objednávky ────────────────────────────────────────────
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [OrderStatus.PAID],
  [OrderStatus.PAID]: [OrderStatus.SHIPPED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
};

export function transitionOrderStatus(from: OrderStatus, to: OrderStatus): OrderStatus {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new Error(
      `Nepovolený přechod stavu: ${from} -> ${to}. Aktuální stav objednávky: ${from}`
    );
  }
  return to;
}

// ─── Stub — bude implementováno v dalším GREEN cyklu ──────────────────────
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

export function assertOrderPayable(_status: OrderStatus): void {
  throw new Error('Not implemented');
}

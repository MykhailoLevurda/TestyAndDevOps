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

// ─── Výpočet ceny se slevou ───────────────────────────────────────────────
export function calculateTotalWithDiscount(
  items: { quantity: number; unitPrice: number }[],
  discount: (DiscountInput & { minOrderAmount: number; validFrom: Date; validTo: Date }) | null,
  now: Date
): number {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  if (!discount) {
    return subtotal;
  }

  const isDateValid = now >= discount.validFrom && now <= discount.validTo;
  const meetsMinAmount = subtotal >= discount.minOrderAmount;

  if (!isDateValid || !meetsMinAmount) {
    return subtotal;
  }

  if (discount.type === DiscountType.PERCENT) {
    return subtotal * (1 - discount.value / 100);
  }

  // FIXED
  return Math.max(0, subtotal - discount.value);
}

// ─── Stub — bude implementováno v dalším GREEN cyklu ──────────────────────
export function validateStockForItems(
  _items: { productId: string; quantity: number }[],
  _products: { id: string; stockQty: number }[]
): void {
  throw new Error('Not implemented');
}

export function assertOrderPayable(_status: OrderStatus): void {
  throw new Error('Not implemented');
}

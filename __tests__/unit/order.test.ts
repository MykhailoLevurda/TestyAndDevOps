import {
  transitionOrderStatus,
  calculateTotalWithDiscount,
} from '@/domain/order';
import { OrderStatus, DiscountType } from '@/domain/types';

// ─── 1. Stavový automat objednávky ─────────────────────────────────────────
describe('Order state machine', () => {
  describe('Povolené přechody', () => {
    it('NEW -> PAID je povoleno', () => {
      expect(transitionOrderStatus(OrderStatus.NEW, OrderStatus.PAID)).toBe(OrderStatus.PAID);
    });

    it('PAID -> SHIPPED je povoleno', () => {
      expect(transitionOrderStatus(OrderStatus.PAID, OrderStatus.SHIPPED)).toBe(OrderStatus.SHIPPED);
    });

    it('SHIPPED -> DELIVERED je povoleno', () => {
      expect(transitionOrderStatus(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(OrderStatus.DELIVERED);
    });
  });

  describe('Zakázané přechody', () => {
    it('NEW -> SHIPPED vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.NEW, OrderStatus.SHIPPED)).toThrow();
    });

    it('NEW -> DELIVERED vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.NEW, OrderStatus.DELIVERED)).toThrow();
    });

    it('PAID -> NEW vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.PAID, OrderStatus.NEW)).toThrow();
    });

    it('PAID -> DELIVERED vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.PAID, OrderStatus.DELIVERED)).toThrow();
    });

    it('SHIPPED -> NEW vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.SHIPPED, OrderStatus.NEW)).toThrow();
    });

    it('SHIPPED -> PAID vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.SHIPPED, OrderStatus.PAID)).toThrow();
    });

    it('DELIVERED -> jakýkoliv stav vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.DELIVERED, OrderStatus.NEW)).toThrow();
      expect(() => transitionOrderStatus(OrderStatus.DELIVERED, OrderStatus.PAID)).toThrow();
      expect(() => transitionOrderStatus(OrderStatus.DELIVERED, OrderStatus.SHIPPED)).toThrow();
    });
  });
});

// ─── 2. Výpočet ceny se slevou ─────────────────────────────────────────────
describe('Výpočet ceny se slevou', () => {
  const items = [
    { quantity: 2, unitPrice: 100 },
    { quantity: 1, unitPrice: 50 },
  ];
  // subtotal = 250

  describe('PERCENT sleva', () => {
    const discount = {
      type: DiscountType.PERCENT,
      value: 10,
      minOrderAmount: 100,
      validFrom: new Date('2020-01-01'),
      validTo: new Date('2099-12-31'),
    };

    it('aplikuje procentuální slevu', () => {
      const result = calculateTotalWithDiscount(items, discount, new Date('2025-06-01'));
      expect(result).toBeCloseTo(225, 2); // 250 * 0.9
    });

    it('neaplikuje slevu pokud totalPrice < minOrderAmount', () => {
      const highMin = { ...discount, minOrderAmount: 1000 };
      const result = calculateTotalWithDiscount(items, highMin, new Date('2025-06-01'));
      expect(result).toBeCloseTo(250, 2);
    });

    it('neaplikuje slevu pokud datum je před validFrom', () => {
      const result = calculateTotalWithDiscount(items, discount, new Date('2019-01-01'));
      expect(result).toBeCloseTo(250, 2);
    });

    it('neaplikuje slevu pokud datum je po validTo', () => {
      const result = calculateTotalWithDiscount(items, discount, new Date('2100-01-01'));
      expect(result).toBeCloseTo(250, 2);
    });
  });

  describe('FIXED sleva', () => {
    const discount = {
      type: DiscountType.FIXED,
      value: 30,
      minOrderAmount: 100,
      validFrom: new Date('2020-01-01'),
      validTo: new Date('2099-12-31'),
    };

    it('aplikuje fixní slevu', () => {
      const result = calculateTotalWithDiscount(items, discount, new Date('2025-06-01'));
      expect(result).toBeCloseTo(220, 2); // 250 - 30
    });

    it('neaplikuje slevu pokud totalPrice < minOrderAmount', () => {
      const highMin = { ...discount, minOrderAmount: 500 };
      const result = calculateTotalWithDiscount(items, highMin, new Date('2025-06-01'));
      expect(result).toBeCloseTo(250, 2);
    });
  });

  it('počítá bez slevy pokud discount je null', () => {
    const result = calculateTotalWithDiscount(items, null, new Date('2025-06-01'));
    expect(result).toBeCloseTo(250, 2);
  });
});

// ─── 3. Kontrola skladu ────────────────────────────────────────────────────
import { validateStockForItems } from '@/domain/order';

describe('Kontrola skladu', () => {
  it('vyhodí chybu pokud product.stockQty < quantity', () => {
    const products = [{ id: 'p1', stockQty: 5 }];
    const items = [{ productId: 'p1', quantity: 10 }];
    expect(() => validateStockForItems(items, products)).toThrow();
  });

  it('projde pokud product.stockQty >= quantity', () => {
    const products = [{ id: 'p1', stockQty: 10 }];
    const items = [{ productId: 'p1', quantity: 10 }];
    expect(() => validateStockForItems(items, products)).not.toThrow();
  });

  it('vyhodí chybu pokud stockQty = 0', () => {
    const products = [{ id: 'p1', stockQty: 0 }];
    const items = [{ productId: 'p1', quantity: 1 }];
    expect(() => validateStockForItems(items, products)).toThrow();
  });
});

import { isDiscountValid, applyDiscount } from '@/domain/discount';
import { DiscountType } from '@/domain/types';

describe('Validace slevového kódu', () => {
  const baseDiscount = {
    type: DiscountType.PERCENT,
    value: 10,
    minOrderAmount: 100,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2025-12-31'),
  };

  it('vrátí true pro platný kód', () => {
    expect(isDiscountValid(baseDiscount, 200, new Date('2025-06-01'))).toBe(true);
  });

  it('vrátí false pro expirovaný kód', () => {
    expect(isDiscountValid(baseDiscount, 200, new Date('2026-01-01'))).toBe(false);
  });

  it('vrátí false pokud datum je před validFrom', () => {
    expect(isDiscountValid(baseDiscount, 200, new Date('2023-12-31'))).toBe(false);
  });

  it('vrátí false pokud totalPrice < minOrderAmount', () => {
    expect(isDiscountValid(baseDiscount, 50, new Date('2025-06-01'))).toBe(false);
  });

  it('vrátí true přesně na hranici minOrderAmount', () => {
    expect(isDiscountValid(baseDiscount, 100, new Date('2025-06-01'))).toBe(true);
  });
});

describe('Aplikace PERCENT slevy', () => {
  it('odpočítá procenta ze subtotálu', () => {
    const discount = { type: DiscountType.PERCENT, value: 20 };
    expect(applyDiscount(500, discount)).toBeCloseTo(400, 2);
  });

  it('100% sleva vede na 0', () => {
    const discount = { type: DiscountType.PERCENT, value: 100 };
    expect(applyDiscount(500, discount)).toBeCloseTo(0, 2);
  });
});

describe('Aplikace FIXED slevy', () => {
  it('odpočítá fixní částku', () => {
    const discount = { type: DiscountType.FIXED, value: 50 };
    expect(applyDiscount(300, discount)).toBeCloseTo(250, 2);
  });

  it('pokud je sleva větší než cena, výsledek je 0', () => {
    const discount = { type: DiscountType.FIXED, value: 1000 };
    expect(applyDiscount(100, discount)).toBeCloseTo(0, 2);
  });
});

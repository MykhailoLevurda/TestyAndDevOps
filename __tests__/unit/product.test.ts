import { validateProductForOrder } from '@/domain/product';

describe('Validace produktu při přidání do objednávky', () => {
  it('vyhodí chybu pokud produkt neexistuje', () => {
    expect(() => validateProductForOrder(null, 1)).toThrow(/nenalezen|not found/i);
  });

  it('vyhodí chybu pokud stockQty = 0', () => {
    const product = { id: 'p1', stockQty: 0, name: 'Test' };
    expect(() => validateProductForOrder(product, 1)).toThrow(/sklad|stock/i);
  });

  it('vyhodí chybu pokud stockQty < quantity', () => {
    const product = { id: 'p1', stockQty: 3, name: 'Test' };
    expect(() => validateProductForOrder(product, 5)).toThrow(/sklad|stock/i);
  });

  it('projde pro produkt s dostatečným skladem', () => {
    const product = { id: 'p1', stockQty: 10, name: 'Test' };
    expect(() => validateProductForOrder(product, 5)).not.toThrow();
  });

  it('projde pokud quantity = stockQty (přesná hranice)', () => {
    const product = { id: 'p1', stockQty: 5, name: 'Test' };
    expect(() => validateProductForOrder(product, 5)).not.toThrow();
  });
});

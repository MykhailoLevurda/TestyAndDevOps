export function validateProductForOrder(
  product: { id: string; stockQty: number; name?: string } | null,
  quantity: number
): void {
  if (!product) {
    throw new Error('Produkt nenalezen (not found)');
  }
  if (product.stockQty < quantity) {
    throw new Error(
      `Nedostatečný sklad (stock): dostupné ${product.stockQty}, požadováno ${quantity}`
    );
  }
}

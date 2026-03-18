import * as orderRepo from '@/repositories/orderRepository';
import * as productRepo from '@/repositories/productRepository';
import * as discountRepo from '@/repositories/discountRepository';
import { transitionOrderStatus, calculateTotalWithDiscount, validateStockForItems, assertOrderPayable } from '@/domain/order';
import { OrderStatus } from '@/domain/types';

export async function listOrders() {
  return orderRepo.findAllOrders();
}

export async function getOrder(id: string) {
  const order = await orderRepo.findOrderById(id);
  if (!order) throw Object.assign(new Error('Objednávka nenalezena'), { status: 404 });
  return order;
}

export async function createOrder(data: {
  userId: string;
  items: { productId: string; quantity: number }[];
  discountCode?: string;
}) {
  // Validate products and stock
  const products = await Promise.all(
    data.items.map(async (item) => {
      const product = await productRepo.findProductById(item.productId);
      if (!product) throw Object.assign(new Error(`Produkt ${item.productId} nenalezen`), { status: 404 });
      return product;
    })
  );

  validateStockForItems(data.items, products.map((p) => ({ id: p.id, stockQty: p.stockQty })));

  // Load discount if provided
  let discount = null;
  if (data.discountCode) {
    discount = await discountRepo.findDiscountByCode(data.discountCode);
  }

  // Calculate price
  const itemsWithPrice = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return { productId: item.productId, quantity: item.quantity, unitPrice: Number(product.price) };
  });

  const totalPrice = calculateTotalWithDiscount(
    itemsWithPrice.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice })),
    discount
      ? {
          type: discount.type as any,
          value: Number(discount.value),
          minOrderAmount: Number(discount.minOrderAmount),
          validFrom: discount.validFrom,
          validTo: discount.validTo,
        }
      : null,
    new Date()
  );

  return orderRepo.createOrder({
    userId: data.userId,
    totalPrice,
    discountCode: data.discountCode,
    items: itemsWithPrice,
  });
}

export async function payOrder(id: string) {
  const order = await getOrder(id);
  assertOrderPayable(order.status as OrderStatus);
  const newStatus = transitionOrderStatus(order.status as OrderStatus, OrderStatus.PAID);
  await orderRepo.decrementStock(order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
  return orderRepo.updateOrderStatus(id, newStatus);
}

export async function shipOrder(id: string) {
  const order = await getOrder(id);
  const newStatus = transitionOrderStatus(order.status as OrderStatus, OrderStatus.SHIPPED);
  return orderRepo.updateOrderStatus(id, newStatus);
}

export async function deliverOrder(id: string) {
  const order = await getOrder(id);
  const newStatus = transitionOrderStatus(order.status as OrderStatus, OrderStatus.DELIVERED);
  return orderRepo.updateOrderStatus(id, newStatus);
}

import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@/domain/types';

export async function findAllOrders() {
  return prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
}

export async function findOrderById(id: string) {
  return prisma.order.findUnique({ where: { id }, include: { items: true, discount: true } });
}

export async function createOrder(data: {
  userId: string;
  totalPrice: number;
  discountCode?: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}) {
  return prisma.order.create({
    data: {
      userId: data.userId,
      totalPrice: data.totalPrice,
      discountCode: data.discountCode,
      items: { create: data.items },
    },
    include: { items: true },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return prisma.order.update({ where: { id }, data: { status } });
}

export async function decrementStock(items: { productId: string; quantity: number }[]) {
  await Promise.all(
    items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.quantity } },
      })
    )
  );
}

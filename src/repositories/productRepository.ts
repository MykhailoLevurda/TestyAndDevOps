import { prisma } from '@/lib/prisma';

export async function findAllProducts(category?: string) {
  return prisma.product.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function findProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  stockQty: number;
  category: string;
}) {
  return prisma.product.create({ data });
}

export async function updateProductStock(id: string, stockQty: number) {
  return prisma.product.update({ where: { id }, data: { stockQty } });
}

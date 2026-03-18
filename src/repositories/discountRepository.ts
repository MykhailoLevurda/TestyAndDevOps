import { prisma } from '@/lib/prisma';

export async function findDiscountByCode(code: string) {
  return prisma.discount.findUnique({ where: { code } });
}

export async function createDiscount(data: {
  code: string;
  type: string;
  value: number;
  minOrderAmount: number;
  validFrom: Date;
  validTo: Date;
}) {
  return prisma.discount.create({ data: data as any });
}

import * as repo from '@/repositories/discountRepository';

export async function getDiscount(code: string) {
  const discount = await repo.findDiscountByCode(code);
  if (!discount) throw Object.assign(new Error('Slevový kód nenalezen'), { status: 404 });
  return discount;
}

export async function createDiscount(data: {
  code: string;
  type: string;
  value: number;
  minOrderAmount: number;
  validFrom: string;
  validTo: string;
}) {
  return repo.createDiscount({
    ...data,
    validFrom: new Date(data.validFrom),
    validTo: new Date(data.validTo),
  });
}

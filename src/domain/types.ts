export enum OrderStatus {
  NEW = 'NEW',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface ProductStock {
  id: string;
  stockQty: number;
  name?: string;
}

export interface DiscountInput {
  type: DiscountType;
  value: number;
  minOrderAmount?: number;
  validFrom?: Date;
  validTo?: Date;
}

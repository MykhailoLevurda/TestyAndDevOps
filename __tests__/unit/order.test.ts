import {
  transitionOrderStatus,
} from '@/domain/order';
import { OrderStatus } from '@/domain/types';

// ─── 1. Stavový automat objednávky ─────────────────────────────────────────
describe('Order state machine', () => {
  describe('Povolené přechody', () => {
    it('NEW → PAID je povoleno', () => {
      expect(transitionOrderStatus(OrderStatus.NEW, OrderStatus.PAID)).toBe(OrderStatus.PAID);
    });

    it('PAID → SHIPPED je povoleno', () => {
      expect(transitionOrderStatus(OrderStatus.PAID, OrderStatus.SHIPPED)).toBe(OrderStatus.SHIPPED);
    });

    it('SHIPPED → DELIVERED je povoleno', () => {
      expect(transitionOrderStatus(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(OrderStatus.DELIVERED);
    });
  });

  describe('Zakázané přechody', () => {
    it('NEW → SHIPPED vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.NEW, OrderStatus.SHIPPED)).toThrow();
    });

    it('NEW → DELIVERED vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.NEW, OrderStatus.DELIVERED)).toThrow();
    });

    it('PAID → NEW vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.PAID, OrderStatus.NEW)).toThrow();
    });

    it('PAID → DELIVERED vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.PAID, OrderStatus.DELIVERED)).toThrow();
    });

    it('SHIPPED → NEW vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.SHIPPED, OrderStatus.NEW)).toThrow();
    });

    it('SHIPPED → PAID vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.SHIPPED, OrderStatus.PAID)).toThrow();
    });

    it('DELIVERED → jakýkoliv stav vyhodí chybu', () => {
      expect(() => transitionOrderStatus(OrderStatus.DELIVERED, OrderStatus.NEW)).toThrow();
      expect(() => transitionOrderStatus(OrderStatus.DELIVERED, OrderStatus.PAID)).toThrow();
      expect(() => transitionOrderStatus(OrderStatus.DELIVERED, OrderStatus.SHIPPED)).toThrow();
    });
  });
});

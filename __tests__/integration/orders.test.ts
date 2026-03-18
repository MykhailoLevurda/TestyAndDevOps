import supertest from 'supertest';
import { createTestApp, registerRoutes } from './testServer';
import { prisma } from '@/lib/prisma';
import type { Server } from 'http';

let server: Server;
let request: ReturnType<typeof supertest>;

beforeAll(async () => {
  await registerRoutes();
  server = createTestApp();
  request = supertest(server);
  await prisma.$connect();
});

afterAll(async () => {
  server.close();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.discount.deleteMany();
});

async function seedProduct(stockQty = 10) {
  return prisma.product.create({
    data: { name: 'Product', description: 'Desc', price: 100, stockQty, category: 'Test' },
  });
}

describe('GET /api/orders', () => {
  it('vrátí prázdné pole pokud nejsou objednávky', async () => {
    const res = await request.get('/api/orders');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/orders', () => {
  it('vytvoří novou objednávku', async () => {
    const product = await seedProduct();
    const res = await request.post('/api/orders').send({
      userId: 'user-1',
      items: [{ productId: product.id, quantity: 2 }],
    });
    expect(res.status).toBe(201);
    expect(res.body.userId).toBe('user-1');
    expect(res.body.items).toHaveLength(1);
  });

  it('vrátí 404 pro neexistující produkt', async () => {
    const res = await request.post('/api/orders').send({
      userId: 'user-1',
      items: [{ productId: 'nonexistent', quantity: 1 }],
    });
    expect(res.status).toBe(404);
  });

  it('vrátí chybu pokud je nedostatečný sklad', async () => {
    const product = await seedProduct(2);
    const res = await request.post('/api/orders').send({
      userId: 'user-1',
      items: [{ productId: product.id, quantity: 10 }],
    });
    expect(res.status).toBe(400);
  });

  it('aplikuje slevový kód', async () => {
    const product = await seedProduct();
    await prisma.discount.create({
      data: {
        code: 'SAVE10',
        type: 'PERCENT',
        value: 10,
        minOrderAmount: 50,
        validFrom: new Date('2020-01-01'),
        validTo: new Date('2099-12-31'),
      },
    });
    const res = await request.post('/api/orders').send({
      userId: 'user-1',
      discountCode: 'SAVE10',
      items: [{ productId: product.id, quantity: 2 }],
    });
    expect(res.status).toBe(201);
    expect(Number(res.body.totalPrice)).toBeCloseTo(180, 1); // 200 * 0.9
  });
});

describe('GET /api/orders/[id]', () => {
  it('vrátí detail objednávky s položkami', async () => {
    const product = await seedProduct();
    const order = await prisma.order.create({
      data: {
        userId: 'user-1',
        totalPrice: 100,
        items: { create: [{ productId: product.id, quantity: 1, unitPrice: 100 }] },
      },
    });
    const res = await request.get(`/api/orders/${order.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(order.id);
    expect(res.body.items).toHaveLength(1);
  });

  it('vrátí 404 pro neexistující objednávku', async () => {
    const res = await request.get('/api/orders/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/orders/[id]/pay', () => {
  it('přechod NEW -> PAID', async () => {
    const product = await seedProduct();
    const order = await prisma.order.create({
      data: {
        userId: 'user-1',
        totalPrice: 100,
        items: { create: [{ productId: product.id, quantity: 2, unitPrice: 100 }] },
      },
    });
    const res = await request.post(`/api/orders/${order.id}/pay`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PAID');
  });

  it('odečte sklad po zaplacení', async () => {
    const product = await seedProduct(10);
    const order = await prisma.order.create({
      data: {
        userId: 'user-1',
        totalPrice: 100,
        items: { create: [{ productId: product.id, quantity: 3, unitPrice: 100 }] },
      },
    });
    await request.post(`/api/orders/${order.id}/pay`);
    const updated = await prisma.product.findUnique({ where: { id: product.id } });
    expect(updated!.stockQty).toBe(7); // 10 - 3
  });

  it('idempotence: vrátí chybu při opakovaném zaplacení', async () => {
    const product = await seedProduct();
    const order = await prisma.order.create({
      data: {
        userId: 'user-1',
        totalPrice: 100,
        status: 'PAID',
        items: { create: [{ productId: product.id, quantity: 1, unitPrice: 100 }] },
      },
    });
    const res = await request.post(`/api/orders/${order.id}/pay`);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/orders/[id]/ship', () => {
  it('přechod PAID -> SHIPPED', async () => {
    const product = await seedProduct();
    const order = await prisma.order.create({
      data: {
        userId: 'user-1',
        totalPrice: 100,
        status: 'PAID',
        items: { create: [{ productId: product.id, quantity: 1, unitPrice: 100 }] },
      },
    });
    const res = await request.post(`/api/orders/${order.id}/ship`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SHIPPED');
  });
});

describe('POST /api/orders/[id]/deliver', () => {
  it('přechod SHIPPED -> DELIVERED', async () => {
    const product = await seedProduct();
    const order = await prisma.order.create({
      data: {
        userId: 'user-1',
        totalPrice: 100,
        status: 'SHIPPED',
        items: { create: [{ productId: product.id, quantity: 1, unitPrice: 100 }] },
      },
    });
    const res = await request.post(`/api/orders/${order.id}/deliver`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('DELIVERED');
  });
});

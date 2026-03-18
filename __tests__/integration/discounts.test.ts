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
  await prisma.discount.deleteMany();
});

describe('POST /api/discounts', () => {
  it('vytvoří slevový kód', async () => {
    const res = await request.post('/api/discounts').send({
      code: 'SLEVA10',
      type: 'PERCENT',
      value: 10,
      minOrderAmount: 100,
      validFrom: '2024-01-01',
      validTo: '2099-12-31',
    });
    expect(res.status).toBe(201);
    expect(res.body.code).toBe('SLEVA10');
  });

  it('vrátí 400 pro duplicitní kód', async () => {
    await prisma.discount.create({
      data: {
        code: 'DUP',
        type: 'FIXED',
        value: 50,
        minOrderAmount: 0,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2099-12-31'),
      },
    });
    const res = await request.post('/api/discounts').send({
      code: 'DUP',
      type: 'FIXED',
      value: 50,
      minOrderAmount: 0,
      validFrom: '2024-01-01',
      validTo: '2099-12-31',
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/discounts/[code]', () => {
  it('vrátí platný slevový kód', async () => {
    await prisma.discount.create({
      data: {
        code: 'VALID20',
        type: 'PERCENT',
        value: 20,
        minOrderAmount: 50,
        validFrom: new Date('2020-01-01'),
        validTo: new Date('2099-12-31'),
      },
    });
    const res = await request.get('/api/discounts/VALID20');
    expect(res.status).toBe(200);
    expect(res.body.code).toBe('VALID20');
  });

  it('vrátí 404 pro neexistující kód', async () => {
    const res = await request.get('/api/discounts/NEEXISTUJE');
    expect(res.status).toBe(404);
  });
});

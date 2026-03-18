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

describe('GET /api/products', () => {
  it('vrátí prázdné pole pokud nejsou produkty', async () => {
    const res = await request.get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('vrátí seznam produktů', async () => {
    await prisma.product.create({
      data: { name: 'Produkt A', description: 'Popis', price: 100, stockQty: 10, category: 'Elektronika' },
    });
    const res = await request.get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('filtruje produkty podle kategorie', async () => {
    await prisma.product.create({
      data: { name: 'A', description: 'D', price: 10, stockQty: 1, category: 'Elektronika' },
    });
    await prisma.product.create({
      data: { name: 'B', description: 'D', price: 20, stockQty: 1, category: 'Oblečení' },
    });
    const res = await request.get('/api/products?category=Elektronika');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].category).toBe('Elektronika');
  });
});

describe('POST /api/products', () => {
  it('vytvoří nový produkt', async () => {
    const res = await request.post('/api/products').send({
      name: 'Nový produkt',
      description: 'Popis',
      price: 299,
      stockQty: 50,
      category: 'Elektronika',
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Nový produkt');
  });

  it('vrátí 400 pro neúplná data', async () => {
    const res = await request.post('/api/products').send({ name: 'Chybí cena' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/products/[id]', () => {
  it('vrátí detail produktu', async () => {
    const product = await prisma.product.create({
      data: { name: 'Detail', description: 'D', price: 50, stockQty: 5, category: 'Test' },
    });
    const res = await request.get(`/api/products/${product.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(product.id);
  });

  it('vrátí 404 pro neexistující produkt', async () => {
    const res = await request.get('/api/products/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/products/[id]', () => {
  it('aktualizuje sklad produktu', async () => {
    const product = await prisma.product.create({
      data: { name: 'Aktualizace', description: 'D', price: 50, stockQty: 5, category: 'Test' },
    });
    const res = await request.patch(`/api/products/${product.id}`).send({ stockQty: 20 });
    expect(res.status).toBe(200);
    expect(res.body.stockQty).toBe(20);
  });
});

import * as repo from '@/repositories/productRepository';

export async function listProducts(category?: string) {
  return repo.findAllProducts(category);
}

export async function getProduct(id: string) {
  const product = await repo.findProductById(id);
  if (!product) throw Object.assign(new Error('Produkt nenalezen'), { status: 404 });
  return product;
}

export async function addProduct(data: {
  name: string;
  description: string;
  price: number;
  stockQty: number;
  category: string;
}) {
  return repo.createProduct(data);
}

export async function updateStock(id: string, stockQty: number) {
  return repo.updateProductStock(id, stockQty);
}

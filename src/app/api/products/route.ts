import { NextRequest, NextResponse } from 'next/server';
import { listProducts, addProduct } from '@/services/productService';

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') ?? undefined;
  const products = await listProducts(category);
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price, stockQty, category } = body;
    if (!name || !description || price == null || stockQty == null || !category) {
      return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 });
    }
    const product = await addProduct({ name, description, price: Number(price), stockQty: Number(stockQty), category });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Chyba při vytváření produktu' }, { status: 500 });
  }
}

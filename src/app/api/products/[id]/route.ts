import { NextRequest, NextResponse } from 'next/server';
import { getProduct, updateStock } from '@/services/productService';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await getProduct(params.id);
    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const product = await updateStock(params.id, Number(body.stockQty));
    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { listOrders, createOrder } from '@/services/orderService';

export async function GET() {
  const orders = await listOrders();
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = await createOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 400 });
  }
}

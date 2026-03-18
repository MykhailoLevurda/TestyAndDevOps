import { NextRequest, NextResponse } from 'next/server';
import { deliverOrder } from '@/services/orderService';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await deliverOrder(params.id);
    return NextResponse.json(order);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 400 });
  }
}

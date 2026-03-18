import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/services/orderService';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await getOrder(params.id);
    return NextResponse.json(order);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}

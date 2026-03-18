import { NextRequest, NextResponse } from 'next/server';
import { createDiscount } from '@/services/discountService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const discount = await createDiscount(body);
    return NextResponse.json(discount, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 400 });
  }
}

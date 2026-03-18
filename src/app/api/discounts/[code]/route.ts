import { NextRequest, NextResponse } from 'next/server';
import { getDiscount } from '@/services/discountService';

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const discount = await getDiscount(params.code);
    return NextResponse.json(discount);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}

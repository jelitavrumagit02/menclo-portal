import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const isActive = searchParams.get('isActive');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    const products = await prisma.product.findMany({
      where: {
        ...(isActive === 'true' ? { isActive: true } : {}),
        ...(category ? { category: { name: category } } : {}),
        ...(search ? {
          OR: [
            { articleCode: { contains: search } },
            { name: { contains: search } },
          ]
        } : {}),
      },
      include: { category: true },
      orderBy: { articleCode: 'asc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(['admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { articleCode, name, categoryId, sellingPrice, costPrice, minStock, description } = body;

    if (!articleCode || !name || !categoryId || !sellingPrice) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { articleCode } });
    if (existing) return NextResponse.json({ error: 'Kode artikel sudah digunakan.' }, { status: 400 });

    const product = await prisma.product.create({
      data: { articleCode, name, categoryId, sellingPrice: Number(sellingPrice), costPrice: costPrice ? Number(costPrice) : null, minStock: minStock ? Number(minStock) : 5, description },
      include: { category: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

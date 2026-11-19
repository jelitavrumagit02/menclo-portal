import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const storeId = searchParams.get('storeId');

  try {
    const inventory = await prisma.inventory.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        ...(search ? {
          product: {
            OR: [
              { name: { contains: search } },
              { articleCode: { contains: search } },
            ],
          },
        } : {}),
      },
      include: {
        product: {
          include: { category: true },
        },
        store: { select: { name: true, code: true } },
      },
      orderBy: [{ store: { name: 'asc' } }, { product: { articleCode: 'asc' } }],
    });

    return NextResponse.json({ inventory });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

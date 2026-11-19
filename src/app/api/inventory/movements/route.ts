import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || '50');
  const storeId = searchParams.get('storeId');

  try {
    const movements = await prisma.inventoryMovement.findMany({
      where: storeId ? { storeId } : {},
      include: {
        product: { select: { name: true, articleCode: true } },
        store: { select: { name: true } },
        employee: { select: { fullName: true } },
      },
      orderBy: { movementDate: 'desc' },
      take: limit,
    });

    return NextResponse.json({ movements });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { productId, storeId, movementType, quantity, description } = body;

    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: 'Karyawan tidak ditemukan.' }, { status: 404 });

    const movement = await prisma.inventoryMovement.create({
      data: {
        productId,
        storeId,
        employeeId: employee.id,
        movementType,
        quantity: Number(quantity),
        description,
        status: 'pending',
      },
    });

    return NextResponse.json({ movement }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

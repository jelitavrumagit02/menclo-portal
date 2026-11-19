import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const where: any = {};
    if (session.role === 'employee') {
      const emp = await prisma.employee.findUnique({ where: { userId: session.userId } });
      if (emp) where.employeeId = emp.id;
    }

    const reports = await prisma.defectiveProduct.findMany({
      where,
      include: {
        product: { select: { name: true, articleCode: true } },
        store: { select: { name: true } },
        employee: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { productId, storeId, quantity, description } = body;

    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: 'Karyawan tidak ditemukan.' }, { status: 404 });

    const report = await prisma.defectiveProduct.create({
      data: {
        productId,
        storeId,
        employeeId: employee.id,
        quantity: Number(quantity),
        description,
        status: 'pending',
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

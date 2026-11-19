import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { fullName, phone, positionId, storeId, hireDate, basicSalary, status } = body;

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        ...(fullName ? { fullName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(positionId ? { positionId } : {}),
        ...(storeId ? { storeId } : {}),
        ...(hireDate ? { hireDate: new Date(hireDate) } : {}),
        ...(basicSalary !== undefined ? { basicSalary: Number(basicSalary) } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        user: { select: { email: true } },
        store: { select: { name: true, code: true } },
        position: { select: { name: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName,
        action: 'UPDATE',
        module: 'employee',
        recordId: params.id,
        newValue: JSON.stringify(body),
      },
    });

    return NextResponse.json({ employee });
  } catch (error) {
    console.error('Employee update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { email: true, role: true, lastLoginAt: true } },
        store: true,
        position: true,
        leaveRequests: { orderBy: { createdAt: 'desc' }, take: 5 },
        warnings: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!employee) return NextResponse.json({ error: 'Karyawan tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ employee });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

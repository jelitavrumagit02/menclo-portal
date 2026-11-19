import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { status, notes } = body;

    const payroll = await prisma.payroll.update({
      where: { id: params.id },
      data: {
        status,
        notes: notes || undefined,
        paidAt: status === 'paid' ? new Date() : undefined,
        paidBy: status === 'paid' ? session.userId : undefined,
      },
    });

    // Notify employee if paid
    if (status === 'paid') {
      const fullPayroll = await prisma.payroll.findUnique({
        where: { id: params.id },
        include: { employee: { select: { userId: true } }, payrollPeriod: true },
      });
      if (fullPayroll?.employee?.userId) {
        await prisma.notification.create({
          data: {
            userId: fullPayroll.employee.userId,
            title: 'Gaji Telah Dibayarkan',
            message: `Gaji Anda untuk periode ${fullPayroll.payrollPeriod?.periodName} telah dibayarkan. Lihat slip gaji Anda.`,
            type: 'payroll',
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName,
        action: 'UPDATE',
        module: 'payroll',
        recordId: params.id,
        newValue: status,
      },
    });

    return NextResponse.json({ payroll });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { status, reviewComment } = body;

    const leave = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: {
        status,
        reviewComment: reviewComment || null,
        reviewedBy: session.userId,
        reviewedAt: new Date(),
      },
      include: {
        employee: { select: { userId: true, fullName: true } },
      },
    });

    // Notify the employee
    if (leave.employee?.userId) {
      await prisma.notification.create({
        data: {
          userId: leave.employee.userId,
          title: status === 'approved' ? 'Cuti Disetujui' : 'Cuti Ditolak',
          message: status === 'approved'
            ? 'Pengajuan cuti Anda telah disetujui oleh HRD.'
            : `Pengajuan cuti Anda ditolak. ${reviewComment ? 'Alasan: ' + reviewComment : ''}`,
          type: 'leave',
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName,
        action: 'UPDATE',
        module: 'leave_request',
        recordId: params.id,
        previousValue: 'pending',
        newValue: status,
      },
    });

    return NextResponse.json({ leave });
  } catch (error) {
    console.error('Leave review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

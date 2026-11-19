import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET() {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const warnings = await prisma.employeeWarning.findMany({
    include: {
      employee: { select: { fullName: true, store: { select: { name: true } } } },
    },
    orderBy: { warningDate: 'desc' },
  });
  return NextResponse.json({ warnings });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { employeeId, warningLevel, category, description, warningDate } = body;

  const warning = await prisma.employeeWarning.create({
    data: { employeeId, warningLevel, category, description, warningDate: new Date(warningDate), issuedBy: session.userId, status: 'active' },
  });
  return NextResponse.json({ warning }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const storeId = searchParams.get('storeId');
  const status = searchParams.get('status');

  try {
    const employees = await prisma.employee.findMany({
      where: {
        ...(search ? {
          OR: [
            { fullName: { contains: search } },
            { employeeCode: { contains: search } },
          ],
        } : {}),
        ...(storeId ? { storeId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        user: { select: { email: true, role: true, isActive: true } },
        store: { select: { name: true, code: true } },
        position: { select: { name: true } },
      },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json({ employees });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { fullName, email, phone, positionId, storeId, hireDate, basicSalary, status } = body;

    if (!fullName || !email || !positionId || !storeId || !hireDate) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return NextResponse.json({ error: 'Email sudah digunakan.' }, { status: 400 });

    // Generate employee ID
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { code: true } });
    const count = await prisma.employee.count({ where: { storeId } });
    const employeeCode = `${store?.code}-${String(count + 1).padStart(3, '0')}`;

    // Create user and employee in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          employeeId: employeeCode,
          email: email.toLowerCase(),
          password: bcrypt.hashSync('temp1234', 10), // Temporary password
          role: 'employee',
          isActive: true,
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeCode,
          fullName,
          phone,
          positionId,
          storeId,
          hireDate: new Date(hireDate),
          basicSalary: basicSalary ? Number(basicSalary) : 0,
          status: status || 'active',
        },
        include: {
          user: { select: { email: true } },
          store: { select: { name: true, code: true } },
          position: { select: { name: true } },
        },
      });

      return employee;
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName,
        action: 'CREATE',
        module: 'employee',
        recordId: result.id,
        newValue: JSON.stringify({ fullName, employeeCode }),
      },
    });

    return NextResponse.json({ employee: result, tempPassword: 'temp1234' }, { status: 201 });
  } catch (error) {
    console.error('Employee create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

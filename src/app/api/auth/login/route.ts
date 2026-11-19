import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email/ID dan kata sandi wajib diisi.' }, { status: 400 });
    }

    // Find user by email or employeeId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { employeeId: email.trim() },
        ],
        isActive: true,
      },
      include: {
        employee: {
          include: {
            store: true,
            position: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Akun tidak ditemukan atau tidak aktif.' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Kata sandi salah.' }, { status: 401 });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set session
    const session = await getSession();
    session.userId = user.id;
    session.employeeId = user.employeeId;
    session.email = user.email;
    session.role = user.role as any;
    session.fullName = user.employee?.fullName || user.email;
    session.storeId = user.employee?.storeId || undefined;
    session.storeCode = user.employee?.store?.code || undefined;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      role: user.role,
      fullName: session.fullName,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ isLoggedIn: false }, { status: 401 });
  }
  return NextResponse.json({
    isLoggedIn: true,
    userId: session.userId,
    employeeId: session.employeeId,
    email: session.email,
    role: session.role,
    fullName: session.fullName,
    storeId: session.storeId,
    storeCode: session.storeCode,
  });
}

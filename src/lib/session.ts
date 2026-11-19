import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId: string;
  employeeId: string;
  email: string;
  role: 'employee' | 'owner' | 'hrd' | 'admin';
  fullName: string;
  storeId?: string;
  storeCode?: string;
  isLoggedIn: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'menclo-portal-secret-key-change-in-production-2025',
  cookieName: 'menclo_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session;
}

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return null;
  }
  return session;
}

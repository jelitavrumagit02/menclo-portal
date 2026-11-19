import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { publishDate: 'desc' },
    });
    return NextResponse.json({ announcements });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { title, content, targetType, expiryDate } = body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        targetType: targetType || 'all',
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        createdBy: session.userId,
        isActive: true,
      },
    });

    // Create notifications for all active users
    const users = await prisma.user.findMany({ where: { isActive: true } });
    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map(u => ({
          userId: u.id,
          title: `Pengumuman: ${title}`,
          message: content.length > 100 ? content.substring(0, 100) + '...' : content,
          type: 'announcement',
        })),
      });
    }

    return NextResponse.json({ announcement }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

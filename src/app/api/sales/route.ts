import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { locationType, storeId, bazaarId, bazaarName, items, notes, totalAmount, totalItems } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Minimal 1 item diperlukan.' }, { status: 400 });
    }

    // Get employee record for the logged-in user
    const employee = await prisma.employee.findUnique({
      where: { userId: session.userId },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Data karyawan tidak ditemukan.' }, { status: 400 });
    }

    // Validate stock availability
    for (const item of items) {
      if (storeId) {
        const inventory = await prisma.inventory.findUnique({
          where: { productId_storeId: { productId: item.productId, storeId } },
        });
        if (!inventory || inventory.quantity < item.quantity) {
          const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { name: true } });
          return NextResponse.json({
            error: `Stok tidak mencukupi untuk produk: ${product?.name || item.productId}. Stok tersedia: ${inventory?.quantity || 0}`,
          }, { status: 400 });
        }
      }
    }

    // Create sale in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create the sale
      const sale = await tx.sale.create({
        data: {
          saleDate: new Date(),
          employeeId: employee.id,
          storeId: locationType === 'store' ? storeId : null,
          bazaarId: locationType === 'bazaar' && bazaarId ? bazaarId : null,
          locationType,
          totalAmount: Number(totalAmount),
          totalItems: Number(totalItems),
          notes: notes || null,
          status: 'confirmed',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              sellingPrice: item.sellingPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
        include: { items: true },
      });

      // Decrease inventory for each item if store-based sale
      if (storeId && locationType === 'store') {
        for (const item of items) {
          await tx.inventory.update({
            where: { productId_storeId: { productId: item.productId, storeId } },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }

      return sale;
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName,
        action: 'CREATE',
        module: 'sales',
        recordId: sale.id,
        newValue: JSON.stringify({ totalAmount, totalItems, locationType }),
      },
    });

    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    console.error('Sales create error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan penjualan.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '20');
  const storeId = searchParams.get('storeId');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  try {
    const where: any = { status: 'confirmed' };

    // Employees can only see their own sales
    if (session.role === 'employee') {
      const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
      if (employee) where.employeeId = employee.id;
    }

    if (storeId && storeId !== 'all') where.storeId = storeId;
    if (dateFrom) where.saleDate = { ...where.saleDate, gte: new Date(dateFrom) };
    if (dateTo) where.saleDate = { ...where.saleDate, lte: new Date(dateTo) };

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          employee: { select: { fullName: true, employeeCode: true } },
          store: { select: { name: true, code: true } },
          bazaar: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true, articleCode: true, category: { select: { name: true } } } },
            },
          },
        },
        orderBy: { saleDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return NextResponse.json({ sales, total, page, limit });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } from 'date-fns';

export async function GET(req: NextRequest) {
  const session = await requireAuth(['owner', 'admin']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('storeId');
  const period = searchParams.get('period') || 'monthly';
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  try {
    const now = new Date();
    let start: Date, end: Date;

    if (dateFrom && dateTo) {
      start = new Date(dateFrom);
      end = new Date(dateTo);
    } else if (period === 'daily') {
      start = startOfDay(now);
      end = endOfDay(now);
    } else if (period === 'weekly') {
      start = new Date(now); start.setDate(now.getDate() - 7);
      end = endOfDay(now);
    } else if (period === 'yearly') {
      start = startOfYear(now);
      end = endOfYear(now);
    } else {
      start = startOfMonth(now);
      end = endOfMonth(now);
    }

    const whereClause: any = {
      saleDate: { gte: start, lte: end },
      status: 'confirmed',
    };
    if (storeId && storeId !== 'all') {
      whereClause.storeId = storeId;
    }

    // Today's summary
    const todaySales = await prisma.sale.aggregate({
      where: { saleDate: { gte: startOfDay(now), lte: endOfDay(now) }, status: 'confirmed' },
      _sum: { totalAmount: true, totalItems: true },
      _count: { id: true },
    });

    // Period summary
    const periodSales = await prisma.sale.aggregate({
      where: whereClause,
      _sum: { totalAmount: true, totalItems: true },
      _count: { id: true },
    });

    // YTD
    const ytdSales = await prisma.sale.aggregate({
      where: { saleDate: { gte: startOfYear(now), lte: endOfYear(now) }, status: 'confirmed' },
      _sum: { totalAmount: true },
    });

    // Sales by store (current period)
    const salesByStore = await prisma.sale.groupBy({
      by: ['storeId'],
      where: { ...whereClause, locationType: 'store' },
      _sum: { totalAmount: true, totalItems: true },
      _count: { id: true },
    });

    const storeDetails = await prisma.store.findMany({ select: { id: true, name: true, code: true } });
    const storeMap = Object.fromEntries(storeDetails.map(s => [s.id, s]));

    const salesByStoreFormatted = salesByStore.map(s => ({
      storeId: s.storeId,
      storeName: s.storeId ? storeMap[s.storeId]?.name || 'Unknown' : 'Bazaar',
      storeCode: s.storeId ? storeMap[s.storeId]?.code || '-' : 'BZR',
      totalRevenue: s._sum.totalAmount || 0,
      totalItems: s._sum.totalItems || 0,
      totalTransactions: s._count.id,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Category breakdown
    const salesByCategory = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: whereClause,
      },
      _sum: { quantity: true, totalPrice: true },
    });

    const productIds = salesByCategory.map(s => s.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    const categoryMap: Record<string, { name: string; totalQty: number; totalRevenue: number }> = {};
    for (const item of salesByCategory) {
      const product = productMap[item.productId];
      if (!product) continue;
      const catName = product.category.name;
      if (!categoryMap[catName]) categoryMap[catName] = { name: catName, totalQty: 0, totalRevenue: 0 };
      categoryMap[catName].totalQty += item._sum.quantity || 0;
      categoryMap[catName].totalRevenue += item._sum.totalPrice || 0;
    }
    const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Top products
    const topProductsRaw = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: whereClause },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductsRaw.map(p => p.productId) } },
      include: { category: true },
    });
    const topProductMap = Object.fromEntries(topProductDetails.map(p => [p.id, p]));

    const topProducts = topProductsRaw.map(p => ({
      productId: p.productId,
      articleCode: topProductMap[p.productId]?.articleCode || '-',
      name: topProductMap[p.productId]?.name || 'Unknown',
      category: topProductMap[p.productId]?.category?.name || '-',
      totalQty: p._sum.quantity || 0,
      totalRevenue: p._sum.totalPrice || 0,
    }));

    // Monthly trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const mStart = startOfMonth(subMonths(now, i));
      const mEnd = endOfMonth(subMonths(now, i));
      const mSales = await prisma.sale.aggregate({
        where: {
          saleDate: { gte: mStart, lte: mEnd },
          status: 'confirmed',
          ...(storeId && storeId !== 'all' ? { storeId } : {}),
        },
        _sum: { totalAmount: true, totalItems: true },
        _count: { id: true },
      });
      monthlyTrend.push({
        month: format(mStart, 'MMM yy'),
        monthFull: format(mStart, 'MMMM yyyy'),
        revenue: mSales._sum.totalAmount || 0,
        items: mSales._sum.totalItems || 0,
        transactions: mSales._count.id,
      });
    }

    // Active employees
    const activeEmployees = await prisma.employee.count({ where: { status: 'active' } });

    // Bazaar sales
    const bazaarSales = await prisma.sale.aggregate({
      where: { ...whereClause, locationType: 'bazaar' },
      _sum: { totalAmount: true, totalItems: true },
      _count: { id: true },
    });

    // Pending leaves
    const pendingLeaves = await prisma.leaveRequest.count({ where: { status: 'pending' } });

    // Low stock products
    const inventoryItems = await prisma.inventory.findMany({
      include: { product: true },
    });
    const stockByProduct: Record<string, { product: any; total: number }> = {};
    for (const item of inventoryItems) {
      if (!stockByProduct[item.productId]) {
        stockByProduct[item.productId] = { product: item.product, total: 0 };
      }
      stockByProduct[item.productId].total += item.quantity;
    }
    const lowStockProducts = Object.values(stockByProduct)
      .filter(s => s.total <= s.product.minStock)
      .map(s => ({
        articleCode: s.product.articleCode,
        name: s.product.name,
        totalStock: s.total,
        minStock: s.product.minStock,
      }))
      .sort((a, b) => a.totalStock - b.totalStock)
      .slice(0, 10);

    return NextResponse.json({
      today: {
        revenue: todaySales._sum.totalAmount || 0,
        items: todaySales._sum.totalItems || 0,
        transactions: todaySales._count.id,
      },
      period: {
        revenue: periodSales._sum.totalAmount || 0,
        items: periodSales._sum.totalItems || 0,
        transactions: periodSales._count.id,
      },
      ytdRevenue: ytdSales._sum.totalAmount || 0,
      salesByStore: salesByStoreFormatted,
      categoryBreakdown,
      topProducts,
      monthlyTrend,
      activeEmployees,
      bazaarSales: {
        revenue: bazaarSales._sum.totalAmount || 0,
        items: bazaarSales._sum.totalItems || 0,
        transactions: bazaarSales._count.id,
      },
      pendingLeaves,
      lowStockProducts,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
